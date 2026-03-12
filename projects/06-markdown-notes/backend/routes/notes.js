const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// All routes require auth
router.use(auth);

// GET /api/notes - list all notes for user
router.get('/', async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = 'SELECT id, title, tags, is_pinned, created_at, updated_at, LEFT(content, 200) as preview FROM notes WHERE user_id = ?';
    const params = [req.user.id];

    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (tag) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    query += ' ORDER BY is_pinned DESC, updated_at DESC';

    const [notes] = await pool.execute(query, params);
    res.json(notes);
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/notes/:id - get single note
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/notes - create note
router.post('/', async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)',
      [req.user.id, title || 'Untitled', content || '', tags || '']
    );

    const [rows] = await pool.execute(
      'SELECT * FROM notes WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/notes/:id - update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags, is_pinned } = req.body;

    const [existing] = await pool.execute(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Note not found' });

    const note = existing[0];

    await pool.execute(
      'UPDATE notes SET title = ?, content = ?, tags = ?, is_pinned = ? WHERE id = ? AND user_id = ?',
      [
        title !== undefined ? title : note.title,
        content !== undefined ? content : note.content,
        tags !== undefined ? tags : note.tags,
        is_pinned !== undefined ? is_pinned : note.is_pinned,
        req.params.id,
        req.user.id
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/notes/:id - delete note
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Note not found' });

    await pool.execute('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
