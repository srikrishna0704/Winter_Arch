# ❄️ WINTER TRACKER — Interactive Digital Operating System

> **90 Days. One Version of You.**

A 90-day personal discipline, habit tracking, exact sleep logging, and goal planning operating system built with **React Native / Web (Vite + TypeScript)** and **Node.js / Express + MongoDB Atlas**.

---

## 🌟 Key Features

- 📊 **31-Day Habit Completion Matrix**: 10 customizable habit rows with 31 interactive day checkboxes.
- 🔍 **Individual Goal Detail Pages**: Dedicated action plan page for each of the 10 habits with milestones, strategies, and progress tracking.
- ⏰ **Exact Sleep Logging Matrix**: Tap any day to log exact bedtime and wake time down to the minute (`7.5 hrs`, `Restless`, `Good`, `Deep Sleep`).
- 📅 **Any-Year & Any-Month Selector**: Switch smoothly between any year (2024–2030) and any month with full database isolation.
- 🗄️ **MongoDB Atlas Persistence**: All month sheets, habit matrices, sleep entries, and reflections automatically persist to your MongoDB Atlas cluster.
- 🛡️ **Zero-Loss Month Data Preservation**: Switching months automatically saves the current sheet before loading target month data.
- ⚡ **Confirmation Modal on Reset**: Protects against accidental sheet resets with explicit user confirmation.
- ⬛ **100% Pitch-Black Fullscreen Aesthetic**: Ultra-high contrast, modern dark UI designed for zero distraction.

---

## 📁 Project Architecture

```
/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB Atlas Mongoose Connection & Hybrid Store
│   │   ├── controllers/         # Auth, Arc, Daily, Goal, Analytics, Tracker Controllers
│   │   ├── middleware/auth.js   # JWT Auth Verification
│   │   ├── routes/api.js        # REST Endpoints
│   │   ├── seed.js              # Initial Demo Data Generator
│   │   └── server.js            # Express REST API Server
│   ├── package.json
│   └── .env.example
│
├── mobile/
│   ├── src/
│   │   ├── components/          # Header, Cards, Modals, Navigation
│   │   ├── screens/             # PaperWinterTrackerScreen, GoalDetailsScreen
│   │   ├── services/api.ts      # Frontend API & Storage Integration
│   │   └── App.tsx              # Root React Native / Web App
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
└── .gitignore
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your MONGODB_URI in .env
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd mobile
npm install --legacy-peer-deps
npm run dev # or npx vite --port 3000
```
*Frontend runs on `http://localhost:3000` / `http://localhost:3001`*

---

## 🛠️ Tech Stack

- **Frontend**: React Native, React Native Web, Vite, TypeScript, Expo
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB Atlas (Mongoose)

---

## 📜 License

MIT License. Built for the Winter Arc Challenge.
