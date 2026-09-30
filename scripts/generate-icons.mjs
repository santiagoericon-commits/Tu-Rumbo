// Genera los íconos PNG de la PWA a partir de la marca (app/icon.svg) con el sharp que ya trae next.
// Uso único: node scripts/generate-icons.mjs  (los PNG resultantes se commitean).
// Fondo pine a sangre, sin esquinas ni transparencia: iOS y Android aplican su propia máscara.
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const PINE = "#2F5D50";
const CREAM = "#F6F4EE";
const SAGE_SOFT = "#A8BFAF";

function markSvg(scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${PINE}"/>
  <g transform="translate(256 256) scale(${scale})">
    <polygon points="0,-170 64,0 -64,0" fill="${CREAM}"/>
    <polygon points="0,170 64,0 -64,0" fill="${SAGE_SOFT}"/>
    <circle cx="0" cy="0" r="15" fill="${PINE}"/>
  </g>
</svg>`;
}

// Maskable a escala 0.9: la aguja llega a 153 px del centro, dentro de la zona segura (204.8 px).
const ICONS = [
  { file: "app/apple-icon.png", size: 180, scale: 1.05 },
  { file: "public/icons/icon-192.png", size: 192, scale: 1.05 },
  { file: "public/icons/icon-512.png", size: 512, scale: 1.05 },
  { file: "public/icons/icon-maskable-512.png", size: 512, scale: 0.9 },
];

await mkdir("public/icons", { recursive: true });

for (const { file, size, scale } of ICONS) {
  await sharp(Buffer.from(markSvg(scale)), { density: 288 })
    .resize(size, size)
    .removeAlpha()
    .png()
    .toFile(file);
  console.log(`${file} ${size}×${size}`);
}
