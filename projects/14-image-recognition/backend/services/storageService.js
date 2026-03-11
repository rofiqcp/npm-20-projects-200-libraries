// In-memory store as fallback when PostgreSQL is unavailable
const store = {
  images: [],
  detections: [],
  nextImageId: 1,
  nextDetectionId: 1,
};

const memoryStore = {
  async saveImage({ originalFilename, storedFilename, filePath, width, height, fileSize }) {
    const image = {
      id: store.nextImageId++,
      original_filename: originalFilename,
      stored_filename: storedFilename,
      file_path: filePath,
      width,
      height,
      file_size: fileSize,
      upload_date: new Date().toISOString(),
    };
    store.images.push(image);
    return image;
  },

  async getAllImages() {
    return [...store.images].reverse();
  },

  async getImageById(id) {
    return store.images.find((img) => img.id === parseInt(id)) || null;
  },

  async saveDetections(imageId, detections) {
    const saved = detections.map((det) => ({
      id: store.nextDetectionId++,
      image_id: imageId,
      detection_type: det.detection_type,
      class_name: det.class_name,
      confidence: det.confidence,
      bbox: det.bbox,
      detected_at: new Date().toISOString(),
    }));
    store.detections.push(...saved);
    return saved;
  },

  async getDetectionsByImageId(imageId) {
    return store.detections.filter((d) => d.image_id === parseInt(imageId));
  },

  async deleteImage(id) {
    const idx = store.images.findIndex((img) => img.id === parseInt(id));
    if (idx === -1) return null;
    const [removed] = store.images.splice(idx, 1);
    store.detections = store.detections.filter((d) => d.image_id !== parseInt(id));
    return removed;
  },

  async getStats() {
    const totalImages = store.images.length;
    const totalDetections = store.detections.length;
    const byClass = store.detections.reduce((acc, d) => {
      acc[d.class_name] = (acc[d.class_name] || 0) + 1;
      return acc;
    }, {});
    const topClasses = Object.entries(byClass)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([className, count]) => ({ class_name: className, count }));
    return { totalImages, totalDetections, topClasses };
  },
};

// PostgreSQL store
let pgPool = null;

const getPool = () => {
  if (!pgPool && process.env.DATABASE_URL && process.env.USE_POSTGRES === 'true') {
    const { Pool } = require('pg');
    pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pgPool;
};

const pgStore = {
  async saveImage({ originalFilename, storedFilename, filePath, width, height, fileSize }) {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO images (original_filename, stored_filename, file_path, width, height, file_size)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [originalFilename, storedFilename, filePath, width, height, fileSize]
    );
    return result.rows[0];
  },

  async getAllImages() {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM images ORDER BY upload_date DESC');
    return result.rows;
  },

  async getImageById(id) {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM images WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async saveDetections(imageId, detections) {
    const pool = getPool();
    const saved = [];
    for (const det of detections) {
      const result = await pool.query(
        `INSERT INTO detections (image_id, detection_type, class_name, confidence, bbox)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [imageId, det.detection_type, det.class_name, det.confidence, JSON.stringify(det.bbox)]
      );
      saved.push(result.rows[0]);
    }
    return saved;
  },

  async getDetectionsByImageId(imageId) {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM detections WHERE image_id = $1', [imageId]);
    return result.rows;
  },

  async deleteImage(id) {
    const pool = getPool();
    await pool.query('DELETE FROM detections WHERE image_id = $1', [id]);
    const result = await pool.query('DELETE FROM images WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async getStats() {
    const pool = getPool();
    const totalResult = await pool.query('SELECT COUNT(*) FROM images');
    const detResult = await pool.query('SELECT COUNT(*) FROM detections');
    const classResult = await pool.query(
      `SELECT class_name, COUNT(*) as count FROM detections
       GROUP BY class_name ORDER BY count DESC LIMIT 10`
    );
    return {
      totalImages: parseInt(totalResult.rows[0].count),
      totalDetections: parseInt(detResult.rows[0].count),
      topClasses: classResult.rows,
    };
  },
};

// Export the appropriate store based on environment
const usePostgres = process.env.USE_POSTGRES === 'true';
module.exports = usePostgres ? pgStore : memoryStore;
