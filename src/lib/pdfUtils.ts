import * as pdfjsLib from 'pdfjs-dist';

// Try to setup worker properly for vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
  const pdfDocument = await loadingTask.promise;
  
  let fullText = '';
  // To avoid massive payload issues, we might want to limit pages
  // But let's process up to 30 pages max to keep it responsive.
  const maxPages = Math.min(pdfDocument.numPages, 30);
  
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}
