/**
 * Processes an image file from a file input:
 * - Validates file format and size
 * - Crops to square (1:1 aspect ratio centered)
 * - Resizes to target dimension (e.g. 400x400)
 * - Encodes as optimized WebP / JPEG dataURL
 * @param {File} file
 * @param {number} size Target width/height (default 400)
 * @param {number} quality Compression quality 0-1 (default 0.88)
 * @returns {Promise<string>} base64 data URL
 */
export function processImageFile(file, size = 400, quality = 0.88) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file selected.'));
    }

    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (JPG, PNG, WebP).'));
    }

    // 10 MB raw limit
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('Image file size must be under 10MB.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Failed to initialize image canvas context.'));
        }

        // Center-crop calculation (cover)
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        // Try webp first, fallback to jpeg
        let dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
