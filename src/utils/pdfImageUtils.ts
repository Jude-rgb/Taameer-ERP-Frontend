/**
 * Utility functions for handling images in PDF generation
 */

/**
 * Load image and convert to PDF-compatible format with white background
 * This solves the PNG transparency black background issue in jsPDF
 */
export const loadImageForPDF = async (url: string): Promise<string | null> => {
  try {
    // Use public folder for logo assets (served by Vite/frontend)
    let absoluteUrl = url;
    if (/^https?:/i.test(url)) {
      absoluteUrl = url;
    } else if (url.startsWith('/')) {
      // Use current origin for public folder assets
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      absoluteUrl = `${origin}${url}`;
    } else {
      // Relative paths - prepend with current origin
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      absoluteUrl = `${origin}/${url}`;
    }
    
    const res = await fetch(absoluteUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status}`);
    }
    
    const blob = await res.blob();
    
    // Convert PNG to canvas with white background to handle transparency properly
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          // Create canvas with proper size
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Set white background for transparency areas to prevent black background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0);
          
          // Convert to base64 as JPEG (better PDF compatibility)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Error loading image for PDF:', error);
    return null;
  }
};
