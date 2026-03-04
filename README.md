# 🌸 SoulSpace

> *A safe space to understand yourself, grow every day, and never feel alone.*

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg)](https://opensource.org/licenses/MIT)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://react.dev)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://mongodb.com)

---

## 🧠 What is SoulSpace?

Mental health affects **1 in 4 people** globally, yet most individuals — especially students and young adults — never seek help. The reasons are familiar: stigma, cost, lack of awareness, and the belief that their struggles aren't "serious enough" to deserve professional support.

**SoulSpace** was built to meet people where they are.

It is a free, accessible, and judgment-free mental wellness platform designed for everyday people who want to understand their emotional health, build better habits, and find support — without the pressure of a clinical setting. Whether you are dealing with exam stress, sleep trouble, anxiety, or just need someone (or something) to talk to at 2 AM, SoulSpace is there.

The platform combines **clinical screening tools, AI-powered emotional support, daily wellness habits, and a therapist locator** into a single, compassionate experience — available entirely through a web browser, at no cost.

---

## 💡 Why SoulSpace? — The Problem We're Solving

Mental healthcare in India and across the developing world faces a crisis of accessibility:

- The **therapist-to-population ratio** in India is approximately **1 per 100,000 people** (WHO, 2023)
- Over **80% of people** with mental health conditions in low-income countries receive no treatment at all
- Young people aged 15–24 are among the most affected, yet the least likely to seek formal help
- Existing mental health apps are either **expensive, clinical in tone, or fail to retain users** because they feel like homework rather than self-care

SoulSpace addresses these gaps by making mental wellness **approachable, engaging, and free**.

---

## 🌟 What Makes SoulSpace Different?

Most mental health apps fall into one of two traps — they are either too clinical (cold, form-heavy, medicalized) or too superficial (generic quotes and breathing timers). SoulSpace takes a third path.

### 🎮 Gamified Wellness — Not Just an App, a Journey
The **Soul Garden** feature transforms mental health habits into a living, rewarding experience. Users earn streak points for daily check-ins, journaling, and wellness activities. Those points can be spent adopting and caring for a **virtual pet** — a small companion whose health reflects the user's own consistency. Miss two days of self-care, and the pet leaves. Come back, and it grows. This emotional stakes mechanism creates **genuine motivation** that clinical reminders never could.

### 🤝 Built Around Empathy, Not Efficiency
Every word in SoulSpace — from the chatbot's responses to the button labels — was written with one question in mind: *does this make the user feel safe?* The AI companion uses principles of **Unconditional Positive Regard (UCPR)**, a framework from humanistic psychology, to ensure users are never judged, dismissed, or made to feel their problems are too small.

### 🪪 Anonymity Without Isolation
The community review system lets users share their experiences with the platform anonymously — generating personality-based pseudonyms like "Calm Sparrow" or "Gentle River" instead of exposing real names. Users feel part of a community without sacrificing privacy.

### 🗺 Free Therapist Discovery
Unlike apps that upsell paid therapy sessions, SoulSpace's therapist finder uses completely free, open-source map data (OpenStreetMap + Overpass API) to help users locate real mental health professionals near them — no account, no fee, no API key required.

### 🇮🇳 Built for India First
The crisis helpline system includes **5 verified Indian mental health helplines** (Tele MANAS, KIRAN, iCALL, AASRA, SNEHA) — accessible even before a user logs in. The app is designed with India's mental health infrastructure and cultural context in mind, while remaining universally accessible.

---

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🧪 **Clinical Screenings** | PHQ-9 (Depression), GAD-7 (Anxiety), PSS-10 (Stress) — clinically validated self-assessment tools |
| 🧩 **Aptitude Test (DAT)** | Differential Aptitude Test with live timer, section breakdown, and answer review |
| 📚 **Mental Health Care Hub** | Curated resources — micro-courses, podcasts, exercises, and tips for Sleep, Anxiety, Stress, and Low Mood |
| 📊 **Mood Tracker** | Daily emoji-based mood logging with optional menstrual cycle phase correlation and history charts |
| 💬 **AI Companion (ChatBot)** | Empathetic AI support powered by GPT-4o-mini via OpenRouter, with automatic fallback and retry logic |
| 🌱 **Soul Garden** | Gamified daily wellness hub — streaks, journaling, doodling, stress games, and virtual pet adoption |
| ⭐ **Community Reviews** | Anonymous star-rating and review system with live statistics and a star distribution chart |
| 🗺 **Therapist Finder** | Free map-based locator using OpenStreetMap data — no account or API key needed |
| 🆘 **Emergency Support** | One-click access to 5 Indian crisis helplines, available before and after login |

---

## 🚀 Running SoulSpace Locally

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://npmjs.com/) v9 or higher
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works perfectly)
- An [OpenRouter](https://openrouter.ai/) API key (free tier available) for the AI chatbot

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/soulspace.git
cd soulspace
```

---

### 2. Set Up the Backend

```bash
# Navigate to the backend directory
cd soulback

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Open `.env` and fill in your values:

```env
mongo_url=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/soulspace
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
# Start the backend server
node server.js
```

You should see:
```
MongoDB connected
Server started on port 5000
```

---

### 3. Set Up the Frontend

Open a **new terminal** and run:

```bash
# Navigate to the frontend directory
cd myapp

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Leave empty for local development (Vite proxy handles /api routing)
VITE_API_URL=

# Your OpenRouter API key for the AI chatbot
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```bash
# Start the frontend dev server
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

### 4. Open the App

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

Register a new account and you're in. 🌸

---



---

## 💪 Strengths of SoulSpace

- **Zero cost to users** — no paywalls, no premium tiers, no upsells
- **Works without a therapist** — self-help tools are genuinely useful standalone
- **Privacy-first** — no real names in reviews, no data sold, minimal data collected
- **Resilient design** — all tests have hardcoded fallbacks; the app works even if the database is empty
- **India-specific crisis support** — verified helpline numbers always accessible, even pre-login
- **No vendor lock-in** — built entirely on open-source tools; the AI model can be swapped in minutes
- **Mobile-friendly** — responsive layout, touch-enabled canvas doodle pad, hamburger navigation
- **Clinically grounded** — PHQ-9, GAD-7, and PSS-10 are internationally validated screening instruments used by healthcare professionals worldwide

---

## 🛠 Tech Stack

**Frontend:** React 19 · Vite 7 · React Router DOM · Leaflet.js · HTML5 Canvas · Custom CSS

**Backend:** Node.js · Express 5 · MongoDB · Mongoose · bcryptjs · JSON Web Tokens

**External APIs:** OpenRouter (GPT-4o-mini) · Nominatim (OpenStreetMap) · Overpass API · Leaflet CDN

---

## 👥 Contributors

SoulSpace was designed and built as a collaborative student project at **TKM College of Engineering, Kollam, Kerala**.

| Name | Role |
|------|------|
| Sahala Salam | Frontend — Tests & Mental Health Care |
| Amrah K S | Frontend — Mood Tracker, ChatBot |
| Aarya Tejaswini J | Frontend — Home Shell, Soul Garden |
| Malavika M | Frontend - Therapist Finder, Reviews, Auth |
| A C Govardhan | Full Stack / Backend Engineering |

---

## 🙏 Acknowledgements

- [PHQ-9 & GAD-7](https://www.phqscreeners.com/) — Developed by Drs. Robert L. Spitzer and Janet B.W. Williams. Free for unrestricted use.
- [PSS-10](https://www.mindgarden.com/132-perceived-stress-scale) — Developed by Sheldon Cohen et al.
- [OpenStreetMap Contributors](https://www.openstreetmap.org/) — Map data licensed under ODbL
- [Tele MANAS](https://telemanas.mohfw.gov.in/), [KIRAN](https://www.nimhans.ac.in/), [iCALL/TISS](https://icallhelpline.org/), [AASRA](http://www.aasra.info/), [SNEHA](https://sneha-india.org/) — Indian mental health helpline providers
- OpenRouter for providing the llm model for chatbot.

---

## ⚠️ Disclaimer

SoulSpace is a wellness support tool and is **not a substitute for professional mental health care**. The screening tools (PHQ-9, GAD-7, PSS-10) are for awareness only and do not constitute a medical diagnosis. If you are in crisis, please contact one of the emergency helplines listed in the app or consult a qualified mental health professional.

---

<p align="center">Made with 💙 for everyone who needed this and couldn't find it.</p>
