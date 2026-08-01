import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

export const config = { runtime: 'edge' };

/**
 * Send chat completions request directly to local Ollama instance (http://localhost:11434/v1)
 */
export async function sendOllamaChatRequest(messages: any[], options: any = {}) {
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
  } catch (err: any) {
    throw new Error(`Ollama connection error: ${err.message}`);
  }
}

export default async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if a cloud Gemini API key exists in the environment
    const hasCloudKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "";

    let selectedModel;

    if (hasCloudKey) {
      // Production / Cloud Mode: Use Google Gemini
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
      selectedModel = google('gemini-1.5-pro-latest');
    } else {
      // Local / Offline Mode: Use Local Ollama (No API key needed)
      const localOllama = createOpenAI({
        baseURL: 'http://localhost:11434/v1',
        apiKey: 'not-needed',
      });
      selectedModel = localOllama('llama3');
    }

    const result = await streamText({
      model: selectedModel,
      messages,
      system: "You are an Agentic Personal Growth Curator helping optimize user habits and learning signals.",

      tools: {
        evaluateContent: tool({
          description: 'Evaluates content signal density and user growth alignment.',
          parameters: z.object({
            topic: z.string(),
            userAspiration: z.string(),
            estimatedDurationMinutes: z.number()
          }),
          execute: async ({ topic, userAspiration, estimatedDurationMinutes }) => {
            return {
              topic,
              score: 88,
              verdict: "High Signal Curation Match"
            };
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in hybrid AI route:", error);
    return new Response(JSON.stringify({ error: "Failed to process AI request" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}