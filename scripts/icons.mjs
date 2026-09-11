import sharp from "sharp";
import { readFile, mkdir, writeFile } from "node:fs/promises";
const svg = await readFile(
  "stitch_listo_para_viajar_pwa/listo_para_viajar_logo/code.html",
);
await mkdir("public/icons", { recursive: true });
await writeFile("public/logo.svg", svg);
for (const size of [192, 512])
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#FDFBF7" },
})
  .composite([
    {
      input: await sharp(svg).resize(360, 360).png().toBuffer(),
      gravity: "centre",
    },
  ])
  .png()
  .toFile("public/icons/maskable-512.png");
console.log("Logo Stitch e iconos PWA preparados.");
