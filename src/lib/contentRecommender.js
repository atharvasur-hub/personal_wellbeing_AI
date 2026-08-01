/**
 * Content Recommender — Frontend Thin Layer
 * All AI curation logic is handled by FastAPI backend (localhost:8000/api/recommend).
 * This file is a simple pass-through to backendApi.js with rich offline fallback.
 */
import { recommendContent } from './backendApi';

// Real YouTube videos — always available even when backend is offline (videos + article only)
const OFFLINE_FALLBACK = [
  {
    type: 'video',
    title: 'How to Learn Anything Fast — Deep Work System',
    youtubeId: 'gTaJhjQHcf8',
    url: 'https://www.youtube.com/watch?v=gTaJhjQHcf8',
    duration: '14 min',
    reason: "Why: Cal Newport's deep work framework — instantly applicable to accelerate any career goal.",
    signalScore: 97
  },
  {
    type: 'video',
    title: 'The Complete Roadmap to Becoming a Developer in 2024',
    youtubeId: 'ysEN5RaKOlA',
    url: 'https://www.youtube.com/watch?v=ysEN5RaKOlA',
    duration: '18 min',
    reason: "Why: Step-by-step structured learning path for your target role — covers tools, timelines, and priorities.",
    signalScore: 96
  },
  {
    type: 'video',
    title: 'Build Real Projects — The Only Way to Get Hired',
    youtubeId: 'QkOCbt_o2HY',
    url: 'https://www.youtube.com/watch?v=QkOCbt_o2HY',
    duration: '12 min',
    reason: "Why: Practical portfolio-building strategy to convert learning into career outcomes.",
    signalScore: 95
  },
  {
    type: 'article',
    title: 'The Feynman Technique — Learn Anything Deeply',
    youtubeId: '',
    url: 'https://fs.blog/feynman-technique/',
    duration: '6 min read',
    reason: "Why: The gold standard learning strategy — teaching others to lock in deep understanding.",
    signalScore: 93
  }
];

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
      signalScore: item.signal_score || 95,
      isGapFix: item.is_gap_fix || false
    }));
  }

  // Rich offline fallback — always playable, real YouTube content
  return OFFLINE_FALLBACK;
}
