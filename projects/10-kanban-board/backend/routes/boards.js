const express = require('express');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const board = new Board({ title: req.body.title, owner: req.user._id });
    await board.save();
    const defaultCols = ['To Do', 'In Progress', 'Done'];
    await Promise.all(defaultCols.map((title, order) => Column.create({ boardId: board._id, title, order })));
    res.json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const columns = await Column.find({ boardId: board._id }).sort('order');
    const tasks = await Task.find({ boardId: board._id }).sort('order');
    res.json({ board, columns, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Board.findByIdAndDelete(req.params.id);
    await Column.deleteMany({ boardId: req.params.id });
    await Task.deleteMany({ boardId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/columns', auth, async (req, res) => {
  try {
    const count = await Column.countDocuments({ boardId: req.params.id });
    const col = new Column({ boardId: req.params.id, title: req.body.title, order: count });
    await col.save();
    res.json(col);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
