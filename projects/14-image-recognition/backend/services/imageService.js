const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const THUMBNAIL_SIZE = 300;
const MAX_DIMENSION = 1920;

async function processImage(filePath) {
  const metadata = await sharp(filePath).metadata();

  let pipeline = sharp(filePath);

  // Resize if too large, preserving aspect ratio
  if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
    pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Re-save optimized version in place
  const optimized = await pipeline
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();

  fs.writeFileSync(filePath, optimized);

  const finalMeta = await sharp(filePath).metadata();
  return {
    width: finalMeta.width,
    height: finalMeta.height,
    format: finalMeta.format,
    fileSize: fs.statSync(filePath).size,
  };
}

async function generateThumbnail(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const thumbPath = path.join(dir, `${base}_thumb${ext}`);

  await sharp(filePath)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toFile(thumbPath);

  return thumbPath;
}

async function getImageMetadata(filePath) {
  const meta = await sharp(filePath).metadata();
  return {
    width: meta.width,
    height: meta.height,
    format: meta.format,
    fileSize: fs.statSync(filePath).size,
  };
}

module.exports = { processImage, generateThumbnail, getImageMetadata };
