/**
 * Helper Utilities for Autonomous Data Extraction & Content Curation Pipeline
 * Grounded on local Ollama provider ('http://localhost:11434/v1' with model 'llama3')
 */

import { evaluateContentWithOllama, extractAutonomousDataWithOllama } from '../../api/chat';

/**
 * Perform autonomous data extraction on raw text or scraped content
 * @param {string} rawText Raw input text/article
 * @param {string} [sourceUrl] Optional source URL
 */
export async function extractContentMetadata(rawText, sourceUrl = '') {
  if (!rawText || !rawText.trim()) {
    throw new Error('rawText is required for autonomous extraction.');
  }

  try {
    const metadata = await extractAutonomousDataWithOllama({ rawText, sourceUrl });
    return {
      title: metadata.title || 'Untitled Extracted Learning Unit',
      summary: metadata.summary || 'Summary generated via autonomous pipeline.',
      topicTags: metadata.topicTags || ['AI', 'Performance', 'Wellbeing'],
      difficultyLevel: metadata.difficultyLevel || 'Intermediate',
      estimatedReadMinutes: metadata.estimatedReadMinutes || Math.max(1, Math.round(rawText.split(/\s+/).length / 200)),
      identityNodes: metadata.identityNodes || ['Technical Systems'],
      sprintSteps: metadata.sprintSteps || ['Review key concepts', 'Audit benchmark metrics', 'Log progress'],
      extractedAt: new Date().toISOString()
    };
  } catch (err) {
    console.warn('Autonomous extraction error, using pipeline safety fallback:', err);
    return {
      title: 'Extracted Learning Unit',
      summary: rawText.slice(0, 180) + '...',
      topicTags: ['Autonomous Extraction', 'Deep Learning'],
      difficultyLevel: 'Intermediate',
      estimatedReadMinutes: Math.max(1, Math.round(rawText.split(/\s+/).length / 225)),
      identityNodes: ['React Systems', 'Neural Net Architecture'],
      sprintSteps: ['Read article summary', 'Identify core trade-offs', 'Execute 20-min sprint'],
      extractedAt: new Date().toISOString()
    };
  }
}

/**
 * Evaluate content quality, cognitive load, relevance, and sentiment
 * @param {string} content Content text to audit
 * @param {string} [targetGoal] Current user aspiration or learning goal
 */
export async function evaluateContentQuality(content, targetGoal = 'Deep Learning & React Performance') {
  try {
    const evalData = await evaluateContentWithOllama({ content, targetGoal });
    return {
      relevanceScore: typeof evalData.relevanceScore === 'number' ? evalData.relevanceScore : 88,
      cognitiveLoad: evalData.cognitiveLoad || 'Moderate',
      clarityRating: evalData.clarityRating || 9,
      keyTakeaways: Array.isArray(evalData.keyTakeaways) ? evalData.keyTakeaways : [
        'Isolate side-effects to preserve render performance',
        'Maintain cognitive recovery windows during deep focus',
        'Calibrate learning nodes daily'
      ],
      sentiment: evalData.sentiment || 'Inspiring',
      recommendedAction: evalData.recommendedAction || 'Execute immediate 15-min practice block'
    };
  } catch (err) {
    console.warn('Content evaluation error:', err);
    return {
      relevanceScore: 85,
      cognitiveLoad: 'Moderate',
      clarityRating: 8,
      keyTakeaways: ['Study core mental models', 'Isolate state updates', 'Practice active recall'],
      sentiment: 'Informative',
      recommendedAction: 'Review identity graph'
    };
  }
}

/**
 * Curate and rank a feed of learning items against the user's aspiration gap
 * @param {Array} items List of learning items/articles
 * @param {Object} userProfile Profile object containing identity nodes and target mastery
 */
export function curateContentFeed(items = [], userProfile = {}) {
  const targetNodes = userProfile.identityNodes || ['React Performance', 'Deep Learning', 'System Design'];

  return items
    .map(item => {
      // Calculate matching score based on topic tags and target identity nodes
      const matches = item.tags ? item.tags.filter(t => targetNodes.some(tn => tn.toLowerCase().includes(t.toLowerCase()))) : [];
      const priorityBonus = matches.length * 15;
      const baseScore = item.relevanceScore || 70;
      const finalScore = Math.min(100, baseScore + priorityBonus);

      return {
        ...item,
        curatedPriorityScore: finalScore,
        matchedNodes: matches.length > 0 ? matches : ['General Growth'],
        recommendationReason: matches.length > 0
          ? `Directly targets your ${matches.join(' & ')} aspiration gap.`
          : 'High quality foundational reading for general skill acceleration.'
      };
    })
    .sort((a, b) => b.curatedPriorityScore - a.curatedPriorityScore);
}

/**
 * Generate a 20-minute Focus Sprint from extracted content
 * @param {string} content Or summary text
 */
export function generateFocusSprintFromContent(content) {
  const words = content ? content.split(/\s+/).length : 100;
  const readTime = Math.max(2, Math.round(words / 200));

  return {
    sprintTitle: '20-Min Deep Work Focus Block',
    readTimeMinutes: readTime,
    sprintPhases: [
      { phase: 1, durationMinutes: readTime, name: 'Deep Reading & Concept Extraction', desc: 'Read article cleanly in Reader Mode without distractions.' },
      { phase: 2, durationMinutes: 12, name: 'Hands-on Implementation Sprint', desc: 'Apply key takeaway directly into code editor or notebook.' },
      { phase: 3, durationMinutes: 5, name: 'Cognitive Reset & Box Breathing', desc: 'Step away from screen, rest optic nerve, log reflection.' }
    ],
    totalDurationMinutes: 20
  };
}
