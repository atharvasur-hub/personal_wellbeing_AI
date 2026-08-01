/**
 * Content Recommender — Frontend Thin Layer
 * All AI curation logic is handled by FastAPI backend (localhost:8000/api/recommend).
 * This file is a simple pass-through to backendApi.js.
 */
import { recommendContent } from './backendApi';

/**
 * Fetch 4 AI-curated recommendations (Video, Short, Reel, Article) for a goal.
 * @param {string} goalText
 * @param {string} userId
 * @returns {Array} - 4 content items
 */
export async function fetchAIRecommendations(goalText, userId = null) {
  const result = await recommendContent(goalText, 'focused', userId);

  if (result?.items && result.items.length >= 4) {
    // Normalize snake_case (Python) → camelCase (React)
    return result.items.map(item => ({
      type: item.type,
      title: item.title,
      youtubeId: item.youtube_id || '',
      url: item.url,
      duration: item.duration,
      reason: item.reason,
      signalScore: item.signal_score || 95
    }));
  }

  // Offline fallback — show placeholder cards
  return [
    { type: 'video',   title: 'Backend offline — start FastAPI server', youtubeId: '', url: '#', duration: '—', reason: 'Run: cd backend && uvicorn main:app --reload --port 8000', signalScore: 0 },
    { type: 'short',   title: 'Add GEMINI_API_KEY to backend/.env',     youtubeId: '', url: '#', duration: '—', reason: 'Get your free key at aistudio.google.com/app/apikey',        signalScore: 0 },
    { type: 'reel',    title: 'Then restart both servers',               youtubeId: '', url: '#', duration: '—', reason: 'npm run dev (frontend) + uvicorn main:app (backend)',         signalScore: 0 },
    { type: 'article', title: 'Full setup guide in README.md',           youtubeId: '', url: '#', duration: '—', reason: 'See backend/requirements.txt for dependencies',               signalScore: 0 }
  ];
}
