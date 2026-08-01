/**
 * SYNAPSE ML & AI ENGINE PILLARS
 * Integrated Personal Development ML Pipeline
 */

// ==========================================
// PILLAR 1: INTENT & BEHAVIOR ANALYSIS
// ==========================================
export function analyzeUserIntent(goalText = '', mood = 'focused', fatigueLevel = 'low') {
  const goalLower = goalText.toLowerCase();
  
  let targetDomain = 'React & Technical Systems';
  let focusPriority = 'High';
  let cognitiveEnergyScore = 85;

  if (goalLower.includes('tired') || goalLower.includes('low energy') || mood === 'exhausted') {
    cognitiveEnergyScore = 42;
    focusPriority = 'Low-Fatigue Visual Learning';
  }

  if (goalLower.includes('python') || goalLower.includes('ai') || goalLower.includes('model')) {
    targetDomain = 'Machine Learning & AI Engineering';
  } else if (goalLower.includes('sleep') || goalLower.includes('recovery')) {
    targetDomain = 'Circadian Health & Recovery';
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
  let signalScore = 95;
  let noiseFilteredPct = 90;
  let cognitiveLoad = 'Low';
  let reasoningBadge = `Why this? "${item.reason || 'Optimized for high-yield retention.'}"`;

  // Energy-sensitive scoring adjustment
  if (userIntent?.cognitiveEnergyScore < 50) {
    if (item.mediaType === 'video') {
      signalScore = 98;
      noiseFilteredPct = 94;
      cognitiveLoad = 'Low Visual';
      reasoningBadge = 'Why this? "A low-energy introduction to React Hooks."';
    } else if (item.mediaType === 'short') {
      signalScore = 96;
      noiseFilteredPct = 92;
      cognitiveLoad = '60-Sec Micro';
      reasoningBadge = 'Why this? "A 60-second syntax refresher."';
    } else if (item.mediaType === 'tool') {
      signalScore = 92;
      cognitiveLoad = 'Interactive Hands-on';
      reasoningBadge = 'Why this? "Time to apply what you just watched."';
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
// PILLAR 3: AUTONOMOUS CURATION PIPELINE
// ==========================================
export function listAutonomousCurations(userIntent) {
  const baseItems = [
    {
      id: 'video-1',
      title: 'Understanding useEffect Dependencies',
      mediaType: 'video',
      url: 'https://www.youtube-nocookie.com/embed/SqcY0GlETPk',
      duration: '12 min',
      reason: 'You struggled with re-renders yesterday.'
    },
    {
      id: 'article-1',
      title: 'A mental model for React state.',
      mediaType: 'article',
      duration: '5 min read',
      reason: 'A high-leverage foundational concept.'
    },
    {
      id: 'tool-1',
      title: 'Build a custom useDebounce hook in the Sandbox.',
      mediaType: 'tool',
      duration: 'Interactive',
      reason: 'Time to apply what you just watched.'
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
