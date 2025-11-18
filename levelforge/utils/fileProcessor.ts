import { resizeImage } from './image';
import { extractFrameFromVideo } from './video';

export interface ProcessedFile {
  base64: string;
  mimeType: string;
  isVisual: boolean; // True if the source is an image/video frame, false for documents like PDF
}

// Reads a file (like a PDF) and returns its base64 representation.
const readFileAsBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (!reader.result) {
        return reject(new Error(`Failed to read file ${file.name}.`));
      }
      const base64 = (reader.result as string).split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Processes an uploaded file by type, preparing it for AI analysis.
 * - Images are resized.
 * - A single frame is extracted from videos.
 * - PDFs are read directly.
 * @param file The file uploaded by the user.
 * @returns A promise that resolves to a ProcessedFile object.
 */
export const processFileUpload = async (file: File): Promise<ProcessedFile> => {
  const fileType = file.type;

  if (fileType.startsWith('image/')) {
    const { base64, mimeType } = await resizeImage(file, 1920, 1080);
    return { base64, mimeType, isVisual: true };
  } 
  
  if (fileType.startsWith('video/')) {
    const { base64, mimeType } = await extractFrameFromVideo(file, 1920, 1080);
    return { base64, mimeType, isVisual: true };
  } 
  
  if (fileType === 'application/pdf') {
    const { base64, mimeType } = await readFileAsBase64(file);
    return { base64, mimeType, isVisual: false };
  } 
  
  throw new Error(`Unsupported file type: ${fileType}. Please upload an image, video, or PDF.`);
};
