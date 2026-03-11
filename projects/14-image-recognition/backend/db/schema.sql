CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  user_id INT,
  original_filename VARCHAR(255),
  stored_filename VARCHAR(255),
  file_path VARCHAR(255),
  width INT,
  height INT,
  file_size INT,
  upload_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE detections (
  id SERIAL PRIMARY KEY,
  image_id INT REFERENCES images(id) ON DELETE CASCADE,
  detection_type VARCHAR(50),
  class_name VARCHAR(100),
  confidence FLOAT,
  bbox JSONB,
  detected_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_detections_image_id ON detections(image_id);
CREATE INDEX idx_images_upload_date ON images(upload_date DESC);
