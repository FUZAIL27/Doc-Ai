const Chat = require('../models/Chat');
const Document = require('../models/Document');
const User = require('../models/User');
const aiService = require('../services/aiService');

exports.createChat = async (req, res) => {
  try {
    const { documentIds, title } = req.body;
    if (!documentIds || documentIds.length === 0) {
      return res.status(400).json({ error: 'At least one document required.' });
    }

    const docs = await Document.find({ _id: { $in: documentIds }, user: req.user._id });
    if (docs.length === 0) return res.status(404).json({ error: 'Documents not found.' });

    const chat = await Chat.create({
      user: req.user._id,
      documents: docs.map(d => d._id),
      title: title || `Chat: ${docs[0].title}`,
      isMultiDoc: docs.length > 1,
      aiProvider: req.user.aiProvider || 'gemini'
    });

    await Document.updateMany({ _id: { $in: documentIds } }, { $inc: { chatCount: 1 } });

    res.status(201).json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id })
      .populate('documents', 'content title');

    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
    if (!message?.trim()) return res.status(400).json({ error: 'Message required.' });

    // Build context from all documents
    const context = chat.documents.map(d =>
      `--- Document: ${d.title} ---\n${d.content.substring(0, 4000)}`
    ).join('\n\n');

    const provider = req.user.aiProvider || 'gemini';
    const userApiKeys = req.user.apiKeys || {};

    // Add user message
    chat.messages.push({ role: 'user', content: message });

    const aiResponse = await aiService.chat(
      message,
      context,
      chat.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
      provider,
      userApiKeys
    );

    chat.messages.push({ role: 'assistant', content: aiResponse, tokensUsed: 150 });
    chat.totalTokens += 150;

    // Auto-title from first message
    if (chat.messages.length === 2) {
      chat.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    }

    await chat.save();
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalChats': 1, 'stats.totalTokensUsed': 150 }
    });

    res.json({ message: { role: 'assistant', content: aiResponse } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .populate('documents', 'title fileType')
      .select('-messages')
      .sort('-updatedAt')
      .limit(50);
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id })
      .populate('documents', 'title fileType wordCount');
    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Chat deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
