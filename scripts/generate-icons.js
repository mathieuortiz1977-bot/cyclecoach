// Generate PWA icons as SVG → PNG using canvas
// Run: node scripts/generate-icons.js

const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, "..", "public", "icons");

// Create SVG icon
function createSVG(size) {
  const padding = size * 0.1;
  const bikeSize = size * 0.45;
  const cx = size / 2;
  const cy = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <text x="${cx}" y="${cy + bikeSize * 0.15}" font-size="${bikeSize}" text-anchor="middle" dominant-baseline="middle">🚴</text>
  <text x="${cx}" y="${size - padding * 1.8}" font-size="${size * 0.11}" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" fill="#f97316" text-anchor="middle">CYCLECOACH</text>
</svg>`;
}

// Write SVG files (browsers can use these; for PNG we'd need sharp/canvas)
for (const size of sizes) {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}x${size}.svg`), svg);
}

// Also create a simple favicon SVG
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
  <text x="16" y="22" font-size="20" text-anchor="middle">🚴</text>
</svg>`;
fs.writeFileSync(path.join(outDir, "..", "favicon.svg"), faviconSvg);

console.log(`Generated ${sizes.length} icons + favicon`);
