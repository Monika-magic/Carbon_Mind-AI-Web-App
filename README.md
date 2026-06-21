# CarbonMind AI

An AI-powered web application that helps users understand, track, and reduce their carbon footprint through simple actions and personalized AI insights.

## Features

### Dashboard
- Daily carbon footprint score with visual indicators
- Weekly emissions trend chart
- Monthly statistics overview
- Carbon reduction percentage tracking
- Quick access to key metrics

### Daily Activity Tracker
Log various daily activities across 5 categories:
- **Transportation**: Car, bus, train, bicycle, walking, flights
- **Electricity**: Home electricity, renewable energy, natural gas
- **Food**: Beef, pork, chicken, fish, vegetables, fruits, dairy, plant-based
- **Shopping**: Clothing, electronics, furniture, books
- **Waste**: General waste, recycling, composting, food waste

Automatic CO2 emission calculations based on activity type and quantity.

### AI Sustainability Coach
Powered by Gemini AI:
- Personalized recommendations based on your habits
- Weekly goal suggestions
- Chat interface for sustainability questions
- Impact analysis of your activities

### Carbon Insights
- Highest emission category identification
- Improvement opportunities
- Weekly and monthly summaries
- Environmental impact comparisons

### Gamification System
- Daily streaks with tracking
- 10 eco badges to earn
- XP points for activities
- 20 sustainability levels
- Achievement system with progress tracking

### Analytics
Interactive charts showing:
- Daily emissions trends
- Weekly comparisons
- Category breakdowns
- Custom date range selection
- CSV data export

### Profile
- Personal information management
- Sustainability level display
- Lifetime CO2 saved
- Badge collection
- Goal progress tracking

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **AI**: Gemini API
- **Charts**: Recharts
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/carbonmind-ai.git
   cd carbonmind-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

4. Add your environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key (optional)
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Running Tests

```bash
# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test
```

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   ├── charts/          # Chart components
│   └── cards/           # Card components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── store/               # Zustand stores
├── types/               # TypeScript interfaces
├── lib/                 # External service integrations
├── utils/               # Utility functions
└── __tests__/           # Test files
```

## Database Schema

The application uses Supabase with the following tables:
- `profiles` - User profile data
- `activities` - Logged carbon activities
- `user_badges` - Earned badges
- `weekly_goals` - User goals
- `ai_insights` - AI-generated recommendations
- `streak_history` - Daily streak tracking

All tables have Row Level Security (RLS) enabled.

## API Endpoints

The application uses Supabase for backend services:
- Authentication: Email/password signup and login
- Database: PostgreSQL with real-time subscriptions
- Storage: User avatars (optional)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- CO2 emission factors based on IPCC and EPA data
- Design inspired by modern sustainability apps
- Icons from Lucide React

---

Made with care for our planet.
