import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function compressImageToBase64(
  file: File,
  maxWidth = 150,
  maxHeight = 150,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas 2d context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export function formatScientificText(text: string): string {
  if (!text) return "";
  
  let formatted = text;
  
  // Helper to decode HTML entities
  const decodeHTMLEntities = (str: string): string => {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  };
  
  // 1. Decode HTML entities
  formatted = decodeHTMLEntities(formatted);
  
  // 2. Decode raw Unicode escapes like \uXXXX and \u{XXXX}
  formatted = formatted.replace(/\\u\{([0-9a-fA-F]+)\}/g, (match, grp) => {
    try {
      return String.fromCodePoint(parseInt(grp, 16));
    } catch {
      return match;
    }
  });

  formatted = formatted.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
    try {
      return String.fromCodePoint(parseInt(grp, 16));
    } catch {
      return match;
    }
  });
  
  // 3. Remove/replace backslashed underscores first
  formatted = formatted.replace(/\\_/g, "_");

  // 4. Process matrices before removing general \begin/\end
  // Converts matrix environments (matrix, pmatrix, bmatrix, vmatrix) into neatly aligned text matrices
  const matrixRegex = /\\begin\{(matrix|pmatrix|bmatrix|vmatrix|Vmatrix)\}([\s\S]*?)\\end\{\1\}/g;
  let matrixMatch;
  while ((matrixMatch = matrixRegex.exec(formatted)) !== null) {
    const fullMatch = matrixMatch[0];
    const env = matrixMatch[1];
    const content = matrixMatch[2];

    const rows = content
      .trim()
      .split("\\\\")
      .map(r => r.split("&").map(c => c.trim()).filter(c => c.length > 0))
      .filter(r => r.length > 0);

    if (rows.length === 0) continue;

    const colWidths: number[] = [];
    rows.forEach(r => {
      r.forEach((c, colIdx) => {
        colWidths[colIdx] = Math.max(colWidths[colIdx] || 0, c.length);
      });
    });

    const openChar = (env === "pmatrix" || env === "matrix") ? "║ " : env === "bmatrix" ? "[ " : "| ";
    const closeChar = (env === "pmatrix" || env === "matrix") ? " ║" : env === "bmatrix" ? " ]" : " |";

    const formattedRows = rows.map(r => {
      const paddedCols = r.map((c, colIdx) => c.padEnd(colWidths[colIdx] || 0, " "));
      return openChar + paddedCols.join("  ") + closeChar;
    });

    const formattedMatrix = "\n" + formattedRows.join("\n") + "\n";
    formatted = formatted.replace(fullMatch, formattedMatrix);
  }

  // 5. Replace fraction representations \frac{a}{b} -> (a/b)
  formatted = formatted.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1/$2)");

  // 6. Replace square roots \sqrt{a} -> √(a)
  formatted = formatted.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");
  formatted = formatted.replace(/\\sqrt\b/g, "√");

  // 7. Superscripts (numbers, +/-, letters)
  const superscripts: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", "n": "ⁿ", "x": "ˣ"
  };
  formatted = formatted.replace(/\^\{([^}]+)\}/g, (match, grp) => {
    return grp.split("").map((ch: string) => superscripts[ch] || ch).join("");
  });
  formatted = formatted.replace(/\^([0-9+\-n])/g, (match, grp) => superscripts[grp] || grp);

  // 8. Subscripts (numbers, +/-, letters)
  const subscripts: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎", "a": "ₐ", "e": "ₑ", "o": "ₒ", "x": "ₓ", "h": "ₕ", "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "p": "ₚ", "s": "ₛ", "t": "ₜ"
  };
  formatted = formatted.replace(/_\{([^}]+)\}/g, (match, grp) => {
    return grp.split("").map((ch: string) => subscripts[ch] || ch).join("");
  });
  formatted = formatted.replace(/_([0-9+\-a-z])/g, (match, grp) => subscripts[grp] || grp);

  // 9. Standard mathematical and Greek symbols
  const mathSymbols: Record<string, string> = {
    "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ", "\\epsilon": "ε", "\\zeta": "ζ",
    "\\eta": "η", "\\theta": "θ", "\\iota": "ι", "\\kappa": "κ", "\\lambda": "λ", "\\mu": "μ",
    "\\nu": "ν", "\\xi": "ξ", "\\pi": "π", "\\rho": "ρ", "\\sigma": "σ", "\\tau": "τ",
    "\\phi": "φ", "\\chi": "χ", "\\psi": "ψ", "\\omega": "ω",
    "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ", "\\Xi": "Ξ",
    "\\Pi": "Π", "\\Sigma": "Σ", "\\Phi": "Φ", "\\Psi": "Ψ", "\\Omega": "Ω",
    "\\times": "×", "\\div": "÷", "\\pm": "±", "\\mp": "∓", "\\cdot": "·", "\\degree": "°",
    "\\infty": "∞", "\\approx": "≈", "\\neq": "≠", "\\leq": "≤", "\\geq": "≥",
    "\\equiv": "≡", "\\propto": "∝", "\\partial": "∂", "\\nabla": "∇",
    "\\sum": "∑", "\\prod": "∏", "\\int": "∫", "\\iint": "∬", "\\iiint": "∭",
    "\\subset": "⊂", "\\supset": "⊃", "\\subseteq": "⊆", "\\supseteq": "⊇",
    "\\in": "∈", "\\notin": "∉", "\\cup": "∪", "\\cap": "∩", "\\forall": "∀", "\\exists": "∃",
    "\\to": "→", "\\rightarrow": "→", "\\leftarrow": "←", "\\Rightarrow": "⇒", "\\Leftarrow": "⇐", "\\leftrightarrow": "↔",
    "\\circ": "°"
  };

  Object.entries(mathSymbols).forEach(([sym, uni]) => {
    const regex = new RegExp(sym.replace(/\\/g, "\\\\") + "(?![a-zA-Z])", "g");
    formatted = formatted.replace(regex, uni);
  });

  // 10. Simplify common chemical formulas formatting (e.g. H2O -> H₂O, CO2 -> CO₂)
  formatted = formatted.replace(/\b(H|O|N|C|Cl|S|P|Na|K|Ca|Fe|Mg)(2|3|4|5|6|7|8|9)\b/g, (match, elem, num) => {
    return elem + (subscripts[num] || num);
  });

  // 11. Decode LaTeX text formatting commands \text{...}, \mathbf{...}, \mathrm{...}
  formatted = formatted.replace(/\\(text|mathbf|mathrm|mathit|mathsf|mathtt)\{([^}]+)\}/g, "$2");

  // 12. Remove remaining inline math delimiters $ ... $ or \( ... \)
  formatted = formatted.replace(/\$([^$]+)\$/g, "$1");
  formatted = formatted.replace(/\\\((.*?)\\\)/g, "$1");

  // 13. Convert display math delimiters $$ ... $$ or \[ ... \]
  formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, "\n$1\n");
  formatted = formatted.replace(/\\\[([\s\S]*?)\\]/g, "\n$1\n");

  // 14. Convert vector notation \vec{a} -> a⃗
  formatted = formatted.replace(/\\vec\{([^}]+)\}/g, "$1⃗");

  // 15. Simplify common fractions (e.g. 1/2 -> ½) when they stand alone
  const commonFractions: Record<string, string> = {
    "1/2": "½",
    "1/3": "⅓",
    "1/4": "¼",
    "3/4": "¾",
    "1/5": "⅕",
    "1/6": "⅙",
    "1/7": "⅐",
    "1/8": "⅛",
    "1/9": "⅑",
    "1/10": "⅒",
  };
  Object.entries(commonFractions).forEach(([frac, uni]) => {
    const regex = new RegExp(`(?<![a-zA-Z0-9])${frac}(?![a-zA-Z0-9])`, "g");
    formatted = formatted.replace(regex, uni);
  });

  // 16. Remove remaining LaTeX formatting spaces and parameters
  formatted = formatted.replace(/\\(left|right|displaystyle|textstyle|limits|nolimits|rm|bf|it)(?![a-zA-Z])/g, "");
  formatted = formatted.replace(/\\(qquad|quad)(?![a-zA-Z])/g, "  ");
  formatted = formatted.replace(/\\([!,;:])(?![a-zA-Z])/g, "");
  formatted = formatted.replace(/\\(hspace|vspace)\{[^}]*\}/g, "");
  
  // 17. Convert LaTeX environments that are remaining (e.g. \begin{equation} -> empty string)
  formatted = formatted.replace(/\\(begin|end)\{[a-zA-Z*]+\}/g, "");
  
  // 18. Convert double backslash newline representation
  formatted = formatted.replace(/\\\\/g, "\n");

  // 19. Clean up any raw '\n' literal characters from text to actual line breaks
  formatted = formatted.replace(/\\n/g, "\n");

  // 20. Remove any remaining backslashes that are prefixing standard math/physics symbols or punctuation
  // E.g., \( or \) or \[ or \] -> just ( or ) or [ or ]
  formatted = formatted.replace(/\\([()\[\]{}])/g, "$1");

  return formatted;
}

export function saveLocalPaperHistory(record: {
  class: string;
  subject: string;
  paper_type: string;
  marks: number;
  difficulty: string;
  paper_json: unknown;
}) {
  if (typeof window === "undefined") return;
  try {
    const existing = localStorage.getItem("user_paper_history");
    const list: unknown[] = existing ? JSON.parse(existing) : [];
    const newRecord = {
      id: "local_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      firebase_uid: "local",
      class: record.class,
      subject: record.subject,
      paper_type: record.paper_type,
      marks: record.marks,
      difficulty: record.difficulty,
      paper_json: typeof record.paper_json === "string" ? record.paper_json : JSON.stringify(record.paper_json),
      created_at: new Date().toISOString(),
    };
    const updated = [newRecord, ...list].slice(0, 100);
    localStorage.setItem("user_paper_history", JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save paper to local history:", e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalPaperHistory(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = localStorage.getItem("user_paper_history");
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}

export async function syncLocalHistoryToCloud() {
  if (typeof window === "undefined") return;
  try {
    const localItems = getLocalPaperHistory();
    const unsynced = localItems.filter((item) => item && item.firebase_uid === "local");
    if (unsynced.length === 0) return;

    const { AuthService } = await import("@/lib/firebase/auth-service");
    const token = await AuthService.getFirebaseToken();
    if (!token) return;

    for (const item of unsynced) {
      try {
        const res = await fetch("/api/user/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            class: item.class,
            subject: item.subject,
            paper_type: item.paper_type,
            marks: item.marks,
            difficulty: item.difficulty,
            paper_json: item.paper_json,
          }),
        });
        if (res.ok) {
          item.firebase_uid = "synced";
        }
      } catch (e) {
        console.error("Failed to sync local paper to cloud:", e);
      }
    }
    localStorage.setItem("user_paper_history", JSON.stringify(localItems));
  } catch (e) {
    console.error("Failed to sync local history to cloud:", e);
  }
}
