import exifr from 'exifr';

export async function validateAndConvertImage(file: File): Promise<{ success: boolean; file?: File; error?: string }> {
  try {
    // 1. Check EXIF for AI generated indicators and manipulated photos
    const metadata = await exifr.parse(file, { xmp: true, tiff: true, iptc: true }).catch(() => null);
    
    if (metadata) {
      // Common tags for AI generators and image editors
      const stringified = JSON.stringify(metadata).toLowerCase();
      const aiKeywords = [
        'midjourney', 
        'dall-e', 
        'dalle', 
        'stable diffusion', 
        'ai generated', 
        'photoshop',
        'lightroom',
        'gimp',
        'canva'
      ];
      
      const isAI = aiKeywords.some(keyword => stringified.includes(keyword));
      
      if (isAI) {
        return { success: false, error: "Image appears to be digitally altered or AI-generated. Please upload a direct, unedited photo of your PAN card." };
      }
    }

    // 2. Convert to JPEG using Canvas
    const bmp = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return { success: false, error: "Failed to process image canvas." };
    }
    
    ctx.drawImage(bmp, 0, 0);
    
    // 3. Output as JPEG Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
    });

    if (!blob) {
      return { success: false, error: "Failed to convert image to JPEG." };
    }

    // 4. Create new File object
    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", {
      type: 'image/jpeg',
    });

    return { success: true, file: newFile };
    
  } catch (err: any) {
    console.error("Error validating image:", err);
    return { success: false, error: "Failed to read image metadata. Please upload a valid, unedited photo." };
  }
}
