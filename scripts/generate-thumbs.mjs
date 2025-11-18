#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import fs from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, '..', 'src', 'assets');
const outDir = join(__dirname, '..', 'public', 'img', 'thumbs');

const WIDTH = parseInt(process.env.THUMB_WIDTH || '160', 10);

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs
  .readdirSync(srcDir)
  .filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

async function run() {
  await Promise.all(
    files.map(async (f) => {
      const input = join(srcDir, f);
      const base = basename(f, f.slice(f.lastIndexOf('.')));
      const outWebp = join(outDir, `${base}.webp`);
      const outPng = join(outDir, `${base}.png`);
      try {
        // Generate webp
        await sharp(input).resize({ width: WIDTH }).webp({ quality: 82 }).toFile(outWebp);
        // Generate fallback PNG
        await sharp(input).resize({ width: WIDTH }).png({ compressionLevel: 9 }).toFile(outPng);
        // eslint-disable-next-line no-console
        console.log(`Generated thumbs for ${f}`);
      } catch (e) {
        console.error(`Failed to generate thumb for ${f}:`, e.message);
      }
    })
  );
}

run();


