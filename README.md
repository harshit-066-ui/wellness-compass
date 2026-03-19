# 🧭 Wellness Compass

Wellness Compass is a high-performance wellness tracking and AI-driven coaching platform. It integrates scientific frameworks (**OECD Better Life Index** and **PERMA Model**) with advanced AI to provide users with a holistic view of their wellbeing and actionable, personalized habit plans.

## 🚀 Key Features

*   **Hybrid Authentication**: Supports both **Magic Link** (email only) and **Password-based** login.
*   **Auto-Registration**: Instant account creation for new users who sign up with a password.
*   **AI Wellness Coach**: A personalized coach that analyzes your OECD and PERMA scores to provide tailored advice and insights.
*   **Dynamic Habit Planner**: Generates 7-day habit plans based on your lowest-performing wellbeing domains.
*   **Advanced Analytics**: Visualizes wellbeing trends using Radar and Bar charts.
*   **Premium UI**: A sleek, dark-themed interface with glassmorphism, fluid animations, and responsive design.
*   **Strict Authenticated Access**: Complete removal of Guest Mode ensures all data is securely persisted to validated Supabase accounts.

---

## 🏗️ Project Architecture

### Backend (Node.js + Express)
The backend serves as a secure API layer, managing multi-tenant data persistence and AI orchestration.

```text
backend/
├── routes/
│   ├── aiRoutes.js         # AI Coaching & Habit Plan generation endpoints
│   ├── surveyRoutes.js     # OECD & PERMA assessment submission
│   ├── habitRoutes.js      # Daily task tracking & streak management
│   └── analyticsRoutes.js  # Historical data & trend processing
├── controllers/            # Logic handlers for all API routes
├── middleware/
│   ├── authMiddleware.js   # Supabase JWT validation & Dynamic data migration
│   └── rateLimit.js        # Security: Rate limiting for auth and AI endpoints
├── services/
│   ├── aiService.js        # OpenAI/OpenRouter integration logic
│   └── supabase.js         # Database interaction layer
└── server.js               # Entry point; Express app initialization
```

### Frontend (React + Vite)
A modern SPA built for speed, responsiveness, and visual excellence.

```text
frontend/
├── src/
│   ├── context/
│   │   ├── AuthContext.jsx # Hybrid Auth logic (Magic Link + Password + Auto-Reg)
│   │   └── GuestContext.jsx # Toast notification system & legacy cleanup
│   ├── pages/
│   │   ├── Login.jsx       # Dual-mode authentication interface
│   │   ├── Dashboard.jsx   # Holistic overview of scores and habit progress
│   │   ├── AICoach.jsx     # AI-driven interactive coaching
│   │   ├── Survey.jsx      # Scientific wellbeing assessments (OECD/PERMA)
│   │   ├── Analytics.jsx   # Deep-dive trend analysis
│   │   └── Settings.jsx    # Account management & data export
│   ├── components/
│   │   ├── SidebarNav.jsx  # Primary navigation with authenticated context
│   │   ├── ui/             # Reusable, premium UI components (GlassCard, ButtonGlow)
│   │   └── charts/         # Custom Chart.js implementations
│   ├── services/
│   │   ├── api.js          # Unified Axios client with Auth interceptors
│   │   └── supabaseClient.js # Client-side Supabase initialization
│   └── styles/             # Global theme tokens and glassmorphism CSS
```

---

## 🛠️ Getting Started

### 1. Database Setup
1.  Create a project on [Supabase](https://supabase.com/).
2.  Run the `supabase-schema.sql` script (located in the root) in the Supabase SQL Editor to initialize the tables.

### 2. Backend Configuration
1.  `cd backend`
2.  `npm install`
3.  Create a `.env` file based on `.env.example`.
4.  `npm run dev`

### 3. Frontend Configuration
1.  `cd frontend`
2.  `npm install`
3.  Create a `.env` file with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`.
4.  `npm run dev`

---

## 📜 Scientific Frameworks
*   **OECD Better Life Index**: A multidimensional framework mapping 11 domains of life quality.
*   **PERMA Model**: The five pillars of flourishing (Positive Emotion, Engagement, Relationships, Meaning, Accomplishment).

---

## 📂 Complete File Structure

```text
.
+-- backend/
|   +-- config/
|   |   +-- env.js
|   +-- controllers/
|   |   +-- aiController.js
|   |   +-- analyticsController.js
|   |   +-- habitController.js
|   |   +-- surveyController.js
|   +-- middleware/
|   |   +-- authMiddleware.js
|   |   +-- errorHandler.js
|   |   +-- rateLimiter.js
|   +-- routes/
|   |   +-- aiRoutes.js
|   |   +-- analyticsRoutes.js
|   |   +-- habitRoutes.js
|   |   +-- surveyRoutes.js
|   +-- services/
|   |   +-- aiService.js
|   |   +-- supa.js
|   +-- utils/
|   |   +-- fallbackPlans.js
|   |   +-- promptBuilder.js
|   |   +-- regexParser.js
|   |   +-- supabase.js
|   +-- .env
|   +-- .env.example
|   +-- package-lock.json
|   +-- package.json
|   +-- server.js
+-- frontend/
|   +-- public/
|   |   +-- favicon.svg
|   |   +-- icons.svg
|   +-- src/
|   |   +-- assets/
|   |   |   +-- hero.png
|   |   |   +-- react.svg
|   |   |   +-- vite.svg
|   |   +-- charts/
|   |   |   +-- BarChart.jsx
|   |   |   +-- RadarChart.jsx
|   |   +-- components/
|   |   |   +-- charts/
|   |   |   |   +-- BarPERMA.jsx
|   |   |   |   +-- HabitCompletion.jsx
|   |   |   |   +-- index.js
|   |   |   |   +-- RadarOECD.jsx
|   |   |   |   +-- TrendLine.jsx
|   |   |   +-- ui/
|   |   |   |   +-- ButtonGlow.jsx
|   |   |   |   +-- ErrorCard.jsx
|   |   |   |   +-- GlassCard.jsx
|   |   |   |   +-- index.js
|   |   |   |   +-- LoadingSpinner.jsx
|   |   |   |   +-- Toast.jsx
|   |   |   +-- Card.jsx
|   |   |   +-- Layout.jsx
|   |   |   +-- Loader.jsx
|   |   |   +-- MeshBackground.jsx
|   |   |   +-- Sidebar.jsx
|   |   |   +-- SidebarNav.jsx
|   |   |   +-- Toast.jsx
|   |   +-- constants/
|   |   |   +-- config.js
|   |   |   +-- surveySchemas.js
|   |   +-- context/
|   |   |   +-- AppContext.jsx
|   |   |   +-- AuthContext.jsx
|   |   |   +-- GuestContext.jsx
|   |   +-- data/
|   |   |   +-- oecdQuestions.js
|   |   |   +-- permaQuestions.js
|   |   +-- hooks/
|   |   |   +-- useSurvey.js
|   |   +-- pages/
|   |   |   +-- AICoach.jsx
|   |   |   +-- Analytics.jsx
|   |   |   +-- Dashboard.jsx
|   |   |   +-- Login.jsx
|   |   |   +-- Settings.jsx
|   |   |   +-- Survey.jsx
|   |   +-- services/
|   |   |   +-- ai.js
|   |   |   +-- api.js
|   |   |   +-- storage.js
|   |   |   +-- supabaseClient.js
|   |   +-- styles/
|   |   |   +-- global.css
|   |   |   +-- globals.css
|   |   |   +-- variables.css
|   |   +-- utils/
|   |   |   +-- helpers.js
|   |   |   +-- user.js
|   |   +-- App.jsx
|   |   +-- main.jsx
|   +-- .env
|   +-- .gitignore
|   +-- eslint.config.js
|   +-- index.html
|   +-- package-lock.json
|   +-- package.json
|   +-- README.md
|   +-- vite.config.js
+-- .gitignore
+-- README.md
+-- supabase-schema.sql
```
