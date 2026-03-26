# 🔍 CodeScope — AI GitHub Repo Analyzer

> An AI-powered full-stack application that analyzes any GitHub repository and delivers architecture explanations, performance insights, code smell detection, and auto-generated documentation.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏗️ **Architecture Analysis** | AI maps structure, design patterns, tech stack, and data flow |
| ⚡ **Performance Insights** | Detects DB, memory, network, rendering, and algorithm issues |
| 🐛 **Code Smell Detection** | Finds anti-patterns, technical debt, with severity ratings |
| 📄 **Documentation Generator** | Creates README, API docs, setup guide, contributing guide |
| 📊 **Scoring System** | 5 quality scores: Overall, Architecture, Performance, Maintainability, Docs |
| 🔐 **Auth System** | JWT-based register/login, personal analysis history dashboard |
| 💾 **MongoDB Storage** | Persists all analyses, caches recent results (1hr TTL) |
| 🐳 **Docker Ready** | One-command setup with docker-compose |

---

## 🗂 Project Structure

```
github-analyzer/
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── analysis.controller.js  # Analysis logic
│   │   │   └── auth.controller.js      # Auth logic
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js      # JWT protection
│   │   │   └── errorHandler.js        # Global error handler
│   │   ├── models/
│   │   │   ├── User.model.js          # User schema
│   │   │   └── Analysis.model.js      # Analysis schema
│   │   ├── routes/
│   │   │   ├── analysis.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── repo.routes.js
│   │   ├── services/
│   │   │   ├── github.service.js      # GitHub API client
│   │   │   └── ai.service.js          # Anthropic AI client
│   │   ├── utils/
│   │   │   └── logger.js              # Winston logger
│   │   └── server.js                  # Express entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                  # React.js SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── analysis/
│   │   │   │   ├── ArchitectureTab.js
│   │   │   │   ├── CodeSmellsTab.js
│   │   │   │   ├── PerformanceTab.js
│   │   │   │   ├── DocumentationTab.js
│   │   │   │   ├── ScoreCard.js
│   │   │   │   └── TabStyles.css
│   │   │   ├── dashboard/
│   │   │   │   └── AnalyzingLoader.js
│   │   │   └── common/
│   │   │       └── Navbar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── hooks/
│   │   │   └── useAnalysis.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── AnalysisPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── LoginPage.js
│   │   │   └── RegisterPage.js
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── styles/
│   │   │   └── index.css           # Global CSS variables & base styles
│   │   └── App.js
│   ├── public/index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
_______
