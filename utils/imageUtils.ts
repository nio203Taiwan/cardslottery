import { ProcessedImage } from '../types';

export const compressImage = (file: File): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Constraint: Resize to reasonable dimensions to help achieve target size ~1.2MB
        // 1.2MB is actually quite large for web, but we will respect the prompt's request for high quality.
        // A 2048x2048 JPEG at 0.9 quality is usually around 500KB-1MB.
        const MAX_DIMENSION = 2048;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Attempt to compress to JPEG.
        // Quality 0.85 usually yields good results around the target size for photos.
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        // Calculate size roughly
        const sizeBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          id: Math.random().toString(36).substring(7),
          originalName: file.name,
          dataUrl,
          sizeBytes,
        });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};