import JSZip from 'jszip';

/**
 * Reads all project source files using Vite's import.meta.glob (eager, as string),
 * then generates a ZIP and triggers a browser download.
 */

// Use import.meta.glob to bundle key source files at build time.
// The `?raw` suffix tells Vite to import files as plain text strings.
const sourceModules = import.meta.glob(
  [
    '/src/**/*.{ts,tsx,css}',
    '/index.html',
    '/vite.config.ts',
    '/tsconfig.json',
    '/package.json',
    '/.env.example',
  ],
  { eager: true, query: '?raw', import: 'default' }
) as Record<string, string>;

export async function downloadCompleteProjectZip(): Promise<boolean> {
  try {
    const zip = new JSZip();

    // Iterate through all project files collected by Vite glob
    for (const [filePath, content] of Object.entries(sourceModules)) {
      // Vite glob paths start with '/' — strip the leading slash for the zip entry
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      zip.file(cleanPath, content);
    }

    // Generate zip binary as a Blob right in the user's browser memory
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6,
      },
    });

    // Create an object URL from the Blob and download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'math-diagnostic-ai.zip';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);

    return true;
  } catch (error) {
    console.error('Error creating ZIP bundle:', error);
    return false;
  }
}
