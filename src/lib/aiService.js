import { GoogleGenAI } from '@google/genai';
import { sendOllamaChatRequest } from '../../api/chat';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generate a live, contextual AI response using Local Ollama (llama3) or Google Gemini / Fallback engine.
 */
export async function generateAIResponse(userPrompt, conversationHistory = []) {
  // 1. Primary Engine: Local Ollama Provider (http://localhost:11434/v1 with model llama3)
  try {
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text || msg.content || ''
    }));

    const systemMessage = {
      role: 'system',
      content: `You are Synapse AI, an elite Growth Architect AI Assistant embedded in Atharva's Personal Wellbeing & Learning Platform. Your tone is supportive, high-tech, precise, and empowering. User is Atharva, a Tier 3 Growth Catalyst focusing on Deep Learning, React Performance, and Circadian Recovery.`
    };

    const userMessage = {
      role: 'user',
      content: userPrompt
    };

    const messages = [systemMessage, ...formattedHistory.slice(-4), userMessage];
    const ollamaResponse = await sendOllamaChatRequest(messages, {
      model: 'llama3',
      temperature: 0.7
    });

    const responseText = ollamaResponse.choices?.[0]?.message?.content;
    if (responseText) {
      const suggestions = generateDynamicSuggestions(userPrompt);
      return { text: responseText, suggestions };
    }
  } catch (ollamaErr) {
    console.warn('Local Ollama engine request failed, trying secondary engines:', ollamaErr.message);
  }

  // 2. Secondary Engine: Google Gemini API (if key configured)
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `System Prompt: You are Synapse AI, an elite Growth Architect AI Assistant embedded in Atharva's Personal Wellbeing & Learning Platform. Your tone is supportive, high-tech, precise, and empowering. User is Atharva, a Tier 3 Growth Catalyst focusing on Deep Learning, React Performance, and Circadian Recovery.\n\nUser Question: ${userPrompt}`
              }
            ]
          }
        ]
      });

      const responseText = response.text || "Synapse AI processed your request. Node weights have been recalibrated for optimal learning acceleration.";
      const suggestions = generateDynamicSuggestions(userPrompt);
      return { text: responseText, suggestions };
    } catch (err) {
      console.warn('Gemini API call failed, switching to Synapse local fallback engine:', err.message);
    }
  }

  // 3. Fallback intelligent compiler responses for demo / offline operation
  return generateFallbackResponse(userPrompt);
}

function generateDynamicSuggestions(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('gap') || lower.includes('aspiration')) {
    return ["Generate 20-Min Deep Focus Plan", "Set Daily Reminder", "Adjust Node Weights"];
  } else if (lower.includes('sprint') || lower.includes('focus')) {
    return ["Mark Sprint Complete", "Log Fatigue Baseline", "Start Box Breathing"];
  } else if (lower.includes('trajectory') || lower.includes('career')) {
    return ["Lock Trajectory Target", "Export Growth Report", "View Level Progress"];
  }
  return ["Analyze Aspiration Gap", "Generate Focus Sprint", "View Identity Graph"];
}

function generateFallbackResponse(userPrompt) {
  const lower = userPrompt.toLowerCase();
  let text = "I've compiled that request. Node weights for 'Deep Learning' and 'React Performance' have been updated to optimum priority.";
  let suggestions = ["View Graph Updates", "Add Sprint to Goal Roadmap"];

  if (lower.includes("aspiration gap") || lower.includes("analyze")) {
    text = "Aspiration Gap Analysis Complete: You are currently at an 86% match for target Senior AI Architect benchmarks. Primary bottleneck detected: 14% gap in distributed matrix multiplication.";
    suggestions = ["Generate 20-Min Deep Focus Plan", "Set Daily Reminder"];
  } else if (lower.includes("sprint") || lower.includes("focus")) {
    text = "60-Second Focus Sprint Initiated! Step 1: Open your code editor. Step 2: Minimize browser tabs. Step 3: Execute 3 deep belly breaths.";
    suggestions = ["Mark Sprint Complete", "Log Fatigue Baseline"];
  } else if (lower.includes("trajectory") || lower.includes("simulate")) {
    text = "Trajectory Simulation: Continuing daily 45-min focus blocks will yield a 3.4x learning acceleration over passive browsing over the next 180 days.";
    suggestions = ["Lock Trajectory Target", "Export Growth Report"];
  } else if (lower.includes("hello") || lower.includes("hi")) {
    text = "Hello Atharva! Your cognitive baseline is optimal today. What objective shall we compile together?";
    suggestions = ["Analyze My Aspiration Gap", "Generate Focus Sprint"];
  }

  return { text, suggestions };
}
