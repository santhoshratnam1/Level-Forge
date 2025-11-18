export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    // Ensure file is an image
    if (!file.type.startsWith('image/')) {
        return reject(new Error(`File type ${file.type} is not a supported image.`));
    }
      
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error('Failed to read image file.'));
      }
      const img = new Image();
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

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
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Use 'image/jpeg' for better compression on large images
        const mimeType = 'image/jpeg'; 
        const base64 = canvas.toDataURL(mimeType, 0.9).split(',')[1];
        resolve({ base64, mimeType });
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
