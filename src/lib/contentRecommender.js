/**
 * AI-Powered Content Recommender
 * Priority chain:
 *   1. FastAPI backend (localhost:8000/api/recommend)  ← PRIMARY
 *   2. Direct Gemini API (browser)                     ← FALLBACK
 *   3. Keyword-based static curations                  ← OFFLINE
 */
import { GoogleGenAI } from '@google/genai';
import { recommendContent } from './backendApi';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const isKeyConfigured =
  GEMINI_API_KEY &&
  GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' &&
  GEMINI_API_KEY.length > 10;

const ai = isKeyConfigured ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;


// -----------------------------------------------------------------
// HELPER: Curate 4 static recommendations for a given goal keyword
// Used as fallback when Gemini API is not configured.
// -----------------------------------------------------------------
function getStaticRecommendations(goalText = '') {
  const lower = goalText.toLowerCase();

  // REACT / FRONTEND
  if (lower.includes('react') || lower.includes('hooks') || lower.includes('frontend')) {
    return [
      {
        type: 'video',
        title: 'React useEffect Explained – Full Dependency Array Deep Dive',
        youtubeId: 'SqcY0GlETPk',
        url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
        duration: '14 min',
        reason: 'Covers every edge-case of useEffect memory leaks and stale closures — directly aligned with your goal.'
      },
      {
        type: 'short',
        title: 'useState vs useReducer in 60 Seconds',
        youtubeId: 'bFRDIBR9zM8',
        url: 'https://www.youtube.com/shorts/bFRDIBR9zM8',
        duration: '60 sec',
        reason: '60-second micro-refresher on the most commonly confused React hooks.'
      },
      {
        type: 'reel',
        title: 'React Reconciler Algorithm Visualised (Reel)',
        youtubeId: 'TNhaISOUy6Q',
        url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
        duration: '45 sec',
        reason: 'Visual animation of React diffing — high retention, low cognitive load.'
      },
      {
        type: 'article',
        title: 'A Complete Guide to useEffect – Overreacted (Dan Abramov)',
        url: 'https://overreacted.io/a-complete-guide-to-useeffect/',
        duration: '8 min read',
        reason: 'The gold standard deep-dive article — foundational mental model for your React goal.'
      }
    ];
  }

  // MACHINE LEARNING / AI
  if (lower.includes('machine learning') || lower.includes('ml') || lower.includes('neural') || lower.includes('ai') || lower.includes('python')) {
    return [
      {
        type: 'video',
        title: 'Neural Networks from Scratch in Python – Andrej Karpathy',
        youtubeId: 'VMj-3S1tku0',
        url: 'https://www.youtube.com/watch?v=VMj-3S1tku0',
        duration: '25 min',
        reason: 'World-class foundational walkthrough of backpropagation from Karpathy — ideal for your ML goal.'
      },
      {
        type: 'short',
        title: 'Gradient Descent Explained in 60 Seconds',
        youtubeId: 'IHZwWFHWa-w',
        url: 'https://www.youtube.com/shorts/IHZwWFHWa-w',
        duration: '60 sec',
        reason: 'Instant gradient descent mental model — quick review before going into deeper practice.'
      },
      {
        type: 'reel',
        title: 'How a Neural Network Learns (Animated Reel)',
        youtubeId: 'aircAruvnKk',
        url: 'https://www.youtube.com/watch?v=aircAruvnKk',
        duration: '45 sec',
        reason: 'Stunning visual animation of neural net weight updates — excellent visual recall.'
      },
      {
        type: 'article',
        title: 'The Illustrated Transformer – Jay Alammar',
        url: 'https://jalammar.github.io/illustrated-transformer/',
        duration: '12 min read',
        reason: 'The best single article for understanding attention mechanisms and transformer architecture.'
      }
    ];
  }

  // SYSTEM DESIGN / BACKEND
  if (lower.includes('system design') || lower.includes('backend') || lower.includes('microservice') || lower.includes('distributed')) {
    return [
      {
        type: 'video',
        title: 'System Design Interview – Step By Step Guide',
        youtubeId: 'i7twT3x5yv8',
        url: 'https://www.youtube.com/watch?v=i7twT3x5yv8',
        duration: '20 min',
        reason: 'Structured walkthrough of scalable architecture decisions aligned with your system design goal.'
      },
      {
        type: 'short',
        title: 'CAP Theorem in 60 Seconds',
        youtubeId: 'p4BpE5Ur4H0',
        url: 'https://www.youtube.com/shorts/p4BpE5Ur4H0',
        duration: '60 sec',
        reason: 'Instant recall of the CAP theorem trade-offs — core to distributed system design.'
      },
      {
        type: 'reel',
        title: 'Load Balancer Explained (Animated Reel)',
        youtubeId: 'K0Ta65OqQkY',
        url: 'https://www.youtube.com/watch?v=K0Ta65OqQkY',
        duration: '45 sec',
        reason: 'Fast animated visual of load balancing strategies — effortless retention.'
      },
      {
        type: 'article',
        title: 'Designing Data-Intensive Applications – Key Chapter Summary',
        url: 'https://martin.kleppmann.com/2016/02/08/how-to-visualize-a-distributed-system.html',
        duration: '10 min read',
        reason: 'Foundational mental model for data-intensive system design — high signal-to-noise ratio.'
      }
    ];
  }

  // FITNESS / WELLBEING
  if (lower.includes('fitness') || lower.includes('health') || lower.includes('sleep') || lower.includes('wellbeing') || lower.includes('habit')) {
    return [
      {
        type: 'video',
        title: 'Huberman Lab – Master Your Sleep & Be More Alert When Awake',
        youtubeId: 'nm1TxQj9IsQ',
        url: 'https://www.youtube.com/watch?v=nm1TxQj9IsQ',
        duration: '18 min',
        reason: 'Evidence-based sleep protocol from Stanford Neuroscience — directly aligned with your wellbeing goal.'
      },
      {
        type: 'short',
        title: '5 Habits That Changed My Life in 60 Seconds',
        youtubeId: 'GgzrRkS-SE0',
        url: 'https://www.youtube.com/shorts/GgzrRkS-SE0',
        duration: '60 sec',
        reason: 'High-impact micro-habit audit — quick actionable reset.'
      },
      {
        type: 'reel',
        title: 'Morning Sunlight Routine Reel – Why It Works',
        youtubeId: 'LzBtBe2GQBM',
        url: 'https://www.youtube.com/watch?v=LzBtBe2GQBM',
        duration: '45 sec',
        reason: 'Animated neuroscience visual of how morning light resets cortisol and circadian rhythm.'
      },
      {
        type: 'article',
        title: 'Atomic Habits — The 1% Rule for Compounding Growth',
        url: 'https://jamesclear.com/atomic-habits',
        duration: '7 min read',
        reason: 'The highest-leverage habit framework — applies directly to every area of your wellbeing goal.'
      }
    ];
  }

  // DEFAULT / GENERIC GROWTH
  return [
    {
      type: 'video',
      title: 'Deep Work – How to Achieve Peak Performance',
      youtubeId: 'gTaJhjQHcf8',
      url: 'https://www.youtube.com/watch?v=gTaJhjQHcf8',
      duration: '14 min',
      reason: 'Cal Newport deep work framework — directly boosts ability to reach your goal faster.'
    },
    {
      type: 'short',
      title: 'The 5-Second Rule in 60 Seconds',
      youtubeId: 'k2TaFVANNTg',
      url: 'https://www.youtube.com/shorts/k2TaFVANNTg',
      duration: '60 sec',
      reason: 'Instant motivation trigger mechanism — activates momentum toward your goal.'
    },
    {
      type: 'reel',
      title: 'Flow State Activation Reel – Get Into Deep Focus',
      youtubeId: 'QkOCbt_o2HY',
      url: 'https://www.youtube.com/watch?v=QkOCbt_o2HY',
      duration: '45 sec',
      reason: 'Visual guide to entering a flow state — primes your brain for high-yield learning sessions.'
    },
    {
      type: 'article',
      title: 'The Feynman Technique – Learn Anything Faster',
      url: 'https://fs.blog/feynman-technique/',
      duration: '6 min read',
      reason: 'The best learning strategy for your goal — explains through teaching to lock in understanding.'
    }
  ];
}

// -----------------------------------------------------------------
// MAIN EXPORT: Fetch 4 AI-curated recommendations for a user goal
// Priority: FastAPI backend → Direct Gemini → Static fallback
// -----------------------------------------------------------------
export async function fetchAIRecommendations(goalText, userId = null) {

  // ── 1. TRY FASTAPI BACKEND (localhost:8000/api/recommend) ──
  try {
    const backendResult = await recommendContent(goalText, 'focused', userId);
    if (backendResult?.items && backendResult.items.length >= 4) {
      console.log('[ContentRecommender] ✅ Using FastAPI backend recommendations');
      // Normalize snake_case backend fields to camelCase for frontend cards
      return backendResult.items.map(item => ({
        type: item.type,
        title: item.title,
        youtubeId: item.youtube_id || '',
        url: item.url,
        duration: item.duration,
        reason: item.reason,
        signalScore: item.signal_score || 95
      }));
    }
  } catch {
    // Backend offline — proceed to direct Gemini
  }

  // ── 2. DIRECT GEMINI API (browser-side) ──────────────────
  if (ai) {

    try {
      const prompt = `
You are an expert learning curator AI. A user has stated the following goal:

"${goalText}"

Your task: Recommend exactly 4 pieces of content that will DIRECTLY help them achieve this goal.
Return ONLY a valid JSON array with exactly 4 objects, no markdown, no explanation. Each object must have:
- "type": one of "video", "short", "reel", "article"
- "title": concise descriptive title (max 10 words)
- "youtubeId": a REAL 11-character YouTube video ID (leave empty string "" for articles)
- "url": full URL to the resource
- "duration": e.g. "12 min" or "60 sec" or "8 min read"
- "reason": one sentence explaining exactly why this helps their specific goal (start with "Why: ")

Rules:
1. Item 1 must be type "video" (a full YouTube tutorial video, 5-20 min)
2. Item 2 must be type "short" (a YouTube Short, under 60 sec)
3. Item 3 must be type "reel" (a short-form video reel or YouTube Short, under 60 sec)
4. Item 4 must be type "article" (a high-quality written article or documentation)
5. All YouTube IDs must be real and directly relevant to the goal
6. For articles, youtubeId must be empty string ""

Return ONLY the JSON array, nothing else.
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.3 }
      });

      const rawText = response.text?.trim() || '';
      // Strip markdown code fences if present
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed) && parsed.length >= 4) {
        return parsed.slice(0, 4);
      }
    } catch (err) {
      console.warn('Gemini recommendation fetch failed, using curated fallback:', err.message);
    }
  }

  // Fallback: Static curated recommendations based on goal keywords
  return getStaticRecommendations(goalText);
}
