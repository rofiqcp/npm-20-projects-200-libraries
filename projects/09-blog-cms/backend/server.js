require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5004;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_cms';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    // Ensure uploads folder exists
    const fs = require('fs');
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    app.listen(PORT, () => console.log(`Blog CMS server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
