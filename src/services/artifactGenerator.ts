import pptxgen from 'pptxgenjs';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType
} from 'docx';
import * as XLSX from 'xlsx';

import type {
  ArtifactItem,
  PptxStructuredContent,
  DocxStructuredContent,
  XlsxStructuredContent,
  KbGuidanceRef,
  OutputContract
} from '../types/antigravity';

export interface GeneratedPptxPayload {
  artifact: ArtifactItem;
  slides: {
    title: string;
    bullets: string[];
    layout: 'title' | 'content' | 'split' | 'summary';
    notes?: string;
  }[];
}

/**
 * Pure Deterministic PPTX Renderer:
 * Takes Qwen-generated structured presentation content and compiles a genuine Microsoft PowerPoint (.pptx) file.
 * Returns both the ArtifactItem with a browser-downloadable Blob URL and the slide definitions.
 */
export async function generatePptxDeliverable(
  qwenContent: PptxStructuredContent,
  expectedFilename?: string,
  userFiles: string[] = []
): Promise<GeneratedPptxPayload> {
  const nowId = Date.now().toString().slice(-4);
  const filename = expectedFilename || `Generated/Presentation_${nowId}.pptx`;
  const artifactName = filename.replace(/^Generated\//, '');

  // Initialize pptxgenjs
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Lumi Sovereign AI Workbench';
  pptx.company = 'CoreWithin Industrial Intelligence';
  pptx.title = qwenContent.title;
  pptx.subject = qwenContent.subtitle;

  // Render Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '0F172A' }; // Dark slate theme
  titleSlide.addText(qwenContent.title, {
    x: 1.0,
    y: 2.2,
    w: 11.3,
    h: 1.8,
    fontSize: 34,
    bold: true,
    color: 'F8FAFC',
    align: 'left'
  });
  titleSlide.addText(qwenContent.subtitle || 'Industrial Strategy & Executive Briefing', {
    x: 1.0,
    y: 4.2,
    w: 11.3,
    h: 0.8,
    fontSize: 18,
    color: '94A3B8',
    align: 'left'
  });
  titleSlide.addText(`Engine: Qwen3-8B-Instruct | Generated: ${new Date().toLocaleDateString()} | Air-Gap Secure`, {
    x: 1.0,
    y: 6.2,
    w: 11.3,
    h: 0.5,
    fontSize: 11,
    color: '64748B'
  });

  const processedSlides: GeneratedPptxPayload['slides'] = [];

  // Render Content Slides
  for (let idx = 0; idx < qwenContent.slides.length; idx++) {
    const slideData = qwenContent.slides[idx];
    const slide = pptx.addSlide();
    slide.background = { color: '0F172A' };

    // Slide Header
    slide.addText(slideData.title, {
      x: 0.8,
      y: 0.6,
      w: 11.7,
      h: 0.8,
      fontSize: 22,
      bold: true,
      color: 'F8FAFC'
    });

    // Subtitle / Purpose bar
    if (slideData.purpose) {
      slide.addText(slideData.purpose, {
        x: 0.8,
        y: 1.3,
        w: 11.7,
        h: 0.4,
        fontSize: 12,
        color: '38BDF8'
      });
    }

    // Bullets Body
    const bulletItems = slideData.content && slideData.content.length > 0
      ? slideData.content.map(b => ({
          text: b,
          options: {
            bullet: true,
            fontSize: 15,
            color: 'E2E8F0',
            breakLine: true
          }
        }))
      : [{ text: 'No bullet points specified.', options: { bullet: true, fontSize: 15, color: 'E2E8F0', breakLine: true } }];

    slide.addText(bulletItems as any, {
      x: 0.8,
      y: 2.0,
      w: 11.7,
      h: 4.6,
      paraSpaceAfter: 12
    });

    // Speaker Notes
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }

    processedSlides.push({
      title: slideData.title,
      bullets: slideData.content || [],
      layout: slideData.layout || 'content',
      notes: slideData.speakerNotes
    });
  }

  // Generate binary Blob
  const blob = (await pptx.write({ outputType: 'blob' })) as Blob;
  const downloadUrl = typeof window !== 'undefined' && window.URL ? window.URL.createObjectURL(blob) : undefined;

  const artifact: ArtifactItem = {
    id: `art-pptx-${nowId}`,
    name: artifactName,
    type: 'pptx',
    path: filename,
    sizeBytes: blob.size || 124500,
    description: `PowerPoint presentation (.pptx) with ${qwenContent.slides.length} slides reasoned by Qwen from task inputs.`,
    createdAt: new Date().toLocaleTimeString(),
    downloadUrl,
    blob,
    approvalStatus: 'approved',
    slideCount: qwenContent.slides.length,
    slides: processedSlides.map(s => ({ title: s.title, bullets: s.bullets, layout: s.layout }))
  };

  return { artifact, slides: processedSlides };
}

/**
 * Pure Deterministic DOCX Renderer:
 * Takes Qwen-generated structured document content and compiles a genuine Microsoft Word (.docx) file.
 * Formats Title, Executive Summary, numbered sections, data tables, and human sign-off block.
 */
export async function generateDocxDeliverable(
  qwenContent: DocxStructuredContent,
  expectedFilename?: string,
  userFiles: string[] = []
): Promise<ArtifactItem> {
  const nowId = Date.now().toString().slice(-4);
  const filename = expectedFilename || `Generated/Approval_Note_${nowId}.docx`;
  const artifactName = filename.replace(/^Generated\//, '');

  const docChildren: any[] = [];

  // Document Title
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: qwenContent.documentTitle || 'FORMAL INDUSTRIAL APPROVAL NOTE',
          bold: true,
          size: 32,
          color: '0F172A'
        })
      ]
    })
  );

  // Subtitle / Document Type
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `${qwenContent.documentType || 'Official Engineering Compliance Document'} | Ref: ${qwenContent.metadata?.referenceNumber || `MRPL-ENG-${nowId}`}`,
          italics: true,
          size: 20,
          color: '475569'
        })
      ]
    })
  );

  // Metadata Table
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: `Date: ${qwenContent.metadata?.date || new Date().toLocaleDateString()}`, bold: true })] })]
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: `Facility / Unit: ${qwenContent.metadata?.facility || 'Crude Distillation Unit (CDU-5)'}`, bold: true })] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: `Equipment Tag: ${qwenContent.metadata?.equipmentTag || 'Crude Feed Line 04-CR-102'}`, bold: true })] })]
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: `Sign-off Status: ${qwenContent.metadata?.signOffStatus || 'Pending Formal Review'}`, bold: true, color: 'D97706' })] })]
        })
      ]
    })
  ];

  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: metaRows
    })
  );

  docChildren.push(new Paragraph({ spacing: { after: 300 }, children: [] }));

  // Executive Summary Box
  if (qwenContent.executiveSummary) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: 'Executive Summary', bold: true, size: 24, color: '1E3A8A' })]
      })
    );
    docChildren.push(
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({ text: qwenContent.executiveSummary, size: 22 })]
      })
    );
  }

  // Sections
  for (const sec of qwenContent.sections) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: sec.heading, bold: true, size: 24, color: '1E3A8A' })]
      })
    );

    if (sec.paragraphs) {
      for (const p of sec.paragraphs) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: p, size: 22 })]
          })
        );
      }
    }

    if (sec.bulletPoints && sec.bulletPoints.length > 0) {
      for (const bp of sec.bulletPoints) {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: [new TextRun({ text: bp, size: 22 })]
          })
        );
      }
    }

    if (sec.keyMetrics && Object.keys(sec.keyMetrics).length > 0) {
      const metricRows: TableRow[] = Object.entries(sec.keyMetrics).map(([k, v]) => (
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20 })] })]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: String(v), size: 20 })] })]
            })
          ]
        })
      ));

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: metricRows
        })
      );
      docChildren.push(new Paragraph({ spacing: { after: 180 }, children: [] }));
    }
  }

  // Sign-Off Block
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 360, after: 120 },
      children: [new TextRun({ text: '7. Engineering Sign-Off Block', bold: true, size: 24, color: '1E3A8A' })]
    })
  );

  const signOffRows = [
    new TableRow({
      children: [
        new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Prepared By:', bold: true })] }), new Paragraph({ children: [new TextRun({ text: qwenContent.signOffBlock?.preparedBy || 'Lead Corrosion & Inspection Engineer' })] })] }),
        new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Verified By:', bold: true })] }), new Paragraph({ children: [new TextRun({ text: qwenContent.signOffBlock?.verifiedBy || 'Operations & Maintenance Manager' })] })] }),
        new TableCell({ width: { size: 34, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Official Status:', bold: true })] }), new Paragraph({ children: [new TextRun({ text: qwenContent.signOffBlock?.status || 'APPROVED FOR EXECUTION', color: '16A34A', bold: true })] })] })
      ]
    })
  ];

  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: signOffRows
    })
  );

  const doc = new Document({
    sections: [{ children: docChildren }]
  });

  const blob = await Packer.toBlob(doc);
  const downloadUrl = typeof window !== 'undefined' && window.URL ? window.URL.createObjectURL(blob) : undefined;

  return {
    id: `art-docx-${nowId}`,
    name: artifactName,
    type: 'docx',
    path: filename,
    sizeBytes: blob.size || 48500,
    description: `Word technical approval note (.docx) reasoned and synthesized by Qwen from inspection findings and SOP standards.`,
    createdAt: new Date().toLocaleTimeString(),
    downloadUrl,
    blob,
    approvalStatus: 'approved'
  };
}

/**
 * Pure Deterministic XLSX Renderer:
 * Takes Qwen-generated structured spreadsheet content and compiles a genuine Microsoft Excel (.xlsx) workbook.
 * Writes sheets, column headers, data rows, and summary formula totals.
 */
export async function generateXlsxDeliverable(
  qwenContent: XlsxStructuredContent,
  expectedFilename?: string,
  userFiles: string[] = []
): Promise<ArtifactItem> {
  const nowId = Date.now().toString().slice(-4);
  const filename = expectedFilename || `Generated/Cost_Report_${nowId}.xlsx`;
  const artifactName = filename.replace(/^Generated\//, '');

  const wb = XLSX.utils.book_new();

  for (const sheet of qwenContent.sheets) {
    const sheetData: any[][] = [];

    // Header row
    sheetData.push(sheet.headers);

    // Data rows
    for (const row of sheet.rows) {
      sheetData.push(row);
    }

    // Formulas or summary
    if (sheet.formulas && sheet.formulas.length > 0) {
      sheetData.push([]);
      for (const formula of sheet.formulas) {
        sheetData.push([formula]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const safeSheetName = (sheet.name || 'Sheet1').replace(/[\/\\\?\*\[\]]/g, '_').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  }

  // Generate binary XLSX
  const arrayBuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([arrayBuf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const downloadUrl = typeof window !== 'undefined' && window.URL ? window.URL.createObjectURL(blob) : undefined;

  return {
    id: `art-xlsx-${nowId}`,
    name: artifactName,
    type: 'xlsx',
    path: filename,
    sizeBytes: blob.size || 32400,
    description: `Excel workbook (.xlsx) containing ${qwenContent.sheets.length} sheets reasoned by Qwen and calculated deterministically.`,
    createdAt: new Date().toLocaleTimeString(),
    downloadUrl,
    blob,
    approvalStatus: 'approved'
  };
}

/**
 * Pure Deterministic Code Deliverable Generator:
 * Takes Qwen-generated Python code and creates a downloadable .py script.
 */
export function generateCodeDeliverable(
  pythonCode: string,
  expectedFilename?: string,
  description?: string
): ArtifactItem {
  const nowId = Date.now().toString().slice(-4);
  const filename = expectedFilename || `Generated/Reliability_Analysis_${nowId}.py`;
  const artifactName = filename.replace(/^Generated\//, '');

  const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8' });
  const downloadUrl = typeof window !== 'undefined' && window.URL ? window.URL.createObjectURL(blob) : undefined;

  return {
    id: `art-py-${nowId}`,
    name: artifactName,
    type: 'py',
    path: filename,
    sizeBytes: blob.size || 4200,
    description: description || `Executable Python script generated by Qwen2.5-Coder for sandboxed execution.`,
    createdAt: new Date().toLocaleTimeString(),
    downloadUrl,
    blob,
    approvalStatus: 'approved'
  };
}
