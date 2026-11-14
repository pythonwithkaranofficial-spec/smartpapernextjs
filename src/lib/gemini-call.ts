import type { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';

/**
 * Gemini calls that survive temporary overloads ("503 model is experiencing high demand",
 * "429 RESOURCE_EXHAUSTED"): back off and retry the primary model once, then try a
 * lighter fallback model once. Non-overload errors are thrown immediately so the
 * callers' own validation-retry loops keep working as before.
 */

export const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite';

export class AIOverloadedError extends Error {
  constructor(cause?: unknown) {
    super('The AI service is temporarily overloaded.');
    this.name = 'AIOverloadedError';
    (this as { cause?: unknown }).cause = cause;
  }
}

export function isOverloadError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { status?: number; code?: number; message?: string };
  const status = typeof e.status === 'number' ? e.status : typeof e.code === 'number' ? e.code : undefined;
  if (status === 503 || status === 429) return true;
  const msg = String(e.message || err);
  return /\b(503|429)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|rate limit|quota exceeded/i.test(msg);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateContentResilient(
  ai: GoogleGenAI,
  params: GenerateContentParameters
): Promise<GenerateContentResponse> {
  const plan: { model: string; waitBeforeMs: number }[] = [
    { model: params.model, waitBeforeMs: 0 },
    { model: params.model, waitBeforeMs: 2000 },
  ];
  if (FALLBACK_MODEL && FALLBACK_MODEL !== params.model) {
    plan.push({ model: FALLBACK_MODEL, waitBeforeMs: 1000 });
  }

  let lastOverload: unknown = null;
  for (const step of plan) {
    if (step.waitBeforeMs) await sleep(step.waitBeforeMs);
    try {
      return await ai.models.generateContent({ ...params, model: step.model });
    } catch (err) {
      if (!isOverloadError(err)) throw err;
      lastOverload = err;
      console.warn(`[Gemini] ${step.model} overloaded, backing off:`, (err as Error)?.message?.slice(0, 160));
    }
  }
  throw new AIOverloadedError(lastOverload);
}

export const AI_BUSY_MESSAGE =
  'The AI service is very busy right now. Please try again in a minute.';
