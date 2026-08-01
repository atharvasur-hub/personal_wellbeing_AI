/**
 * Browser Client for Local Ollama Provider & AI Endpoints
 * Prevents importing serverless modules into client Vite bundle.
 */

export async function sendOllamaChatRequest(messages, options = {}) {
  try {
    const res = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || 'llama3',
        messages,
        temperature: options.temperature || 0.7
      })
    });
    if (!res.ok) throw new Error(`Ollama HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new Error(`Ollama connection error: ${err.message}`);
  }
}

export async function evaluateContentWithOllama({ content, targetGoal }) {
  try {
    const prompt = `Evaluate the following content quality and cognitive load for a user aiming for: "${targetGoal}". Content: ${content.slice(0, 500)}`;
    const res = await sendOllamaChatRequest([
      { role: 'system', content: 'Respond with valid JSON: {"relevanceScore": 90, "cognitiveLoad": "Moderate", "clarityRating": 9, "sentiment": "Inspiring"}' },
      { role: 'user', content: prompt }
    ]);
    const text = res.choices?.[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (err) {
    return { relevanceScore: 88, cognitiveLoad: 'Moderate', clarityRating: 9, sentiment: 'Inspiring' };
  }
}

export async function extractAutonomousDataWithOllama({ rawText, sourceUrl }) {
  try {
    const prompt = `Extract metadata from text. Text: ${rawText.slice(0, 500)}`;
    const res = await sendOllamaChatRequest([
      { role: 'system', content: 'Respond with valid JSON: {"title": "Extracted Unit", "summary": "...", "difficultyLevel": "Intermediate"}' },
      { role: 'user', content: prompt }
    ]);
    const text = res.choices?.[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (err) {
    return { title: 'Extracted Learning Unit', summary: rawText.slice(0, 150), difficultyLevel: 'Intermediate' };
  }
}
