/**
 * Synapse AI Chatbot — Frontend Thin Layer
 * All AI logic is handled by FastAPI backend (localhost:8000).
 * This file is a simple pass-through to backendApi.js.
 */
import { chatWithBackend } from './backendApi';

/**
 * Generate a chatbot response via FastAPI backend.
 * @param {string} userMessage
 * @param {Array}  history  [{role, text}]
 * @param {string} userId
 */
export async function generateAIResponse(userMessage, history = [], userId = null) {
  const result = await chatWithBackend(userMessage, history, userId);

  if (result?.reply) {
    return {
      text: result.reply,
      suggestions: result.suggestions || [],
      source: 'fastapi'
    };
  }

  // Backend offline fallback
  return {
    text: "The AI backend is offline. Start it with: cd backend && uvicorn main:app --reload --port 8000",
    suggestions: ['Start backend server', 'Get Gemini API key', 'Check backend/.env'],
    source: 'offline'
  };
}
