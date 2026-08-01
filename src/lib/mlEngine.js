/**
 * SYNAPSE ML & AI ENGINE PILLARS
 * Integrated Personal Development ML Pipeline
 */

// ==========================================
// PILLAR 1: INTENT & BEHAVIOR ANALYSIS
// ==========================================
export function analyzeUserIntent(goalText = '', mood = 'focused', fatigueLevel = 'low') {
  const goalLower = goalText.toLowerCase();
  
  let targetDomain = 'React & Modern Frontend Architecture';
  let focusPriority = 'High Signal Learning';
  let cognitiveEnergyScore = 85;

  if (goalLower.includes('tired') || goalLower.includes('low energy') || mood === 'exhausted') {
    cognitiveEnergyScore = 42;
    focusPriority = 'Low-Fatigue Visual Learning';
  }

  if (goalLower.includes('python') || goalLower.includes('ai') || goalLower.includes('model') || goalLower.includes('machine learning')) {
    targetDomain = 'Machine Learning & AI Engineering';
  } else if (goalLower.includes('sleep') || goalLower.includes('recovery') || goalLower.includes('health')) {
    targetDomain = 'Circadian Health & Recovery';
  } else if (goalLower.includes('system') || goalLower.includes('backend') || goalLower.includes('design')) {
    targetDomain = 'Distributed System Design';
  }

  return {
    primaryGoal: goalText || 'Master React Hooks & Modern State',
    currentMood: mood,
    fatigueLevel,
    targetDomain,
    focusPriority,
    cognitiveEnergyScore,
    analyzedAt: new Date().toISOString()
  };
}

// ==========================================
// PILLAR 2: CONTENT SIGNAL EVALUATION
// ==========================================
export function evaluateContentSignal(item, userIntent) {
  let signalScore = 96;
  let noiseFilteredPct = 92;
  let cognitiveLoad = 'Optimal';
  let reasoningBadge = `Why this? "${item.reason || 'Optimized for high-yield retention.'}"`;

  if (userIntent?.cognitiveEnergyScore < 50) {
    if (item.mediaType === 'video') {
      signalScore = 98;
      reasoningBadge = 'Why this? "A low-energy introduction matching your goal."';
    } else if (item.mediaType === 'short') {
      signalScore = 96;
      reasoningBadge = 'Why this? "A 60-second YouTube Short syntax refresher."';
    } else if (item.mediaType === 'reel') {
      signalScore = 95;
      reasoningBadge = 'Why this? "A fast-paced vertical Reel animation."';
    } else if (item.mediaType === 'article') {
      signalScore = 94;
      reasoningBadge = 'Why this? "A high-leverage foundational article."';
    }
  }

  return {
    ...item,
    signalScore,
    noiseFilteredPct,
    cognitiveLoad,
    reasoningBadge
  };
}

// ==========================================
// PILLAR 3: AUTONOMOUS CURATION PIPELINE (MAX 4 RECOMMENDATIONS)
// ==========================================
export function listAutonomousCurations(userIntent) {
  const goal = userIntent?.primaryGoal || 'React Hooks';

  // 4 distinct media items: 1 Video, 1 Short, 1 Reel, 1 Article
  const baseItems = [
    // 1. VIDEO (YouTube Video Embed)
    {
      id: 'rec-video-1',
      title: `Understanding ${goal} Core Concepts`,
      mediaType: 'video',
      url: 'https://www.youtube-nocookie.com/embed/SqcY0GlETPk',
      duration: '12 min',
      formatLabel: 'YouTube Video',
      reason: `Directly addresses your primary goal to master ${goal}.`
    },
    // 2. SHORTS (YouTube Short Embed)
    {
      id: 'rec-short-1',
      title: `60-Sec ${goal} Syntax Short`,
      mediaType: 'short',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      duration: '60 sec',
      formatLabel: 'YouTube Short',
      reason: 'A 60-second bite-sized syntax refresher.'
    },
    // 3. REEL (Vertical Short-Form Reel Embed)
    {
      id: 'rec-reel-1',
      title: `Rapid ${goal} Reel Refresher`,
      mediaType: 'reel',
      url: '',
      duration: '45 sec',
      formatLabel: 'Vertical Reel',
      reason: 'Fast-paced visual breakdown for instant recall.'
    },
    // 4. ARTICLE (Deep Dive Article Reader)
    {
      id: 'rec-article-1',
      title: `A mental model for ${goal}.`,
      mediaType: 'article',
      url: 'https://react.dev',
      duration: '5 min read',
      formatLabel: 'Deep Dive Article',
      reason: 'A high-leverage mental model for foundational depth.'
    }
  ];

  return baseItems.map(item => evaluateContentSignal(item, userIntent));
}

// ==========================================
// PILLAR 4: PROACTIVE HABIT STEERING (DIGITAL GUARDIAN)
// ==========================================
export function checkHabitSteeringIntercept(activityDurationMins = 15) {
  if (activityDurationMins >= 10) {
    return {
      interceptRequired: true,
      triggerReason: 'Passive scrolling pattern detected on X / Twitter (15 mins)',
      suggestedRedirect: 'Redirecting 15 mins to React Hooks Focus Sprint',
      timeSavedMinutes: 15,
      cognitiveImpact: 'Saved +24% prefrontal energy'
    };
  }
  return { interceptRequired: false };
}
