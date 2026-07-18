const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  aiProvider: { type: String, enum: ['gemini', 'groq', 'openrouter'], default: 'gemini' },
  apiKeys: {
    gemini: { type: String, default: '' },
    groq: { type: String, default: '' },
    openrouter: { type: String, default: '' }
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true }
  },
  stats: {
    totalDocuments: { type: Number, default: 0 },
    totalChats: { type: Number, default: 0 },
    totalTokensUsed: { type: Number, default: 0 }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
