# 🌱 CarbonMind AI
### AI-Powered Carbon Footprint Tracking & Sustainability Platform

**Understand your impact. Make greener choices. Build a sustainable future.**

CarbonMind AI is an AI-powered sustainability web application designed to help users understand, track, and reduce their carbon footprint. By combining daily activity tracking, carbon emission estimates, interactive analytics, gamification, and AI-powered sustainability recommendations, the platform encourages individuals to make environmentally conscious decisions.

<p align="center">
  <a href="https://carbon-minder-ai.lovable.app/"><strong>🌐 Live Demo</strong></a> •
  <a href="https://github.com/Monika-magic/Carbon_Mind-AI-Web-App"><strong>💻 Source Code</strong></a>
</p>

---

## 🏆 Hackathon Project

**Event:** PromptVerse — PromptWars Hackathon  
**Challenge:** Challenge 3 — Carbon Footprint Awareness Platform  
**Project:** CarbonMind AI

CarbonMind AI was developed for the challenge of making carbon footprint awareness more accessible, interactive, and actionable. The platform translates everyday activities into estimated carbon emissions and provides insights to help users identify opportunities to reduce their environmental impact.

---

## 🌍 Problem Statement

Everyday activities such as transportation, electricity consumption, food choices, shopping, and waste generation contribute to an individual's carbon footprint. However, many people lack a convenient way to understand the environmental impact of these activities and identify practical ways to reduce it.

CarbonMind AI addresses this gap through a centralized platform that helps users:

- Track daily activities that contribute to carbon emissions.
- Understand estimated emissions across different lifestyle categories.
- Identify high-impact areas through visual analytics.
- Receive personalized sustainability recommendations.
- Build environmentally responsible habits through goals, streaks, and achievements.

## 💡 Solution Overview

CarbonMind AI combines carbon footprint tracking with AI-assisted guidance and interactive progress monitoring.

Users can record their everyday activities, review estimated emissions, explore trends through charts, and receive sustainability suggestions. A gamification system encourages consistent participation, while the profile and analytics sections help users monitor their progress over time.

## ✨ Key Features

### 1. 📊 Interactive Dashboard
- Daily carbon footprint overview.
- Weekly emissions trend visualization.
- Monthly statistics and summary metrics.
- Carbon reduction progress indicators.
- Quick access to important sustainability metrics.

### 2. 📝 Daily Activity Tracker
Record everyday activities across five categories:

- **Transportation:** Cars, buses, trains, bicycles, walking, and flights.
- **Electricity:** Household electricity, renewable energy, and natural gas.
- **Food:** Meat, fish, vegetables, fruits, dairy, and plant-based food.
- **Shopping:** Clothing, electronics, furniture, and books.
- **Waste:** General waste, recycling, composting, and food waste.

The application calculates estimated CO₂ emissions using activity-specific factors and recorded quantities.

### 3. 🤖 AI Sustainability Coach
- AI-assisted sustainability guidance powered by the Gemini API.
- Personalized recommendations based on activity data.
- Sustainability questions through a conversational interface.
- Weekly goal suggestions.
- Insights into the potential impact of lifestyle changes.

### 4. 🌿 Carbon Insights
- Identification of major emission categories.
- Opportunities for improving sustainability habits.
- Weekly and monthly summaries.
- Comparisons that help users understand environmental impact.

### 5. 🏅 Gamification and Achievements
- Daily activity streak tracking.
- Eco-badges and achievement milestones.
- Experience points for recorded activities.
- Sustainability levels and progress tracking.
- Goal-oriented engagement to encourage consistent habits.

### 6. 📈 Analytics and Visualization
- Daily emissions trends.
- Weekly comparisons.
- Emission breakdowns by category.
- Custom date-range selection.
- CSV export for supported analytics data.

### 7. 👤 Personal Profile
- Personal information management.
- Sustainability level and progress.
- Lifetime carbon savings metrics.
- Earned badge collection.
- Sustainability goal tracking.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Database | Supabase / PostgreSQL |
| Authentication | Supabase Auth |
| AI Integration | Google Gemini API |
| Data Visualization | Recharts |
| State Management | Zustand |
| Routing | React Router DOM |
| Animations | Framer Motion |
| Icons | Lucide React |
| Testing | Vitest, React Testing Library |
| Database Security | Supabase Row Level Security (RLS) |

## 🏗️ System Architecture

The application uses a modular frontend architecture integrated with cloud-based backend services.

```text
User
  │
  ▼
React + TypeScript Interface
  │
  ├── Dashboard and Analytics
  ├── Daily Activity Tracker
  ├── AI Sustainability Coach
  ├── Carbon Insights
  └── Profile and Achievements
  │
  ├───────────────┐
  ▼               ▼
Supabase       Gemini API
  │               │
  ├── Auth        └── AI-powered
  ├── PostgreSQL      sustainability
  └── RLS policies    recommendations
```

**Data flow:** Users record their activities through the interface. The application calculates estimated emissions, stores supported records through Supabase, and uses the available activity information to present analytics and sustainability guidance.

## 🗂️ Project Structure

```text
Carbon_Mind-AI-Web-App/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── cards/           # Reusable card components
│   │   ├── charts/          # Data visualization components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Gemini and Supabase integrations
│   ├── pages/               # Application pages
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions and constants
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── supabase/
│   └── migrations/          # Database schema migrations
├── .env.example             # Environment variable template
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lockfile
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Test configuration
└── README.md
```

## 🚀 Getting Started

Follow these steps to run CarbonMind AI locally.

### Prerequisites

Ensure that you have installed:

- [Node.js](https://nodejs.org/) — version 18 or later.
- npm, included with Node.js.
- A [Supabase](https://supabase.com/) project.
- A Google Gemini API key if you want to use the AI functionality.

### 1. Clone the Repository

```bash
git clone https://github.com/Monika-magic/Carbon_Mind-AI-Web-App.git
cd Carbon_Mind-AI-Web-App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file.

**Windows Command Prompt:**

```cmd
copy .env.example .env
```

**macOS / Linux / Git Bash:**

```bash
cp .env.example .env
```

Open `.env` and configure the variables required by the application:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Use the variable names specified in `.env.example`. If a variable is optional for your setup, configure it according to the relevant integration.

**Security note:** Variables prefixed with `VITE_` are exposed to the browser bundle. Do not place private service-role keys or unrestricted secret API keys in frontend environment variables. For production use, route sensitive Gemini API requests through a secure backend or server-side function.

### 4. Configure Supabase

1. Create or open your Supabase project.
2. Configure the project URL and public client key in `.env`.
3. Review the SQL migration files in `supabase/migrations/`.
4. Apply the required database migrations to your Supabase project.
5. Verify that authentication and database Row Level Security policies are configured correctly.

Only apply migrations after reviewing them and confirming that they match your database setup.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL printed in your terminal, typically:

```text
http://localhost:5173
```

## 🧪 Testing and Code Quality

The project includes scripts for testing, linting, type checking, and production builds.

Run the test suite once:

```bash
npm run test:run
```

Run tests in watch mode:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Check TypeScript types:

```bash
npm run typecheck
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

These commands are available in the project configuration; successful execution should be verified in your own environment.

## 🌐 Live Deployment

Explore the deployed application:

**[Launch CarbonMind AI →](https://carbon-minder-ai.lovable.app/)**

The live demo provides an opportunity to explore the application's interface and available functionality. Features that depend on external API credentials, authentication, or backend configuration may require those services to be configured and operational.

## 🔐 Security and Privacy

CarbonMind AI integrates with external services to provide authentication, persistence, and AI-assisted features.

- Keep private API keys and database service-role credentials out of the frontend.
- Configure appropriate Supabase Row Level Security policies.
- Ensure that users can access only the records they are authorized to view or modify.
- Validate user inputs and handle API errors safely.
- Avoid logging sensitive user data or credentials.
- Review external API usage and privacy requirements before production deployment.

## 🔮 Future Enhancements

Potential improvements include:

- More granular carbon emission estimates using region-specific emission factors.
- Integration with verified environmental datasets.
- Location-aware transportation estimates, with user consent.
- Personalized sustainability challenges and goal reminders.
- Expanded export options and downloadable sustainability reports.
- Improved accessibility and multilingual support.
- Backend-mediated AI requests, usage controls, and stronger API security.
- Automated deployment checks and expanded test coverage.

These are proposed enhancements, not claims that the features are already implemented.

## 🌱 Project Impact

CarbonMind AI aims to make sustainability more understandable and actionable by connecting everyday decisions with measurable environmental indicators.

By combining activity tracking, analytics, AI-assisted recommendations, and gamified progress, the platform encourages users to move from environmental awareness toward consistent, informed action.

**The goal is simple: make every day a step toward a lower-carbon lifestyle.**

## 👩‍💻 About the Developer

**Monika Sankar** is a Computer Science and Technology undergraduate passionate about Artificial Intelligence, Machine Learning, and building technology-driven solutions to real-world problems.

- **GitHub:** [Monika-magic](https://github.com/Monika-magic)
- **LinkedIn:** [Monika Sankar](https://www.linkedin.com/in/monika-sankar/)

## 📌 Project Information

- **Project Name:** CarbonMind AI
- **Category:** AI / Sustainability / Climate Technology
- **Hackathon:** PromptVerse — PromptWars
- **Challenge:** Challenge 3 — Carbon Footprint Awareness Platform
- **Frontend:** React + TypeScript + Vite
- **Backend Services:** Supabase
- **AI Integration:** Google Gemini API
- **Live Demo:** https://carbon-minder-ai.lovable.app/
- **Repository:** https://github.com/Monika-magic/Carbon_Mind-AI-Web-App

---

<p align="center">
  <strong>Built to make sustainability measurable, understandable, and actionable. 🌍</strong>
</p>
