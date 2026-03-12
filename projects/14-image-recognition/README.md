# Project 14: AI Image Recognition App

**Complexity:** ⭐⭐⭐⭐⭐  
**Duration:** 3-4 weeks  
**Database:** PostgreSQL  
**Level:** Advanced

## Overview
Build an advanced image recognition application using TensorFlow.js and MediaPipe for object detection, face recognition, and OCR.

## Tech Stack
- **Frontend:** React + Canvas API
- **Backend:** Express.js
- **Database:** PostgreSQL (metadata)
- **ML Models:** TensorFlow.js + MediaPipe + Tesseract.js
- **Image Processing:** Sharp
- **File Storage:** Cloud Storage (AWS S3)
- **Styling:** Tailwind CSS

## Key Features
- ✅ Upload & process images
- ✅ Object detection
- ✅ Face recognition
- ✅ Text extraction (OCR)
- ✅ Pose detection
- ✅ Batch processing
- ✅ Historical analysis
- ✅ Result visualization

## Tech Dependencies
```bash
# Backend
npm install express pg tensorflow.js tesseract.js mediapipe sharp multer aws-sdk

# Frontend
npm install react tensorflow.js mediapipe canvas-style tailwindcss
```

## Database Schema
```javascript
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  user_id INT,
  original_filename VARCHAR(255),
  s3_url VARCHAR(255),
  upload_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE detections (
  id SERIAL PRIMARY KEY,
  image_id INT REFERENCES images(id),
  detection_type VARCHAR(50), -- 'object', 'face', 'text', 'pose'
  data JSONB,
  confidence FLOAT,
  detected_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE extracted_text (
  id SERIAL PRIMARY KEY,
  image_id INT REFERENCES images(id),
  text_content TEXT,
  confidence FLOAT,
  language VARCHAR(50),
  extracted_at TIMESTAMP DEFAULT NOW()
);
```

## Learning Outcomes
- TensorFlow.js models
- MediaPipe for real-time detection
- Tesseract.js for OCR
- Image processing with Sharp
- Batch processing
- Cloud storage integration
- Canvas API for visualization

## Project Structure
```
image-recognition/
├── backend/
│   ├── ml-models/
│   │   ├── objectDetection.js
│   │   ├── faceRecognition.js
│   │   └── textExtraction.js
│   ├── routes/
│   │   └── images.js
│   ├── services/
│   │   ├── imageService.js
│   │   └── s3Service.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── ObjectDetection.jsx
│   │   │   ├── FaceDetection.jsx
│   │   │   └── TextExtraction.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

## Getting Started
```bash
npm install
npm run server
npm run client
```

## Features to Add
- Real-time webcam detection
- Video processing
- Batch upload processing
- Custom model training
- Annotation tools
- Export results
- Mobile app

## Resources
- TensorFlow.js documentation
- MediaPipe documentation
- Tesseract.js guide
- Sharp documentation
