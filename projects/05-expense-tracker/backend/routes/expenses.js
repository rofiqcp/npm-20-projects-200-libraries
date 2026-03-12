const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/expenses - list all with optional date filtering
router.get('/', (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY date DESC, id DESC';

    const expenses = db.prepare(query).all(...params);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/summary - monthly summary
router.get('/summary', (req, res) => {
  try {
    const monthly = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as total,
        COUNT(*) as count
      FROM expenses
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all();

    const byCategory = db.prepare(`
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `).all();

    const overall = db.prepare(`
      SELECT 
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as average
      FROM expenses
    `).get();

    res.json({ monthly, byCategory, overall });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/expenses/export/csv - export CSV
router.get('/export/csv', (req, res) => {
  try {
    const expenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
    
    const headers = ['ID', 'Title', 'Amount', 'Category', 'Date', 'Notes', 'Created At'];
    const rows = expenses.map(e => [
      e.id,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      e.amount,
      e.category,
      e.date,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      e.created_at
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses - create
router.post('/', (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;
    
    if (!title || !amount || !date) {
      return res.status(400).json({ error: 'Title, amount, and date are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO expenses (title, amount, category, date, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      parseFloat(amount),
      category || 'Other',
      date,
      notes || ''
    );

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id - update
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, notes } = req.body;

    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    db.prepare(`
      UPDATE expenses
      SET title = ?, amount = ?, category = ?, date = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title || existing.title,
      amount !== undefined ? parseFloat(amount) : existing.amount,
      category || existing.category,
      date || existing.date,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id - delete
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
