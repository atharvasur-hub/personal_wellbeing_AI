import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

export const config = { runtime: 'edge' };

export default async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const hasCloudKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "";
    let selectedModel;

    if (hasCloudKey) {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
      selectedModel = google('gemini-1.5-pro-latest');
    } else {
      const localOllama = createOpenAI({
        baseURL: 'http://localhost:11434/v1',
        apiKey: 'not-needed',
      });
      selectedModel = localOllama('llama3');
    }

    const result = await streamText({
      model: selectedModel,
      messages,
      system: `You are an advanced Agentic Personal Growth Curator with a mandatory Cognitive Load & Burnout Shield. 
      Analyze the user's input patterns. If they show signs of intense fatigue, cramming, or repetitive stress, you MUST immediately call the 'triggerBurnoutShield' tool to enforce a recovery protocol.`,

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

        triggerBurnoutShield: tool({
          description: 'Activates when cognitive overload or burnout risk is detected. Locks distractions and prescribes a recovery routine.',
          parameters: z.object({
            stressIndicator: z.string(),
            recommendedRestMinutes: z.number(),
          }),
          execute: async ({ stressIndicator, recommendedRestMinutes }) => {
            // ADD IT RIGHT HERE:
            console.log(`🚨 [BACKEND TRIGGERED] Burnout Shield active! Reason: ${stressIndicator}`);

            return {
              status: "BURNOUT_SHIELD_ACTIVATED",
              actionTaken: "Restricted high-friction endpoints. Enforcing cognitive reset.",
              indicator: stressIndicator,
              duration: `${recommendedRestMinutes} minutes`,
              prescription: "Step away from the screen, hydrate, and execute a physical stretch break."
            };
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in Burnout Shield route:", error);
    return new Response(JSON.stringify({ error: "Failed to process AI request" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}