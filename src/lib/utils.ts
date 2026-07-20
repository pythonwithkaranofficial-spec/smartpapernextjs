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
    const body = matrixMatch[2];
    
    const openBracket = env === "bmatrix" ? "[" : env === "pmatrix" ? "(" : env === "vmatrix" ? "|" : "[";
    const closeBracket = env === "bmatrix" ? "]" : env === "pmatrix" ? ")" : env === "vmatrix" ? "|" : "]";
    
    const lines = body.trim().split(/\\\\/);
    const formattedLines = lines.map((line: string) => {
      const elements = line.split(/&/).map(el => el.trim());
      // Format each cell element
      const formattedElements = elements.map(el => formatScientificText(el));
      return `${openBracket} ${formattedElements.join("  ")} ${closeBracket}`;
    });
    
    const replacement = "\n" + formattedLines.join("\n") + "\n";
    formatted = formatted.replace(fullMatch, replacement);
    matrixRegex.lastIndex = 0; // reset
  }

  // 5. Process piecewise functions (cases) using ⎧, ⎨, ⎩
  const casesRegex = /\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g;
  let casesMatch;
  while ((casesMatch = casesRegex.exec(formatted)) !== null) {
    const fullMatch = casesMatch[0];
    const body = casesMatch[1];
    
    const lines = body.trim().split(/\\\\/).filter(l => l.trim() !== "");
    const formattedLines = lines.map((line: string, idx: number) => {
      let cleanedLine = line.trim();
      cleanedLine = cleanedLine.replace(/&/g, "  ");
      const formattedLine = formatScientificText(cleanedLine);
      
      let brace = "{";
      if (lines.length === 1) {
        brace = "{";
      } else if (lines.length === 2) {
        brace = idx === 0 ? "⎧" : "⎩";
      } else {
        if (idx === 0) {
          brace = "⎧";
        } else if (idx === lines.length - 1) {
          brace = "⎩";
        } else {
          brace = "⎨";
        }
      }
      return `${brace} ${formattedLine}`;
    });
    
    const replacement = "\n" + formattedLines.join("\n") + "\n";
    formatted = formatted.replace(fullMatch, replacement);
    casesRegex.lastIndex = 0;
  }

  // 6. Process fractions recursively to convert \frac{A}{B} to A/B or (A)/(B)
  const replaceFractions = (str: string): string => {
    let current = str;
    const fracRegex = /\\frac\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/g;
    let match;
    while ((match = fracRegex.exec(current)) !== null) {
      const fullMatch = match[0];
      const num = match[1];
      const den = match[2];
      
      const simplifiedNum = replaceFractions(num);
      const simplifiedDen = replaceFractions(den);
      
      const needsParen = (expr: string) => {
        return /[\s+\-*\/=<>≤≥≠±→⇒⇔·∫]/.test(expr);
      };
      
      const numStr = needsParen(simplifiedNum) ? `(${simplifiedNum})` : simplifiedNum;
      const denStr = needsParen(simplifiedDen) ? `(${simplifiedDen})` : simplifiedDen;
      
      current = current.replace(fullMatch, `${numStr}/${simplifiedDen === "2" && !needsParen(simplifiedNum) ? "2" : denStr}`);
      fracRegex.lastIndex = 0;
    }
    return current;
  };
  formatted = replaceFractions(formatted);

  // 7. Process roots recursively to convert \sqrt{A} to √(A) or √A
  const replaceRoots = (str: string): string => {
    let current = str;
    const sqrtRegex = /\\sqrt\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/g;
    let match;
    while ((match = sqrtRegex.exec(current)) !== null) {
      const fullMatch = match[0];
      const inner = match[1];
      const simplifiedInner = replaceRoots(inner);
      
      const needsParen = (expr: string) => {
        return expr.length > 1 || /[\s+\-*\/=<>≤≥≠±→⇒⇔·]/.test(expr);
      };
      const replacement = needsParen(simplifiedInner) ? `√(${simplifiedInner})` : `√${simplifiedInner}`;
      current = current.replace(fullMatch, replacement);
      sqrtRegex.lastIndex = 0;
    }
    // Also support \sqrt without braces e.g. \sqrt x
    current = current.replace(/\\sqrt\s*([a-zA-Z0-9])/g, "√$1");
    return current;
  };
  formatted = replaceRoots(formatted);

  // 8. Format vectors, bars, hats, tildes (e.g. \vec{x} -> x⃗)
  formatted = formatted.replace(/\\(bar|vec|hat|tilde)\{([a-zA-Z0-9])\}/g, (match, cmd, char) => {
    const combiningChars: Record<string, string> = {
      bar: "\u0304",   // U+0304 Combining Macron
      vec: "\u20D7",   // U+20D7 Combining Right Arrow Above
      hat: "\u0302",   // U+0302 Combining Circumflex Accent
      tilde: "\u0303", // U+0303 Combining Tilde
    };
    return char + (combiningChars[cmd] || "");
  });

  // 9. Format set theory blackboard bold symbols (e.g. \mathbb{R} -> ℝ)
  formatted = formatted.replace(/\\mathbb\{([NZQRC])\}/g, (match, char) => {
    const map: Record<string, string> = { N: "ℕ", Z: "ℤ", Q: "ℚ", R: "ℝ", C: "ℂ" };
    return map[char] || char;
  });
  formatted = formatted.replace(/\\mathbb\s*([NZQRC])(?![a-zA-Z])/g, (match, char) => {
    const map: Record<string, string> = { N: "ℕ", Z: "ℤ", Q: "ℚ", R: "ℝ", C: "ℂ" };
    return map[char] || char;
  });

  // 10. LaTeX scientific symbol conversions
  const replacements: Record<string, string> = {
    // Limits / Integrals / Sums
    "\\oint": "∮",
    "\\iint": "∬",
    "\\iiint": "∭",
    "\\int": "∫",
    "\\sum": "∑",
    "\\prod": "∏",
    
    // Relations / Operators
    "\\rightarrow": "→",
    "\\to": "→",
    "\\leftarrow": "←",
    "\\rightleftharpoons": "⇌",
    "\\leftrightarrow": "↔",
    "\\Rightarrow": "⇒",
    "\\Leftarrow": "⇐",
    "\\Leftrightarrow": "⇔",
    "\\times": "×",
    "\\div": "÷",
    "\\pm": "±",
    "\\mp": "∓",
    "\\cdot": "·",
    "\\bullet": "•",
    "\\ast": "*",
    "\\star": "★",
    
    // Set Theory
    "\\subset": "⊂",
    "\\subseteq": "⊆",
    "\\supset": "⊃",
    "\\supseteq": "⊇",
    "\\cup": "∪",
    "\\cap": "∩",
    "\\in": "∈",
    "\\notin": "∉",
    "\\ni": "∋",
    "\\varnothing": "∅",
    "\\emptyset": "∅",
    
    // Logic / Proofs
    "\\therefore": "∴",
    "\\because": "∵",
    "\\exists": "∃",
    "\\forall": "∀",
    "\\neg": "¬",
    "\\lor": "∨",
    "\\land": "∧",
    
    // Geometry
    "\\angle": "∠",
    "\\triangle": "△",
    "\\parallel": "∥",
    "\\perp": "⊥",
    "\\degree": "°",
    
    // General
    "\\partial": "∂",
    "\\nabla": "∇",
    "\\hbar": "ℏ",
    "\\ell": "ℓ",
    "\\infty": "∞",
    "\\propto": "∝",
    "\\approx": "≈",
    "\\cong": "≅",
    "\\sim": "~",
    "\\equiv": "≡",
    "\\neq": "≠",
    "\\ne": "≠",
    "\\leq": "≤",
    "\\le": "≤",
    "\\geq": "≥",
    "\\ge": "≥",
    "\\Delta": "Δ",
    "\\Theta": "Θ",
    "\\Lambda": "Λ",
    "\\Xi": "Ξ",
    "\\Pi": "Π",
    "\\Sigma": "Σ",
    "\\Upsilon": "Υ",
    "\\Phi": "Φ",
    "\\Psi": "Ψ",
    "\\Omega": "Ω",
    "\\alpha": "α",
    "\\beta": "β",
    "\\gamma": "γ",
    "\\delta": "δ",
    "\\epsilon": "ε",
    "\\varepsilon": "ε",
    "\\zeta": "ζ",
    "\\eta": "η",
    "\\theta": "θ",
    "\\vartheta": "ϑ",
    "\\iota": "ι",
    "\\kappa": "κ",
    "\\lambda": "λ",
    "\\mu": "μ",
    "\\nu": "ν",
    "\\xi": "ξ",
    "\\pi": "π",
    "\\rho": "ρ",
    "\\sigma": "σ",
    "\\tau": "τ",
    "\\upsilon": "υ",
    "\\phi": "φ",
    "\\chi": "χ",
    "\\psi": "ψ",
    "\\omega": "ω",
  };

  // Replace each LaTeX pattern ensuring it is matched safely as a command word (not prefixing another)
  Object.entries(replacements).forEach(([latex, unicode]) => {
    const isAlpha = /^\\[a-zA-Z]+$/.test(latex);
    const escapedLatex = latex.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regexStr = isAlpha ? `${escapedLatex}(?![a-zA-Z])` : escapedLatex;
    const regex = new RegExp(regexStr, "g");
    formatted = formatted.replace(regex, unicode);
  });

  // 11. Remove backslashes from standard trigonometric and logarithmic functions
  formatted = formatted.replace(/\\(sin|cos|tan|log|ln|lim|sec|cosec|csc|cot|arcsin|arccos|arctan|sinh|cosh|tanh|det|max|min|sup|inf|deg|arg|lg)(?![a-zA-Z])/g, "$1");

  // 12. Format Subscripts e.g. _{12} or _2 or _{x+y}
  const subscripts: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    "a": "ₐ", "e": "ₑ", "h": "ₕ", "i": "ᵢ", "j": "ⱼ", "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ", "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ", "v": "ᵥ", "x": "ₓ",
    "A": "ₐ", "E": "ₑ", "H": "ₕ", "I": "ᵢ", "J": "ⱼ", "K": "ₖ", "L": "ₗ", "M": "ₘ", "N": "ₙ", "O": "ₒ", "P": "ₚ", "R": "ᵣ", "S": "ₛ", "T": "ₜ", "U": "ᵤ", "V": "ᵥ", "X": "ₓ"
  };

  formatted = formatted.replace(/_\{([a-zA-Z0-9+\-=()₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ]*)\}/g, (match, p1) => {
    return p1.split("").map((char: string) => subscripts[char] || char).join("");
  });
  
  formatted = formatted.replace(/_([a-zA-Z0-9+\-=()])/g, (match, p1) => {
    return subscripts[p1] || p1;
  });

  // 13. Format Superscripts e.g. ^{2} or ^2 or ^n
  const superscripts: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", 
    "a": "ᵃ", "b": "ᵇ", "c": "ᶜ", "d": "ᵈ", "e": "ᵉ", "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "i": "ⁱ", "j": "ʲ", "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ", "o": "ᵒ", "p": "ᵖ", "r": "ʳ", "s": "ˢ", "t": "ᵗ", "u": "ᵘ", "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ",
    "A": "ᴬ", "B": "ᴮ", "C": "ᶜ", "D": "ᴰ", "E": "ᴱ", "F": "ᶠ", "G": "ᴳ", "H": "ᴴ", "I": "ᴵ", "J": "ᴶ", "K": "ᴷ", "L": "ᴸ", "M": "ᴹ", "N": "ᴺ", "O": "ᴼ", "P": "ᴾ", "R": "ᴿ", "S": "ˢ", "T": "ᵀ", "U": "ᵁ", "V": "ⱽ", "W": "ᵂ", "X": "ˣ", "Y": "ʸ", "Z": "ᶻ"
  };

  formatted = formatted.replace(/\^\{([a-zA-Z0-9+\-=()₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ]*)\}/g, (match, p1) => {
    return p1.split("").map((char: string) => superscripts[char] || char).join("");
  });
  
  formatted = formatted.replace(/\^([a-zA-Z0-9+\-=()])/g, (match, p1) => {
    return superscripts[p1] || p1;
  });

  // 14. Keep content inside text/mathrm/mathbf/mathit/operatorname commands but drop the outer command word
  let textCmdPrev;
  const textCmdRegex = /\\(text|mathrm|mathbf|mathit|operatorname)\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  do {
    textCmdPrev = formatted;
    formatted = formatted.replace(textCmdRegex, "$2");
  } while (formatted !== textCmdPrev);

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

