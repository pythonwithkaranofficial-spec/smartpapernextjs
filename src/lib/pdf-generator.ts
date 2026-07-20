import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { GeneratedPaper } from "@/types";

// Base64 fonts cache to avoid repeated network requests
let dejavuSansBase64 = "";
let notoDevanagariBase64 = "";

async function loadDejaVuFonts() {
  if (dejavuSansBase64) return;
  try {
    const res = await fetch("https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf");
    if (!res.ok) {
      throw new Error("Failed to fetch DejaVuSans font from CDN");
    }
    const buffer = await res.arrayBuffer();
    
    const toBase64 = (buf: ArrayBuffer): string => {
      let binary = "";
      const bytes = new Uint8Array(buf);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    };
    dejavuSansBase64 = toBase64(buffer);
  } catch (e) {
    console.error("Failed to load DejaVuSans font, falling back to Helvetica:", e);
  }
}

async function loadNotoDevanagariFonts() {
  if (notoDevanagariBase64) return;
  try {
    const res = await fetch("https://github.com/google/fonts/raw/main/ofl/notosansdevanagari/NotoSansDevanagari-Regular.ttf");
    if (!res.ok) {
      throw new Error("Failed to fetch NotoSansDevanagari font from repo");
    }
    const buffer = await res.arrayBuffer();
    
    const toBase64 = (buf: ArrayBuffer): string => {
      let binary = "";
      const bytes = new Uint8Array(buf);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    };
    notoDevanagariBase64 = toBase64(buffer);
  } catch (e) {
    console.error("Failed to load NotoSansDevanagari font, falling back to DejaVu:", e);
  }
}

interface TextItem {
  text: string;
  x: number;
  y: number;
  fontSize: number;
}

function extractTextItems(container: HTMLElement, scale: number): TextItem[] {
  const items: TextItem[] = [];
  const containerRect = container.getBoundingClientRect();

  function traverse(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      // Skip non-printing UI elements
      if (el.classList.contains("no-print") || el.closest(".no-print")) {
        return;
      }
      for (let i = 0; i < el.childNodes.length; i++) {
        traverse(el.childNodes[i]);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const parentEl = node.parentElement;
      if (!parentEl) return;

      const style = window.getComputedStyle(parentEl);
      const fontSizePx = parseFloat(style.fontSize);
      const fontSizePt = fontSizePx * 72 / 96;

      const text = node.textContent;
      if (!text || !text.trim()) return;

      // Split text into words/whitespace to trace text wrapping accurately
      const words = text.split(/(\s+)/);
      let charOffset = 0;

      interface WordRect {
        word: string;
        rect: DOMRect;
      }
      const wordRects: WordRect[] = [];

      words.forEach((word) => {
        const len = word.length;
        if (len > 0) {
          const trimWord = word.trim();
          if (trimWord) {
            const range = document.createRange();
            range.setStart(node, charOffset);
            range.setEnd(node, charOffset + len);
            const rect = range.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              wordRects.push({ word: trimWord, rect });
            }
          }
          charOffset += len;
        }
      });

      if (wordRects.length === 0) return;

      // Group words into lines by checking vertical closeness of word rectangles
      const lines: WordRect[][] = [];
      wordRects.forEach((wr) => {
        let added = false;
        for (let i = 0; i < lines.length; i++) {
          const lineFirstWord = lines[i][0];
          if (Math.abs(wr.rect.top - lineFirstWord.rect.top) < Math.max(8, fontSizePx * 0.5)) {
            lines[i].push(wr);
            added = true;
            break;
          }
        }
        if (!added) {
          lines.push([wr]);
        }
      });

      // Sort lines vertically
      lines.sort((a, b) => a[0].rect.top - b[0].rect.top);

      // Add each line as a text item
      lines.forEach((line) => {
        // Sort words within the line horizontally
        line.sort((a, b) => a.rect.left - b.rect.left);

        const lineText = line.map((w) => w.word).join(" ");
        const firstWordRect = line[0].rect;

        const x = (firstWordRect.left - containerRect.left) * scale;
        const y = (firstWordRect.top - containerRect.top) * scale;
        const height = firstWordRect.height * scale;

        items.push({
          text: lineText,
          x,
          y: y + height * 0.75, // Adjust baseline offset
          fontSize: fontSizePt,
        });
      });
    }
  }

  traverse(container);
  return items;
}

interface Block {
  type: "header" | "instructions" | "section-title" | "question";
  top: number;
  bottom: number;
  height: number;
}

interface PageRange {
  start: number; // in DOM pixels
  end: number;   // in DOM pixels
}

export async function generatePDF(paper: GeneratedPaper) {
  // Check if subject is Hindi
  const isHindiSubject = 
    paper.subject.includes("हिन्दी") || 
    paper.subject.toLowerCase().includes("hindi");

  if (isHindiSubject) {
    await loadNotoDevanagariFonts();
    if (!notoDevanagariBase64) {
      await loadDejaVuFonts();
    }
  } else {
    await loadDejaVuFonts();
  }

  const element = document.querySelector(".print-page") as HTMLElement;
  if (!element) {
    throw new Error("Preview element not found");
  }

  // Preserve original inline style changes to prevent rendering artifacts
  const originalTransform = element.style.transform;
  const originalTransition = element.style.transition;
  
  element.style.transform = "none";
  element.style.transition = "none";

  // Force reflow
  void element.offsetHeight;

  try {
    const W_px = element.offsetWidth;
    const H_px = element.offsetHeight;
    const scale = 210 / W_px; // Scale factor: pixels to mm

    const pageRect = element.getBoundingClientRect();

    // 1. Discover unbreakable blocks
    const blocks: Block[] = [];
    const children = Array.from(element.children) as HTMLElement[];
    const headerElements: HTMLElement[] = [];
    let instructionsEl: HTMLElement | null = null;
    let sectionsContainer: HTMLElement | null = null;

    for (const child of children) {
      if (child.classList.contains("bg-slate-50/50") || child.querySelector("h4")?.textContent?.includes("INSTRUCTIONS")) {
        instructionsEl = child;
      } else if (child.classList.contains("space-y-6") || child.querySelector(".space-y-4")) {
        sectionsContainer = child;
      } else if (!child.classList.contains("no-print")) {
        headerElements.push(child);
      }
    }

    // Header block
    if (headerElements.length > 0) {
      const firstRect = headerElements[0].getBoundingClientRect();
      const lastRect = headerElements[headerElements.length - 1].getBoundingClientRect();
      const top = firstRect.top - pageRect.top;
      const bottom = lastRect.bottom - pageRect.top;
      blocks.push({
        type: "header",
        top,
        bottom,
        height: bottom - top
      });
    }

    // Instructions block
    if (instructionsEl) {
      const rect = (instructionsEl as HTMLElement).getBoundingClientRect();
      const top = rect.top - pageRect.top;
      const bottom = rect.bottom - pageRect.top;
      blocks.push({
        type: "instructions",
        top,
        bottom,
        height: bottom - top
      });
    }

    // Section titles and questions
    if (sectionsContainer) {
      const sections = Array.from(sectionsContainer.children) as HTMLElement[];
      sections.forEach((section) => {
        if (section.classList.contains("no-print")) return;

        // Section Title Block
        const titleEl = section.querySelector(".border-b.border-black\\/50") as HTMLElement;
        if (titleEl) {
          const rect = titleEl.getBoundingClientRect();
          const top = rect.top - pageRect.top;
          const bottom = rect.bottom - pageRect.top;
          blocks.push({
            type: "section-title",
            top,
            bottom,
            height: bottom - top
          });
        }

        // Questions inside this section
        const questionsList = section.querySelector(".space-y-4.pl-1") as HTMLElement;
        if (questionsList) {
          const questions = Array.from(questionsList.children) as HTMLElement[];
          questions.forEach((q) => {
            if (q.classList.contains("no-print")) return;
            const rect = q.getBoundingClientRect();
            const top = rect.top - pageRect.top;
            const bottom = rect.bottom - pageRect.top;
            blocks.push({
              type: "question",
              top,
              bottom,
              height: bottom - top
            });
          });
        }
      });
    }

    // Sort blocks by top coordinate to be safe
    blocks.sort((a, b) => a.top - b.top);

    // 2. Pagination Algorithm (A4: 210mm x 297mm)
    // Content height limit is 257mm (leaves 20mm margin at top and bottom)
    const H_page_px = (297 - 40) / scale; 
    const topPadding_px = 20 / scale;

    const pageRanges: PageRange[] = [];
    let Y_pageStart = topPadding_px;
    let currentPageEnd = topPadding_px;

    // Check if the first block starts below topPadding (which it should, due to padding-top: 20mm)
    if (blocks.length > 0 && blocks[0].top > Y_pageStart) {
      Y_pageStart = blocks[0].top;
      currentPageEnd = blocks[0].top;
    }

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const occupiedHeight = block.bottom - Y_pageStart;

      if (occupiedHeight > H_page_px) {
        // Does not fit on current page. Start a new page if current page already has content.
        if (Y_pageStart < block.top) {
          pageRanges.push({
            start: Y_pageStart,
            end: block.top,
          });
          Y_pageStart = block.top;
        } else {
          // Block is larger than H_page_px and current page is already empty.
          // Allow it to overflow.
        }
      }
      currentPageEnd = block.bottom;
    }

    if (currentPageEnd > Y_pageStart) {
      pageRanges.push({
        start: Y_pageStart,
        end: currentPageEnd,
      });
    }

    const numPages = pageRanges.length;

    // Extract text items relative to container bounds before we clone or mutate
    const textItems = extractTextItems(element, scale);

    // Create target PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    if (isHindiSubject && notoDevanagariBase64) {
      doc.addFileToVFS("NotoSansDevanagari.ttf", notoDevanagariBase64);
      doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
      doc.setFont("NotoSansDevanagari", "normal");
    } else if (dejavuSansBase64) {
      doc.addFileToVFS("DejaVuSans.ttf", dejavuSansBase64);
      doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
      doc.setFont("DejaVuSans", "normal");
    } else {
      doc.setFont("helvetica", "normal");
    }

    // Capture visual layer using html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      allowTaint: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".print-page") as HTMLElement;
        if (clonedElement) {
          // Remove all non-printing UI elements
          clonedElement.querySelectorAll(".no-print").forEach((el) => el.remove());
          
          // Reset styling for clean printing
          clonedElement.style.boxShadow = "none";
          clonedElement.style.border = "none";
          clonedElement.style.margin = "0";
          clonedElement.style.transform = "none";
          clonedElement.style.transition = "none";
          clonedElement.style.width = `${W_px}px`;
        }
      },
    });

    const canvasScale = canvas.width / W_px;
    const margin_px = 20 / scale;
    const margin_canvas = margin_px * canvasScale;

    // Create sliced pages in a loop
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.width * (297 / 210); // A4 height in pixels
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      throw new Error("Failed to create temporary canvas 2D context");
    }

    for (let pageIdx = 0; pageIdx < numPages; pageIdx++) {
      if (pageIdx > 0) {
        doc.addPage();
      }

      // Clear temp canvas with white background
      tempCtx.fillStyle = "#ffffff";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      const range = pageRanges[pageIdx];
      const sliceHeight_px = range.end - range.start;
      const sliceHeight_canvas = sliceHeight_px * canvasScale;

      // Slice visual content from original canvas to temp canvas, shifting below top margin
      tempCtx.drawImage(
        canvas,
        0,
        range.start * canvasScale,
        canvas.width,
        sliceHeight_canvas,
        0,
        margin_canvas,
        tempCanvas.width,
        sliceHeight_canvas
      );

      // Add visual background to PDF page from edge to edge
      const pageDataUrl = tempCanvas.toDataURL("image/jpeg", 0.95);
      doc.addImage(pageDataUrl, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }

    // Overlay invisible selectable text on top of the visual layout
    textItems.forEach((item) => {
      // Find which page range contains this text item's y position
      const itemY_px = item.y / scale; 
      
      let pageIdx = -1;
      for (let p = 0; p < numPages; p++) {
        const range = pageRanges[p];
        if (itemY_px >= range.start && itemY_px < range.end) {
          pageIdx = p;
          break;
        }
        if (p === numPages - 1 && itemY_px >= range.start) {
          pageIdx = p;
          break;
        }
      }

      if (pageIdx !== -1) {
        const range = pageRanges[pageIdx];
        
        // Calculate y local to this page in mm: 20mm top margin + (itemY_px - range.start) * scale
        const yLocal = 20 + (itemY_px - range.start) * scale;

        doc.setPage(pageIdx + 1);
        doc.setFontSize(item.fontSize);
        doc.text(item.text, item.x, yLocal, { renderingMode: "invisible" });
      }
    });

    // Save output PDF
    const filename = `${paper.subject.replace(/\s+/g, "_")}_Class_${paper.classText.replace(/\s+/g, "")}_Exam.pdf`;
    doc.save(filename);
  } finally {
    // Restore transform/transition
    element.style.transform = originalTransform;
    element.style.transition = originalTransition;
  }
}
