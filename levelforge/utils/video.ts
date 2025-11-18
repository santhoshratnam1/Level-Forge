export const extractFrameFromVideo = (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      // Seek to 1 second to get a representative frame, or halfway if shorter.
      video.currentTime = Math.min(1, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      let { videoWidth: width, videoHeight: height } = video;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(video.src);
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(video, 0, 0, width, height);
      
      URL.revokeObjectURL(video.src); // Clean up the object URL

      const mimeType = 'image/jpeg';
      const base64 = canvas.toDataURL(mimeType, 0.9).split(',')[1];
      resolve({ base64, mimeType });
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video file. It may be corrupt or in an unsupported format.'));
    };

    // Start loading the video
    video.load();
  });
};
