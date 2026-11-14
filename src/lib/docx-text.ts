import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';

/**
 * Extracts readable text from a .docx question paper WITHOUT losing what teachers rely on:
 *  - Word auto-numbering ("1.", "(a)", "i)") is rendered from numbering.xml (mammoth drops it,
 *    so question boundaries and MCQ option letters disappeared)
 *  - Equations (OMML) are linearised, e.g. (x+1)/(2) + (x−3)/(4) = 5 (mammoth drops them entirely)
 *  - Tables become "cell | cell" rows; images become "[Figure]"
 */

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const M = 'http://schemas.openxmlformats.org/officeDocument/2006/math';

type El = Element;

interface LevelDef {
  numFmt: string;
  lvlText: string;
  start: number;
}

const childElements = (el: El): El[] => {
  const out: El[] = [];
  for (let n = el.firstChild; n; n = n.nextSibling) {
    if (n.nodeType === 1) out.push(n as El);
  }
  return out;
};
const isW = (el: El, name: string) => el.namespaceURI === W && el.localName === name;
const isM = (el: El, name: string) => el.namespaceURI === M && el.localName === name;
const firstChild = (el: El, ns: string, name: string): El | null =>
  childElements(el).find((c) => c.namespaceURI === ns && c.localName === name) || null;
const wAttr = (el: El | null, name: string): string | null =>
  el ? el.getAttributeNS(W, name) || el.getAttribute(`w:${name}`) : null;
const mAttr = (el: El | null, name: string): string | null =>
  el ? el.getAttributeNS(M, name) || el.getAttribute(`m:${name}`) : null;

function toRoman(n: number): string {
  const map: [number, string][] = [[1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}
function toLetters(n: number): string {
  let s = '';
  while (n > 0) { n--; s = String.fromCharCode(97 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
}
function formatNumber(n: number, fmt: string): string {
  switch (fmt) {
    case 'lowerLetter': return toLetters(n);
    case 'upperLetter': return toLetters(n).toUpperCase();
    case 'lowerRoman': return toRoman(n);
    case 'upperRoman': return toRoman(n).toUpperCase();
    case 'bullet': return '•';
    case 'none': return '';
    default: return String(n);
  }
}

/** Linearises an OMML equation into plain text the AI can read. */
function mathText(el: El): string {
  const kids = childElements(el);
  const part = (name: string) => {
    const c = firstChild(el, M, name);
    return c ? mathText(c) : '';
  };
  if (isM(el, 't')) return el.textContent || '';
  if (isM(el, 'f')) return `(${part('num')})/(${part('den')})`;
  if (isM(el, 'sSup')) return `${part('e')}^(${part('sup')})`;
  if (isM(el, 'sSub')) return `${part('e')}_(${part('sub')})`;
  if (isM(el, 'sSubSup')) return `${part('e')}_(${part('sub')})^(${part('sup')})`;
  if (isM(el, 'rad')) {
    const deg = part('deg');
    return deg ? `root${deg}(${part('e')})` : `√(${part('e')})`;
  }
  if (isM(el, 'd')) {
    const pr = firstChild(el, M, 'dPr');
    const beg = mAttr(pr && firstChild(pr, M, 'begChr'), 'val') ?? '(';
    const end = mAttr(pr && firstChild(pr, M, 'endChr'), 'val') ?? ')';
    const sep = mAttr(pr && firstChild(pr, M, 'sepChr'), 'val') ?? ',';
    const items = kids.filter((k) => isM(k, 'e')).map(mathText);
    return `${beg}${items.join(sep)}${end}`;
  }
  if (isM(el, 'nary')) {
    const pr = firstChild(el, M, 'naryPr');
    const chr = mAttr(pr && firstChild(pr, M, 'chr'), 'val') ?? '∫';
    const sub = part('sub');
    const sup = part('sup');
    return `${chr}${sub ? `_(${sub})` : ''}${sup ? `^(${sup})` : ''} ${part('e')}`;
  }
  if (isM(el, 'func')) return `${part('fName')}(${part('e')})`;
  if (isM(el, 'limLow')) return `${part('e')}_(${part('lim')})`;
  if (isM(el, 'limUpp')) return `${part('e')}^(${part('lim')})`;
  if (isM(el, 'bar')) return `${part('e')}̅`;
  if (isM(el, 'acc')) return part('e');
  if (isM(el, 'eqArr')) return kids.filter((k) => isM(k, 'e')).map(mathText).join('; ');
  if (isM(el, 'm')) {
    return `[${kids.filter((k) => isM(k, 'mr')).map((r) => childElements(r).filter((k) => isM(k, 'e')).map(mathText).join(', ')).join('; ')}]`;
  }
  if (el.localName && /Pr$/.test(el.localName)) return '';
  return kids.map(mathText).join('');
}

export async function extractDocxText(buffer: Buffer | ArrayBuffer | Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file('word/document.xml')?.async('string');
  if (!docXml) throw new Error('Not a valid .docx file (word/document.xml missing)');
  const parser = new DOMParser();
  const parse = (xml: string) => parser.parseFromString(xml, 'text/xml') as unknown as Document;

  // ---- numbering definitions
  const abstractLevels = new Map<string, Map<number, LevelDef>>();
  const numToAbstract = new Map<string, string>();
  const numStartOverride = new Map<string, Map<number, number>>();
  const numberingXml = await zip.file('word/numbering.xml')?.async('string');
  if (numberingXml) {
    const nd = parse(numberingXml);
    const root = nd.documentElement as unknown as El;
    for (const el of childElements(root)) {
      if (isW(el, 'abstractNum')) {
        const levels = new Map<number, LevelDef>();
        for (const lvl of childElements(el).filter((c) => isW(c, 'lvl'))) {
          const ilvl = Number(wAttr(lvl, 'ilvl') || 0);
          levels.set(ilvl, {
            numFmt: wAttr(firstChild(lvl, W, 'numFmt'), 'val') || 'decimal',
            lvlText: wAttr(firstChild(lvl, W, 'lvlText'), 'val') ?? `%${ilvl + 1}.`,
            start: Number(wAttr(firstChild(lvl, W, 'start'), 'val') || 1),
          });
        }
        abstractLevels.set(wAttr(el, 'abstractNumId') || '', levels);
      } else if (isW(el, 'num')) {
        const numId = wAttr(el, 'numId') || '';
        numToAbstract.set(numId, wAttr(firstChild(el, W, 'abstractNumId'), 'val') || '');
        const overrides = new Map<number, number>();
        for (const o of childElements(el).filter((c) => isW(c, 'lvlOverride'))) {
          const so = firstChild(o, W, 'startOverride');
          if (so) overrides.set(Number(wAttr(o, 'ilvl') || 0), Number(wAttr(so, 'val') || 1));
        }
        if (overrides.size) numStartOverride.set(numId, overrides);
      }
    }
  }

  // ---- paragraph styles that carry numbering (e.g. "List Number")
  const styleNumPr = new Map<string, { numId: string; ilvl: number }>();
  const stylesXml = await zip.file('word/styles.xml')?.async('string');
  if (stylesXml) {
    const sd = parse(stylesXml);
    for (const st of childElements(sd.documentElement as unknown as El).filter((c) => isW(c, 'style'))) {
      const pPr = firstChild(st, W, 'pPr');
      const numPr = pPr && firstChild(pPr, W, 'numPr');
      const numId = wAttr(numPr && firstChild(numPr, W, 'numId'), 'val');
      if (numId) {
        styleNumPr.set(wAttr(st, 'styleId') || '', { numId, ilvl: Number(wAttr(firstChild(numPr!, W, 'ilvl'), 'val') || 0) });
      }
    }
  }

  const counters = new Map<string, number[]>();
  const listLabel = (numId: string, ilvl: number): string => {
    const levels = abstractLevels.get(numToAbstract.get(numId) || '');
    if (!levels || numId === '0') return '';
    const c = counters.get(numId) || [];
    const def = levels.get(ilvl);
    const start = numStartOverride.get(numId)?.get(ilvl) ?? def?.start ?? 1;
    c[ilvl] = c[ilvl] === undefined ? start : c[ilvl] + 1;
    for (let i = ilvl + 1; i < 9; i++) c[i] = undefined as unknown as number;
    counters.set(numId, c);
    if (!def) return '';
    return def.lvlText.replace(/%(\d)/g, (_, d) => {
      const lvlIdx = Number(d) - 1;
      const lv = levels.get(lvlIdx);
      const value = c[lvlIdx] ?? lv?.start ?? 1;
      return formatNumber(value, lv?.numFmt || 'decimal');
    });
  };

  const inlineText = (el: El): string => {
    let out = '';
    for (const c of childElements(el)) {
      if (isW(c, 't')) out += c.textContent || '';
      else if (isW(c, 'tab')) out += '\t';
      else if (isW(c, 'br') || isW(c, 'cr')) out += '\n';
      else if (isW(c, 'del') || isW(c, 'pPr') || isW(c, 'rPr')) continue;
      else if (isW(c, 'drawing') || isW(c, 'pict') || isW(c, 'object')) out += ' [Figure] ';
      else if (isM(c, 'oMathPara') || isM(c, 'oMath')) out += ` ${mathText(c).trim()} `;
      else out += inlineText(c);
    }
    return out;
  };

  const paragraphText = (p: El): string => {
    const pPr = firstChild(p, W, 'pPr');
    let label = '';
    const numPr = pPr && firstChild(pPr, W, 'numPr');
    if (numPr) {
      const numId = wAttr(firstChild(numPr, W, 'numId'), 'val');
      const ilvl = Number(wAttr(firstChild(numPr, W, 'ilvl'), 'val') || 0);
      if (numId) label = listLabel(numId, ilvl);
    } else {
      const styleId = wAttr(pPr && firstChild(pPr, W, 'pStyle'), 'val');
      const sn = styleId ? styleNumPr.get(styleId) : undefined;
      if (sn) label = listLabel(sn.numId, sn.ilvl);
    }
    const text = inlineText(p).replace(/[ \t]+/g, ' ').trim();
    if (!text && !label) return '';
    return label ? `${label} ${text}`.trim() : text;
  };

  const blockText = (el: El): string[] => {
    const lines: string[] = [];
    for (const c of childElements(el)) {
      if (isW(c, 'p')) {
        const t = paragraphText(c);
        if (t) lines.push(t);
      } else if (isW(c, 'tbl')) {
        for (const tr of childElements(c).filter((x) => isW(x, 'tr'))) {
          const cells = childElements(tr)
            .filter((x) => isW(x, 'tc'))
            .map((tc) => blockText(tc).join(' ').trim());
          if (cells.some(Boolean)) lines.push(cells.join(' | '));
        }
      } else if (isW(c, 'sdt')) {
        const content = firstChild(c, W, 'sdtContent');
        if (content) lines.push(...blockText(content));
      }
    }
    return lines;
  };

  const doc = parse(docXml);
  const body = firstChild(doc.documentElement as unknown as El, W, 'body');
  if (!body) return '';
  return blockText(body).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
