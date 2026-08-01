# Personal Wellbeing AI (Synapse AI)

**Personal Wellbeing AI** is a comprehensive ecosystem designed to help you track, manage, and optimize your digital habits, focus levels, and overall wellbeing. By shifting passive consumption (doomscrolling) into active, goal-oriented creation, the application acts as a digital guardian and growth accelerator.

---

## 🏗 System Architecture

The project consists of multiple interconnected services:

### 1. Frontend Web Dashboard (`/src`)
- **Tech Stack**: React 19, Vite, TailwindCSS v4, Recharts
- **Description**: The primary interface for tracking your journey. It provides a visual representation of your progress (XP, levels), focus sprints, and AI-curated feeds tailored to your career aspirations.

### 2. FastAPI Backend Engine (`/backend`)
- **Tech Stack**: Python, FastAPI, Google Generative AI, Uvicorn
- **Description**: The intelligence layer. It hosts API endpoints for managing ML models, data curation, habit steering algorithms, and interacts seamlessly with the Supabase database.

### 3. Database & Auth (Supabase)
- **Tech Stack**: Supabase (PostgreSQL)
- **Description**: The single source of truth handling user authentication, tracking metrics, and persisting focus sessions across all platforms. (See `supabase_schema.sql` for the schema structure).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Supabase account/project
- Google Generative AI API key

### Running the Frontend
1. Navigate to the root directory.
2. Install dependencies: `npm install`
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at `http://localhost:5173/`.

### Running the Backend
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn google-generativeai supabase python-dotenv pydantic
   ```
3. Run the FastAPI engine:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
4. API documentation is available at `http://localhost:8000/docs`.

---

## 🧠 Core Concepts

- **Focus Sprints:** Uninterrupted blocks of work.
- **Identity Graph:** AI-curated feeds matching your skills and career aspirations instead of mind-numbing social media.
- **Journey Map:** A trajectory of your growth, visually transitioning you from baseline metrics to peak mastery (10/10 focus autonomy).
- **Community Hub & Leaderboard:** Connect with others on the same journey, share progress, and compete to achieve your wellbeing goals.
