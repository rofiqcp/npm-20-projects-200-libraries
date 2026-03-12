const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String,
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [String],
  tags: [String],
  featuredImage: { type: String, default: '' },
  published: { type: Boolean, default: false },
  publishedAt: Date,
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
}, { timestamps: true });

postSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
