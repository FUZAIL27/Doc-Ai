# DocMind AI 🧠

A production-ready AI Document Reader SaaS — upload PDFs, DOCX, and TXT files and chat with them using free AI models (Google Gemini, Groq, OpenRouter).

---

## 🚀 Features

- **Authentication**: JWT signup/login/forgot-password
- **Document Management**: Upload, delete, search, view documents (PDF, DOCX, TXT)
- **AI Features**: Summarization, key insights, keyword extraction, smart tags, notes, quiz generation, document chat, multi-document chat
- **Analytics Dashboard**: Upload stats, document analytics, AI usage, activity timeline
- **Premium UI**: Dark mode, glassmorphism, Framer Motion animations

---

## 🛠 Tech Stack

| Layer      | Stack                                      |
|------------|--------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend    | Node.js, Express.js                        |
| Database   | MongoDB Atlas                              |
| Auth       | JWT                                        |
| AI         | Google Gemini API, Groq API, OpenRouter    |

---

## 📁 Project Structure

```
docmind-ai/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # All page components
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Sidebar, Header, Layout
│   │   │   └── ui/         # Modal, Badge, Skeleton
│   │   ├── store/          # Zustand auth store
│   │   └── utils/          # API client, helpers
│   └── ...
└── backend/                # Node.js + Express API
    └── src/
        ├── controllers/    # Auth, Documents, Chat
        ├── models/         # User, Document, Chat (Mongoose)
        ├── routes/         # Express routers
        ├── services/       # AI service, document parser
        └── middleware/     # JWT auth middleware
```

---

## ⚙️ Environment Setup

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/docmind
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🔑 Getting Free API Keys

### Google Gemini (Recommended — most generous free tier)
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key to `GEMINI_API_KEY`

**Free limits**: 15 requests/min, 1,500 requests/day, 1M tokens/day

### Groq (Fastest inference)
1. Visit https://console.groq.com/keys
2. Create account → API Keys → Create
3. Copy the key to `GROQ_API_KEY`

**Free limits**: 30 requests/min, 14,400 requests/day

### OpenRouter (Fallback)
1. Visit https://openrouter.ai/keys
2. Sign up → Create Key
3. Copy the key to `OPENROUTER_API_KEY`

**Free models**: Mistral 7B Instruct (free tier available)

---

## 🏃 Running Locally

### 1. Clone and install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in your .env values

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
```

### 2. Start development servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Open browser
Visit http://localhost:5173

---

## 🚀 Deployment

### Backend → Render.com

1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your repo, select `backend/` as root
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add all environment variables in Render dashboard
7. Deploy → Copy the URL

### Frontend → Vercel

1. Go to https://vercel.com → New Project
2. Import your repo, set root to `frontend/`
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy → Copy the URL
5. Update backend `FRONTEND_URL` on Render

### Database → MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP `0.0.0.0/0` for Render
5. Copy connection string → set as `MONGODB_URI`

---

## 📝 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/forgot-password | Request reset |
| POST | /api/auth/reset-password | Reset password |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/documents/upload | Upload file |
| GET | /api/documents | List documents |
| GET | /api/documents/:id | Get document |
| PUT | /api/documents/:id | Update document |
| DELETE | /api/documents/:id | Delete document |
| POST | /api/documents/:id/analyze | Run AI analysis |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Create chat |
| GET | /api/chat | List chats |
| GET | /api/chat/:id | Get chat + messages |
| POST | /api/chat/:id/message | Send message |
| DELETE | /api/chat/:id | Delete chat |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/dashboard | Dashboard stats |

---

## 🔒 Security Features

- JWT authentication with expiry
- Bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min)
- Helmet.js security headers
- CORS restricted to frontend URL
- File type validation on upload
- User-scoped data access

---

## 📄 License

MIT License — free for personal and commercial use.
