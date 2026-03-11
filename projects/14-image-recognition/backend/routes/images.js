const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const upload = require('../middleware/upload');
const storageService = require('../services/storageService');
const { processImage } = require('../services/imageService');

// POST /api/images/upload
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const filePath = req.file.path;

    // Process and optimize image with Sharp
    const { width, height, fileSize } = await processImage(filePath);

    // Save to store
    const image = await storageService.saveImage({
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      filePath: req.file.filename, // store relative path
      width,
      height,
      fileSize,
    });

    res.status(201).json({
      success: true,
      image: {
        ...image,
        url: `/uploads/${req.file.filename}`,
      },
    });
  } catch (err) {
    console.error('Upload error:', err);
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to process image', details: err.message });
  }
});

// POST /api/images/:id/detections  — save ML results from frontend
router.post('/:id/detections', async (req, res) => {
  const { id } = req.params;
  const { detections } = req.body;

  if (!Array.isArray(detections)) {
    return res.status(400).json({ error: 'detections must be an array' });
  }

  try {
    const image = await storageService.getImageById(id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    const saved = await storageService.saveDetections(parseInt(id), detections);
    res.status(201).json({ success: true, detections: saved });
  } catch (err) {
    console.error('Save detections error:', err);
    res.status(500).json({ error: 'Failed to save detections', details: err.message });
  }
});

// GET /api/images
router.get('/', async (req, res) => {
  try {
    const images = await storageService.getAllImages();
    const enriched = images.map((img) => ({
      ...img,
      url: `/uploads/${img.stored_filename}`,
    }));
    res.json(enriched);
  } catch (err) {
    console.error('Get images error:', err);
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
});

// GET /api/images/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await storageService.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// GET /api/images/:id
router.get('/:id', async (req, res) => {
  try {
    const image = await storageService.getImageById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    const detections = await storageService.getDetectionsByImageId(req.params.id);
    res.json({
      ...image,
      url: `/uploads/${image.stored_filename}`,
      detections,
    });
  } catch (err) {
    console.error('Get image error:', err);
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});

// DELETE /api/images/:id
router.delete('/:id', async (req, res) => {
  try {
    const image = await storageService.getImageById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Delete physical file
    const filePath = path.join(__dirname, '../uploads', image.stored_filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const thumbPath = filePath.replace(/(\.\w+)$/, '_thumb$1');
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

    await storageService.deleteImage(req.params.id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
