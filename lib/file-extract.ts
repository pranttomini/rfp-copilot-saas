type ExtractionResult = {
  text: string;
  warning?: string;
};

function isProbablyReadableText(input: string) {
  if (!input.trim()) return false;
  const controlChars = input.split('').filter((char) => char.charCodeAt(0) < 9).length;
  return controlChars < Math.max(8, Math.floor(input.length * 0.02));
}

async function extractDocx(file: File): Promise<ExtractionResult> {
  try {
    const mammoth = await import('mammoth');
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    if (result.value?.trim()) return { text: result.value };
    return { text: '', warning: 'DOCX was uploaded but did not contain readable text.' };
  } catch {
    return {
      text: await file.text(),
      warning: 'DOCX extraction unavailable. Parsed as plain text fallback.'
    };
  }
}

async function extractPdf(file: File): Promise<ExtractionResult> {
  try {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule as { default: (buffer: Buffer) => Promise<{ text?: string }> }).default;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);
    if (result.text?.trim()) return { text: result.text };
    return { text: '', warning: 'PDF was uploaded but no extractable text was found.' };
  } catch {
    return {
      text: await file.text(),
      warning: 'PDF extraction unavailable. Parsed as plain text fallback.'
    };
  }
}

export async function extractTextFromUpload(file: File): Promise<ExtractionResult> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.docx')) return extractDocx(file);
  if (lowerName.endsWith('.pdf')) return extractPdf(file);

  const text = await file.text();
  if (isProbablyReadableText(text)) return { text };

  return {
    text,
    warning: 'File content may be binary. Extraction quality may be limited.'
  };
}
