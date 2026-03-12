const express = require('express');
const slugify = require('slugify');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET all published posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag } = req.query;
    const filter = { published: true };
    if (category) filter.categories = category;
    if (tag) filter.tags = tag;
    const posts = await Post.find(filter)
      .populate('author', 'username avatar')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-content');
    const total = await Post.countDocuments(filter);
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const posts = await Post.find({ $text: { $search: q }, published: true })
      .populate('author', 'username')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .select('title slug excerpt author publishedAt');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'username avatar bio')
      .populate('comments.author', 'username avatar');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create post (auth required)
router.post('/', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, excerpt, categories, tags, published } = req.body;
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
    const post = await Post.create({
      title, slug, content, excerpt,
      categories: categories ? JSON.parse(categories) : [],
      tags: tags ? JSON.parse(tags) : [],
      featuredImage: req.file ? `/uploads/${req.file.filename}` : '',
      published: published === 'true',
      publishedAt: published === 'true' ? new Date() : null,
      author: req.user.id,
    });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update post
router.put('/:id', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.featuredImage = `/uploads/${req.file.filename}`;
    if (updates.categories) updates.categories = JSON.parse(updates.categories);
    if (updates.tags) updates.tags = JSON.parse(updates.tags);
    if (updates.published === 'true') updates.publishedAt = new Date();
    const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE post
router.delete('/:id', auth, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.comments.push({ author: req.user.id, authorName: req.user.username, content });
    await post.save();
    res.json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST like post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const alreadyLiked = post.likedBy.some((id) => id.toString() === req.user.id);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id) => id.toString() !== req.user.id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(req.user.id);
      post.likes += 1;
    }
    await post.save();
    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
