import JSZip from 'jszip';

export interface ParsedFileResult {
  fileName: string;
  fileType: 'image' | 'word' | 'pdf' | 'text' | 'unknown';
  text: string;
  imageBase64?: string;
  fileSizeFormatted: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const fileName = file.name;
  const lowerName = fileName.toLowerCase();
  const fileSizeFormatted = formatFileSize(file.size);

  // 1. Định dạng Hình ảnh (Ảnh chụp bài làm, ảnh chữ viết tay)
  if (
    file.type.startsWith('image/') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.webp')
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve({
          fileName,
          fileType: 'image',
          text: `[Đính kèm ảnh bài làm viết tay: ${fileName}]`,
          imageBase64: base64,
          fileSizeFormatted,
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // 2. Định dạng Word (.docx)
  if (lowerName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const documentXml = await zip.file('word/document.xml')?.async('text');

      if (documentXml) {
        // Trích xuất văn bản từ các thẻ <w:t> và công thức <m:t>
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(documentXml, 'application/xml');
        const paragraphs = xmlDoc.getElementsByTagName('w:p');
        const textLines: string[] = [];

        for (let i = 0; i < paragraphs.length; i++) {
          const p = paragraphs[i];
          const textRuns = p.querySelectorAll('w\\:t, t, m\\:t');
          let pText = '';
          textRuns.forEach((r) => {
            pText += r.textContent || '';
          });
          if (pText.trim()) {
            textLines.push(pText.trim());
          }
        }

        const extracted = textLines.join('\n');
        return {
          fileName,
          fileType: 'word',
          text: extracted || `[Đã tải lên file Word: ${fileName}]`,
          fileSizeFormatted,
        };
      }
    } catch (e) {
      console.warn('Lỗi đọc nội dung file .docx:', e);
    }
    return {
      fileName,
      fileType: 'word',
      text: `[File Word bài tập đính kèm: ${fileName}]`,
      fileSizeFormatted,
    };
  }

  // 3. Định dạng PDF (.pdf)
  if (lowerName.endsWith('.pdf') || file.type === 'application/pdf') {
    try {
      const text = await file.text();
      // Trích xuất các khối chữ text cơ bản trong PDF stream nếu có
      const matches = text.match(/\(([^)]+)\)\s*Tj/g);
      if (matches && matches.length > 0) {
        const extracted = matches
          .map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, ''))
          .join(' ')
          .trim();
        if (extracted.length > 20) {
          return {
            fileName,
            fileType: 'pdf',
            text: extracted,
            fileSizeFormatted,
          };
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc pdf text:', e);
    }

    return {
      fileName,
      fileType: 'pdf',
      text: `[File PDF tài liệu bài tập: ${fileName}]`,
      fileSizeFormatted,
    };
  }

  // 4. File văn bản thuần (.txt, .md, .tex)
  try {
    const rawText = await file.text();
    return {
      fileName,
      fileType: 'text',
      text: rawText,
      fileSizeFormatted,
    };
  } catch (e) {
    return {
      fileName,
      fileType: 'unknown',
      text: `[Tệp đính kèm: ${fileName}]`,
      fileSizeFormatted,
    };
  }
}
