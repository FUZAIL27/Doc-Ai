const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  originalName: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx', 'txt'], required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  content: { type: String, required: true },
  wordCount: { type: Number, default: 0 },
  pageCount: { type: Number, default: 0 },
  summary: { type: String, default: '' },
  keyInsights: [{ type: String }],
  keywords: [{ type: String }],
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  status: { type: String, enum: ['processing', 'ready', 'error'], default: 'processing' },
  aiAnalyzed: { type: Boolean, default: false },
  chatCount: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now },
  isFavorite: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ user: 1, title: 'text', content: 'text' });

module.exports = mongoose.model('Document', documentSchema);
