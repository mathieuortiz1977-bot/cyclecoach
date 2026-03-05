const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "icons");
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcon(size) {
  const radius = Math.round(size * 0.2);
  const fontSize = Math.round(size * 0.5);
  const labelSize = Math.round(size * 0.09);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="#0a0a0a"/>
    <circle cx="${size * 0.35}" cy="${size * 0.52}" r="${size * 0.14}" fill="none" stroke="#f97316" stroke-width="${size * 0.025}"/>
    <circle cx="${size * 0.65}" cy="${size * 0.52}" r="${size * 0.14}" fill="none" stroke="#f97316" stroke-width="${size * 0.025}"/>
    <line x1="${size * 0.35}" y1="${size * 0.52}" x2="${size * 0.50}" y2="${size * 0.30}" stroke="#f97316" stroke-width="${size * 0.025}" stroke-linecap="round"/>
    <line x1="${size * 0.50}" y1="${size * 0.30}" x2="${size * 0.65}" y2="${size * 0.52}" stroke="#f97316" stroke-width="${size * 0.025}" stroke-linecap="round"/>
    <line x1="${size * 0.50}" y1="${size * 0.30}" x2="${size * 0.42}" y2="${size * 0.30}" stroke="#f97316" stroke-width="${size * 0.02}" stroke-linecap="round"/>
    <line x1="${size * 0.35}" y1="${size * 0.52}" x2="${size * 0.50}" y2="${size * 0.52}" stroke="#f97316" stroke-width="${size * 0.02}" stroke-linecap="round"/>
    <line x1="${size * 0.50}" y1="${size * 0.52}" x2="${size * 0.65}" y2="${size * 0.52}" stroke="#f97316" stroke-width="${size * 0.02}" stroke-linecap="round"/>
    <circle cx="${size * 0.48}" cy="${size * 0.26}" r="${size * 0.04}" fill="#f97316"/>
    <text x="${size / 2}" y="${size * 0.82}" font-size="${labelSize}" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-weight="700" fill="#f97316" text-anchor="middle" letter-spacing="${size * 0.005}">CYCLECOACH</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}x${size}.png`));
}

async function generateAppleSplash() {
  // Apple touch icon (180x180, no rounded corners — iOS adds them)
  const size = 180;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#0a0a0a"/>
    <circle cx="${size * 0.35}" cy="${size * 0.48}" r="${size * 0.15}" fill="none" stroke="#f97316" stroke-width="5"/>
    <circle cx="${size * 0.65}" cy="${size * 0.48}" r="${size * 0.15}" fill="none" stroke="#f97316" stroke-width="5"/>
    <line x1="${size * 0.35}" y1="${size * 0.48}" x2="${size * 0.50}" y2="${size * 0.26}" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
    <line x1="${size * 0.50}" y1="${size * 0.26}" x2="${size * 0.65}" y2="${size * 0.48}" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
    <line x1="${size * 0.50}" y1="${size * 0.26}" x2="${size * 0.42}" y2="${size * 0.26}" stroke="#f97316" stroke-width="4" stroke-linecap="round"/>
    <line x1="${size * 0.35}" y1="${size * 0.48}" x2="${size * 0.65}" y2="${size * 0.48}" stroke="#f97316" stroke-width="4" stroke-linecap="round"/>
    <circle cx="${size * 0.48}" cy="${size * 0.22}" r="${size * 0.04}" fill="#f97316"/>
    <text x="${size / 2}" y="${size * 0.78}" font-size="15" font-family="system-ui, -apple-system, Helvetica, sans-serif" font-weight="700" fill="#f97316" text-anchor="middle">CYCLECOACH</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(180, 180)
    .png()
    .toFile(path.join(outDir, "apple-touch-icon.png"));
}

(async () => {
  for (const size of sizes) {
    await generateIcon(size);
    console.log(`  ✓ icon-${size}x${size}.png`);
  }
  await generateAppleSplash();
  console.log("  ✓ apple-touch-icon.png");
  console.log(`Generated ${sizes.length + 1} PNG icons`);
})();
