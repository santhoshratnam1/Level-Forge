import type { ExtractedFrame } from '../types/portfolio';

const FRAME_WIDTH = 640; // Use a smaller resolution for analysis to save tokens/time

/**
 * Extracts frames from a video file at a specified interval.
 * @param file The video file.
 * @param intervalSeconds The time in seconds between frame captures.
 * @param onProgress Callback to report progress (0-100).
 * @returns A promise that resolves to an array of ExtractedFrame objects.
 */
export const extractFramesFromVideo = (
  file: File,
  intervalSeconds: number,
  onProgress: (progress: number) => void
): Promise<ExtractedFrame[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: ExtractedFrame[] = [];
    
    if (!ctx) {
      return reject(new Error('Could not get canvas context.'));
    }

    video.preload = 'metadata';
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (duration === 0 || !isFinite(duration)) {
        URL.revokeObjectURL(videoUrl);
        return reject(new Error('Video has no duration. It may be corrupt or unsupported.'));
      }

      const aspectRatio = video.videoWidth / video.videoHeight;
      canvas.width = FRAME_WIDTH;
      canvas.height = FRAME_WIDTH / aspectRatio;
      
      let currentTime = 0;

      const captureFrame = () => {
        // Stop if we've processed the whole video or exceeded a reasonable number of frames
        if (currentTime > duration || frames.length >= 30) {
          URL.revokeObjectURL(videoUrl);
          onProgress(100);
          resolve(frames);
          return;
        }

        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        // A small timeout can help ensure the frame is fully rendered before capture
        setTimeout(() => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            frames.push({ timestamp: Math.round(currentTime), base64 });
            
            const progress = Math.min(99, Math.round((currentTime / duration) * 100));
            onProgress(progress);
            
            currentTime += intervalSeconds;
            captureFrame();
        }, 100);
      };
      
      video.onerror = (e) => {
          URL.revokeObjectURL(videoUrl);
          reject(new Error('Error processing video file.'));
      }

      // Start the process
      captureFrame();
    };
    
     video.onerror = (e) => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('Failed to load video metadata. The file may be corrupt or in an unsupported format.'));
    };
  });
};