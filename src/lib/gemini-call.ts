import type { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';

/**
 * Gemini calls that survive temporary overloads (503 "high demand") and per-minute quota limits
 * (429 RESOURCE_EXHAUSTED — common on the free tier):
 *   1. primary model
 *   2. primary model again, after Google's suggested retry delay (429) or a short backoff (503)
 *   3. each fallback model once (free-tier quotas are per model, so these usually still have room)
 * Non-overload errors are thrown immediately so callers' validation-retry loops behave as before.
 */

export const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-2.5-flash-lite,gemini-flash-lite-latest')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const MAX_SUGGESTED_WAIT_MS = 20_000;

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
  return /\b(503|429)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|rate limit|exceeded your current quota/i.test(msg);
}

/** Google's suggested wait for a 429 ("retryDelay": "23s"), in ms, if present. */
export function suggestedRetryMs(err: unknown): number | null {
  const msg = String((err as { message?: string })?.message || '');
  const m = msg.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/) || msg.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
  return m ? Math.ceil(Number(m[1]) * 1000) : null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateContentResilient(
  ai: GoogleGenAI,
  params: GenerateContentParameters
): Promise<GenerateContentResponse> {
  const primary = params.model;
  let lastOverload: unknown = null;

  // 1 + 2: primary model, then one retry after the suggested / default backoff.
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt === 1) {
      const suggested = suggestedRetryMs(lastOverload);
      const wait = suggested !== null && suggested <= MAX_SUGGESTED_WAIT_MS ? suggested + 500 : 2000;
      // A long suggested wait means the per-minute/day quota is exhausted: skip straight to fallbacks.
      if (suggested !== null && suggested > MAX_SUGGESTED_WAIT_MS) break;
      await sleep(wait);
    }
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      if (!isOverloadError(err)) throw err;
      lastOverload = err;
      console.warn(`[Gemini] ${primary} unavailable (attempt ${attempt + 1}):`, String((err as Error)?.message).slice(0, 160));
    }
  }

  // 3: fallback models. Drop model-specific tuning (e.g. thinking budgets) that other model
  // families may not accept.
  const { thinkingConfig: _ignored, ...portableConfig } = (params.config || {}) as Record<string, unknown>;
  void _ignored;
  for (const model of FALLBACK_MODELS) {
    if (model === primary) continue;
    try {
      const res = await ai.models.generateContent({ ...params, model, config: portableConfig });
      console.warn(`[Gemini] served by fallback model ${model}`);
      return res;
    } catch (err) {
      if (!isOverloadError(err)) {
        // A fallback rejecting the request (e.g. unsupported model) should not hide the real cause.
        console.warn(`[Gemini] fallback ${model} failed:`, String((err as Error)?.message).slice(0, 160));
        continue;
      }
      lastOverload = err;
      console.warn(`[Gemini] fallback ${model} unavailable:`, String((err as Error)?.message).slice(0, 160));
    }
  }
  throw new AIOverloadedError(lastOverload);
}

export const AI_BUSY_MESSAGE =
  'The AI service is very busy right now. Please try again in a minute.';
