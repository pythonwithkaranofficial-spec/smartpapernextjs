/**
 * Robust parsing of JSON produced by the AI model.
 *
 * Strategy:
 *  1. Strip markdown code fences and try `JSON.parse` on the text as-is (the normal case,
 *     since the prompts request `application/json` with double-escaped backslashes).
 *  2. Only if that fails, run a string-aware repair pass (invalid escapes, raw control
 *     characters inside strings, trailing commas *outside* strings) and parse again.
 *  3. Finally undo the classic LaTeX mangling where an un-doubled `\theta`, `\frac`, `\beta`
 *     … was decoded as a TAB / form-feed / backspace control character.
 *
 * Unlike the old regex cleaner this never doubles valid `\n` / `\t` escapes (which turned
 * line breaks into literal "\n" text) and never edits commas inside string values.
 */

const VALID_ESCAPES = new Set(['"', "\\", "/", "b", "f", "n", "r", "t"]);

/** Removes ```json fences / leading prose and returns the most likely JSON payload. */
export function stripCodeFences(text: string): string {
  let cleaned = (text || "").replace(/^﻿/, "").trim();
  const fenced = cleaned.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (fenced) cleaned = fenced[1].trim();
  return cleaned;
}

/** Slices from the first `{`/`[` to the matching last `}`/`]` to drop stray prose. */
function extractJsonPayload(text: string): string {
  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");
  const starts = [firstObj, firstArr].filter((i) => i >= 0);
  if (starts.length === 0) return text;
  const start = Math.min(...starts);
  const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  return end > start ? text.slice(start, end + 1) : text.slice(start);
}

/**
 * String-aware repair: escapes invalid backslash sequences and raw control characters
 * inside strings, and removes trailing commas that appear outside strings.
 */
export function repairJsonText(text: string): string {
  let out = "";
  let inString = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (ch === "\\") {
        const next = text[i + 1];
        if (next === "u" && /^[0-9a-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) {
          out += text.slice(i, i + 6);
          i += 5;
        } else if (next !== undefined && VALID_ESCAPES.has(next)) {
          out += ch + next;
          i += 1;
        } else {
          // Invalid escape such as "\(" or "\s" (LaTeX) -> keep the backslash literally.
          out += "\\\\";
        }
        continue;
      }
      if (ch === '"') {
        inString = false;
        out += ch;
        continue;
      }
      // Raw control characters are illegal inside JSON strings.
      if (ch === "\n") out += "\\n";
      else if (ch === "\r") out += "\\r";
      else if (ch === "\t") out += "\\t";
      else if (ch < " ") out += `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`;
      else out += ch;
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === ",") {
      // Drop the comma if the next significant character closes an object/array.
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) j++;
      if (text[j] === "}" || text[j] === "]") continue;
    }
    out += ch;
  }
  return out;
}

// LaTeX commands whose leading letter collides with a JSON escape (\b \f \n \r \t).
const LATEX_AFTER_BACKSPACE = /\u0008(?=(?:eta|ar|f|inom|igcup|igcap|oldsymbol|ackslash|ecause|ot|ullet|egin)\b)/g;
const LATEX_AFTER_FORMFEED = /\u000c(?=(?:rac|orall|lat|box)\b)/g;
const LATEX_AFTER_CR = /\r(?=(?:ho|ight|angle|ightarrow|m|ceil|floor)\b)/g;
const LATEX_AFTER_TAB = /\t(?=(?:heta|imes|an|au|ext|extbf|herefore|op|ilde|o|riangle|frac)\b)/g;
const LATEX_AFTER_NEWLINE = /\n(?=(?:abla|eq|u|eg|ot|otin|exists|onumber)\b)/g;

/** Restores `\theta`, `\frac`, `\nabla` … that were decoded as control characters. */
export function restoreLatexControlChars(value: string): string {
  return value
    .replace(LATEX_AFTER_BACKSPACE, "\\b")
    .replace(LATEX_AFTER_FORMFEED, "\\f")
    .replace(LATEX_AFTER_CR, "\\r")
    .replace(LATEX_AFTER_TAB, "\\t")
    .replace(LATEX_AFTER_NEWLINE, "\\n");
}

function mapStrings(value: unknown, fn: (s: string) => string): unknown {
  if (typeof value === "string") return fn(value);
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = mapStrings(v, fn);
    return out;
  }
  return value;
}

/** Parses AI JSON output, repairing only when strict parsing fails. Throws if unrecoverable. */
export function parseAiJson<T = unknown>(raw: string): T {
  const text = stripCodeFences(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const payload = extractJsonPayload(text);
    try {
      parsed = JSON.parse(payload);
    } catch {
      parsed = JSON.parse(repairJsonText(payload));
    }
  }
  return mapStrings(parsed, restoreLatexControlChars) as T;
}
