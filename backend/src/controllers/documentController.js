const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const User = require('../models/User');
const { parseDocument } = require('../services/documentParser');
const aiService = require('../services/aiService');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF, DOCX, and TXT files allowed'), false);
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);
    const title = req.body.title || req.file.originalname.replace(/\.[^.]+$/, '');

    // Parse document
    const parsed = await parseDocument(req.file.path, fileType);

    const doc = await Document.create({
      user: req.user._id,
      title,
      originalName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      filePath: req.file.path,
      content: parsed.content,
      wordCount: parsed.wordCount,
      pageCount: parsed.pageCount,
      status: 'ready'
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalDocuments': 1 } });

    // Auto-analyze in background
    analyzeDocumentAsync(doc._id, req.user);

    res.status(201).json({ document: doc });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
};

async function analyzeDocumentAsync(docId, user) {
  try {
    const doc = await Document.findById(docId);
    if (!doc) return;

    const provider = user.aiProvider || 'gemini';
    const userApiKeys = user.apiKeys || {};

    const [summary, insights, keywords, tags] = await Promise.allSettled([
      aiService.summarize(doc.content, provider, userApiKeys),
      aiService.extractInsights(doc.content, provider, userApiKeys),
      aiService.extractKeywords(doc.content, provider, userApiKeys),
      aiService.generateTags(doc.content, provider, userApiKeys)
    ]);

    await Document.findByIdAndUpdate(docId, {
      summary: summary.status === 'fulfilled' ? summary.value : '',
      keyInsights: insights.status === 'fulfilled' ? insights.value : [],
      keywords: keywords.status === 'fulfilled' ? keywords.value : [],
      tags: tags.status === 'fulfilled' ? tags.value : [],
      aiAnalyzed: true
    });
  } catch (err) {
    console.error('Background analysis error:', err.message);
  }
}

exports.getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, sort = '-createdAt' } = req.query;
    const query = { user: req.user._id, isArchived: false };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (type) query.fileType = type;

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .select('-content')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ documents, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    
    doc.lastAccessed = new Date();
    await doc.save({ validateBeforeSave: false });
    
    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await doc.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalDocuments': -1 } });

    res.json({ message: 'Document deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.analyzeDocument = async (req, res) => {
  try {
    const { action } = req.body;
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    const provider = req.user.aiProvider || 'gemini';
    const userApiKeys = req.user.apiKeys || {};
    let result;

    switch (action) {
      case 'summarize':
        result = await aiService.summarize(doc.content, provider, userApiKeys);
        await Document.findByIdAndUpdate(doc._id, { summary: result });
        break;
      case 'insights':
        result = await aiService.extractInsights(doc.content, provider, userApiKeys);
        await Document.findByIdAndUpdate(doc._id, { keyInsights: result });
        break;
      case 'keywords':
        result = await aiService.extractKeywords(doc.content, provider, userApiKeys);
        await Document.findByIdAndUpdate(doc._id, { keywords: result });
        break;
      case 'notes':
        result = await aiService.generateNotes(doc.content, provider, userApiKeys);
        await Document.findByIdAndUpdate(doc._id, { notes: result });
        break;
      case 'quiz':
        result = await aiService.generateQuiz(doc.content, provider, userApiKeys);
        break;
      case 'tags':
        result = await aiService.generateTags(doc.content, provider, userApiKeys);
        await Document.findByIdAndUpdate(doc._id, { tags: result });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalTokensUsed': 100 } });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { title, notes, isFavorite, tags } = req.body;
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { title, notes, isFavorite, tags } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
