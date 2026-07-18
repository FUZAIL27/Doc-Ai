const fetch = require('node-fetch');

class AIService {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.groqKey = process.env.GROQ_API_KEY;
    this.openrouterKey = process.env.OPENROUTER_API_KEY;
  }

  async callGemini(prompt, context = '') {
    if (!this.geminiKey) throw new Error('Gemini API key not configured');
    const fullPrompt = context ? `Context:\n${context}\n\nQuestion: ${prompt}` : prompt;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${this.geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Gemini error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async callGroq(prompt, context = '', model = 'llama3-8b-8192') {
    if (!this.groqKey) throw new Error('Groq API key not configured');
    const messages = [];
    if (context) {
      messages.push({ role: 'system', content: `You are a helpful document analysis assistant. Use this document context to answer questions:\n\n${context.substring(0, 6000)}` });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.groqKey}`
      },
      body: JSON.stringify({ model, messages, max_tokens: 2048, temperature: 0.7 })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Groq error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async callOpenRouter(prompt, context = '') {
    if (!this.openrouterKey) throw new Error('OpenRouter API key not configured');
    const messages = [];
    if (context) {
      messages.push({ role: 'system', content: `Document context:\n${context.substring(0, 6000)}` });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openrouterKey}`,
        'HTTP-Referer': 'https://docmind-ai.vercel.app'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`OpenRouter error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async generate(prompt, context = '', provider = 'gemini', userApiKeys = {}) {
    // Use user's own API keys if provided
    const origGemini = this.geminiKey;
    const origGroq = this.groqKey;
    const origOR = this.openrouterKey;

    if (userApiKeys.gemini) this.geminiKey = userApiKeys.gemini;
    if (userApiKeys.groq) this.groqKey = userApiKeys.groq;
    if (userApiKeys.openrouter) this.openrouterKey = userApiKeys.openrouter;

    try {
      if (provider === 'gemini' && this.geminiKey) {
        return await this.callGemini(prompt, context);
      } else if (provider === 'groq' && this.groqKey) {
        return await this.callGroq(prompt, context);
      } else if (provider === 'openrouter' && this.openrouterKey) {
        return await this.callOpenRouter(prompt, context);
      }
      // Fallback chain
      if (this.geminiKey) return await this.callGemini(prompt, context);
      if (this.groqKey) return await this.callGroq(prompt, context);
      if (this.openrouterKey) return await this.callOpenRouter(prompt, context);
      throw new Error('No AI provider configured. Please add an API key in Settings.');
    } finally {
      this.geminiKey = origGemini;
      this.groqKey = origGroq;
      this.openrouterKey = origOR;
    }
  }

  async summarize(content, provider, userApiKeys) {
    const prompt = `Please provide a comprehensive summary of the following document. Include: 1) Main topic and purpose, 2) Key points (bullet format), 3) Important conclusions. Keep it concise but thorough.\n\nDocument:\n${content.substring(0, 8000)}`;
    return this.generate(prompt, '', provider, userApiKeys);
  }

  async extractInsights(content, provider, userApiKeys) {
    const prompt = `Analyze this document and extract the 5-7 most important insights or findings. Format as a JSON array of strings. Return ONLY valid JSON, no other text.\n\nDocument:\n${content.substring(0, 8000)}`;
    const result = await this.generate(prompt, '', provider, userApiKeys);
    try {
      const clean = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return result.split('\n').filter(l => l.trim()).slice(0, 7);
    }
  }

  async extractKeywords(content, provider, userApiKeys) {
    const prompt = `Extract the 10-15 most important keywords and key phrases from this document. Return as a JSON array of strings ONLY, no other text.\n\nDocument:\n${content.substring(0, 8000)}`;
    const result = await this.generate(prompt, '', provider, userApiKeys);
    try {
      const clean = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return result.split(',').map(k => k.trim()).slice(0, 15);
    }
  }

  async generateTags(content, provider, userApiKeys) {
    const prompt = `Generate 5-8 smart category tags for this document (e.g., "Research", "Finance", "Technical", "Legal", etc.). Return as a JSON array of strings ONLY.\n\nDocument:\n${content.substring(0, 4000)}`;
    const result = await this.generate(prompt, '', provider, userApiKeys);
    try {
      const clean = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return ['Document', 'Analysis'];
    }
  }

  async generateNotes(content, provider, userApiKeys) {
    const prompt = `Create structured study notes from this document with: Key Concepts, Important Definitions, Main Arguments, and Action Items (if applicable). Use clear markdown formatting.\n\nDocument:\n${content.substring(0, 8000)}`;
    return this.generate(prompt, '', provider, userApiKeys);
  }

  async generateQuiz(content, provider, userApiKeys) {
    const prompt = `Create 5 multiple-choice quiz questions based on this document. Return as a JSON array where each item has: { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct": "A" }. Return ONLY valid JSON.\n\nDocument:\n${content.substring(0, 8000)}`;
    const result = await this.generate(prompt, '', provider, userApiKeys);
    try {
      const clean = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return [];
    }
  }

  async chat(message, context, history = [], provider, userApiKeys) {
    const historyText = history.slice(-6).map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`).join('\n');
    const prompt = `${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}Human: ${message}`;
    return this.generate(prompt, context, provider, userApiKeys);
  }
}

module.exports = new AIService();
