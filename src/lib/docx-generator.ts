import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel, 
  TabStopType,
  TabStopPosition,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType
} from "docx";
import { saveAs } from "file-saver";
import { GeneratedPaper } from "@/types";

export async function generateDOCX(paper: GeneratedPaper) {
  // Check if subject is Hindi
  const isHindiSubject = 
    paper.subject.includes("हिन्दी") || 
    paper.subject.toLowerCase().includes("hindi");
  
  const docFont = isHindiSubject ? "Mangal" : "Calibri";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = [];

  // Helper for adding spacing/empty paragraphs
  const addSpacing = (size: number = 200) => {
    children.push(
      new Paragraph({
        spacing: { before: size },
        children: []
      })
    );
  };

  // 1. School Name Header
  if (paper.schoolName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: paper.schoolName.toUpperCase(),
            bold: true,
            size: 28, // 14pt
            font: docFont,
          }),
        ],
      })
    );
  }

  // 2. Exam Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: paper.examName.toUpperCase(),
          bold: true,
          size: 24, // 12pt
          font: docFont,
        }),
      ],
    })
  );

  // 3. Subject & Class Standard Info
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: `Subject: ${paper.subject}   |   Class: ${paper.classText}`,
          bold: true,
          size: 20, // 10pt
          font: docFont,
        }),
      ],
    })
  );

  // 4. Time and Maximum Marks subheader with Tab Stop alignment (single border-bottom)
  children.push(
    new Paragraph({
      spacing: { before: 120, after: 120 },
      border: {
        bottom: { color: "000000", space: 5, style: BorderStyle.SINGLE, size: 6 },
      },
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      children: [
        new TextRun({
          text: `Time Allowed: ${paper.timeText}`,
          bold: true,
          size: 19, // 9.5pt
          font: docFont,
        }),
        new TextRun({
          text: `\tMaximum Marks: ${paper.maxMarksText}`,
          bold: true,
          size: 19,
          font: docFont,
        }),
      ],
    })
  );

  // Add small spacer
  addSpacing(100);

  // 5. General Instructions Container Box (replicates web preview's bg-slate-50 box)
  if (paper.instructions.length > 0) {
    const cellChildren: Paragraph[] = [
      new Paragraph({
        spacing: { before: 40, after: 80 },
        children: [
          new TextRun({
            text: isHindiSubject ? "सामान्य निर्देश:" : "GENERAL INSTRUCTIONS:",
            bold: true,
            size: 19,
            font: docFont,
          }),
        ],
      })
    ];

    paper.instructions.forEach((ins, idx) => {
      cellChildren.push(
        new Paragraph({
          spacing: { before: 30, after: 30 },
          indent: { left: 360, hanging: 360 },
          children: [
            new TextRun({
              text: `${idx + 1}.\t${ins}`,
              size: 18, // 9pt
              font: docFont,
            }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { color: "B0B0B0", space: 8, style: BorderStyle.SINGLE, size: 4 },
          bottom: { color: "B0B0B0", space: 8, style: BorderStyle.SINGLE, size: 4 },
          left: { color: "B0B0B0", space: 8, style: BorderStyle.SINGLE, size: 4 },
          right: { color: "B0B0B0", space: 8, style: BorderStyle.SINGLE, size: 4 },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "F8FAFC" }, // bg-slate-50
                margins: {
                  top: 140,
                  bottom: 140,
                  left: 200,
                  right: 200,
                },
                children: cellChildren,
              }),
            ],
          }),
        ],
      })
    );
    
    addSpacing(150);
  }

  // 6. Sections and Questions
  paper.sections.forEach((section) => {
    if (section.questions.length === 0) return;

    // Section Heading (single thin border bottom)
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        border: {
          bottom: { color: "808080", space: 3, style: BorderStyle.SINGLE, size: 4 },
        },
        children: [
          new TextRun({
            text: `${section.name.toUpperCase()} — ${section.description.toUpperCase()}`,
            bold: true,
            size: 20, // 10pt
            color: "000000",
            font: docFont,
          }),
        ],
      })
    );

    // Questions list
    section.questions.forEach((q) => {
      // Question Title paragraph with hanging indentation and tab stop for marks align
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 80 },
          indent: { left: 540, hanging: 540 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          children: [
            new TextRun({
              text: `${q.number}.\t${q.text}`,
              size: 19, // 9.5pt
              font: docFont,
            }),
            new TextRun({
              text: isHindiSubject ? `\t[${q.marks} अंक]` : `\t[${q.marks} M]`, // Match marks format
              bold: true,
              size: 19,
              font: docFont,
            }),
          ],
        })
      );

      // Choices if MCQ: formatted inside a borderless table to guarantee perfect 2-column alignment
      if (q.choices && q.choices.length > 0) {
        const choices = q.choices;
        const rows: TableRow[] = [];
        
        for (let i = 0; i < choices.length; i += 2) {
          const choiceA = `(${String.fromCharCode(97 + i)}) ${choices[i]}`;
          const choiceB = i + 1 < choices.length ? `(${String.fromCharCode(97 + i + 1)}) ${choices[i + 1]}` : "";
          
          rows.push(
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 4500, type: WidthType.DXA },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                  },
                  children: [
                    new Paragraph({
                      spacing: { after: 40 },
                      children: [
                        new TextRun({
                          text: choiceA,
                          size: 18,
                          font: docFont,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 4500, type: WidthType.DXA },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                  },
                  children: [
                    new Paragraph({
                      spacing: { after: 40 },
                      children: [
                        new TextRun({
                          text: choiceB,
                          size: 18,
                          font: docFont,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          );
        }
        
        children.push(
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            indent: { size: 540, type: WidthType.DXA }, // align with question text margin
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: rows,
          })
        );
      }

      // OR options (formatted with indentation and left border line to match website preview)
      if (q.orQuestion) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 60 },
            indent: { left: 540 },
            children: [
              new TextRun({
                text: isHindiSubject ? "अथवा" : "OR",
                bold: true,
                size: 16,
                font: docFont,
              }),
            ],
          })
        );

        children.push(
          new Paragraph({
            spacing: { after: 100 },
            indent: { left: 540 },
            border: {
              left: { color: "B0B0B0", space: 8, style: BorderStyle.SINGLE, size: 6 },
            },
            children: [
              new TextRun({
                text: q.orQuestion,
                italics: true,
                size: 18,
                font: docFont,
              }),
            ],
          })
        );
      }
    });
  });

  // Pack the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${paper.subject.replace(/\s+/g, "_")}_Class_${paper.classText.replace(/\s+/g, "")}_Exam.docx`;
  saveAs(blob, filename);
}
