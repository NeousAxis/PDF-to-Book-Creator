
interface CoverData {
  title: string;
  backCoverText: string;
  authorBio: string;
  widthInches: number;
  heightInches: number;
  spineWidthInches: number;
}

const DPI = 300; // Dots per inch for print quality
const BLEED_INCHES = 0.125;
const SAFE_MARGIN_INCHES = 0.5;

export async function generateCover(data: CoverData): Promise<File> {
  const { title, backCoverText, authorBio, widthInches, heightInches, spineWidthInches } = data;

  // Calculate final dimensions in pixels
  const totalWidth = (widthInches * 2) + spineWidthInches + (BLEED_INCHES * 2);
  const totalHeight = heightInches + (BLEED_INCHES * 2);

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth * DPI;
  canvas.height = totalHeight * DPI;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // --- Background ---
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // --- Define key areas in pixels ---
  const bleedPx = BLEED_INCHES * DPI;
  const safeMarginPx = SAFE_MARGIN_INCHES * DPI;
  const bookHeightPx = heightInches * DPI;
  const bookWidthPx = widthInches * DPI;
  const spineWidthPx = spineWidthInches * DPI;

  // --- Text Styling ---
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // --- Front Cover (Recto) ---
  const frontCoverX = bleedPx + bookWidthPx + spineWidthPx;
  const frontCoverSafeX = frontCoverX + safeMarginPx;
  const frontCoverSafeWidth = bookWidthPx - (safeMarginPx * 2);
  ctx.font = `bold ${DPI * 0.6}px sans-serif`;
  const frontTitleLines = wrapText(ctx, title, frontCoverSafeWidth);
  const frontTextY = bleedPx + bookHeightPx / 2 - (frontTitleLines.length - 1) * (DPI * 0.4) / 2;
  frontTitleLines.forEach((line, index) => {
    ctx.fillText(line, frontCoverX + bookWidthPx / 2, frontTextY + index * (DPI * 0.8));
  });

  // --- Back Cover (Verso) ---
  const backCoverX = bleedPx;
  const backCoverSafeX = backCoverX + safeMarginPx;
  const backCoverSafeWidth = bookWidthPx - (safeMarginPx * 2);
  const backCoverCenter = backCoverX + bookWidthPx / 2;

  ctx.font = `${DPI * 0.2}px sans-serif`;
  const backTextLines = wrapText(ctx, backCoverText, backCoverSafeWidth);
  let currentY = bleedPx + safeMarginPx + (DPI * 0.2);
  backTextLines.forEach(line => {
    ctx.fillText(line, backCoverCenter, currentY);
    currentY += DPI * 0.3;
  });

  ctx.font = `italic ${DPI * 0.18}px sans-serif`;
  const bioLines = wrapText(ctx, authorBio, backCoverSafeWidth);
  currentY += DPI * 0.5; // Add space before bio
  bioLines.forEach(line => {
    ctx.fillText(line, backCoverCenter, currentY);
    currentY += DPI * 0.25;
  });

  // --- Spine ---
  if (spineWidthPx > 0) {
    const spineCenterX = bleedPx + bookWidthPx + (spineWidthPx / 2);
    ctx.save();
    ctx.translate(spineCenterX, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = `bold ${DPI * 0.15}px sans-serif`;
    ctx.fillText(title, 0, 0);
    ctx.restore();
  }

  // --- Convert to File ---
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cover.png', { type: 'image/png' });
        resolve(file);
      } else {
        throw new Error('Failed to create blob from canvas');
      }
    }, 'image/png');
  });
}

// Helper function to wrap text
function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    if (!text) return [];
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
