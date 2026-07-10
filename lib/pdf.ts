"use client";

// Client-side PDF text extraction. Uses pdfjs-dist with a CDN-hosted worker so
// we don't have to bundle the worker file ourselves — matches the pdfjs-dist
// version in package.json exactly.

import * as pdfjs from "pdfjs-dist";

const PDFJS_VERSION = "4.7.76";

let workerConfigured = false;
function configureWorker() {
  if (workerConfigured) return;
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;
  workerConfigured = true;
}

interface PdfTextItem {
  str?: string;
}

/**
 * Extract plain text from a PDF file. Trims to `maxChars` so a huge textbook
 * upload doesn't blow the AI's context window (Groq/OpenRouter has token limits
 * regardless of what the model advertises).
 */
export async function extractPdfText(file: File, maxChars = 30000): Promise<string> {
  configureWorker();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const chunks: string[] = [];
  let total = 0;
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const text = (content.items as PdfTextItem[])
      .map((it) => it.str ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;
    chunks.push(text);
    total += text.length;
    if (total >= maxChars) break;
  }
  return chunks.join("\n\n").slice(0, maxChars);
}
