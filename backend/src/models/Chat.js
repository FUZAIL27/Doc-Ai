const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  tokensUsed: { type: Number, default: 0 }
});

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  title: { type: String, default: 'New Chat' },
  messages: [messageSchema],
  totalTokens: { type: Number, default: 0 },
  aiProvider: { type: String, default: 'gemini' },
  isMultiDoc: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
