const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const conversationService = require('../services/conversationService');

// GET /api/conversations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const conversations = await conversationService.getConversations(req.userId);
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/conversations
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, systemPrompt, model } = req.body;
    const conversation = await conversationService.createConversation(req.userId, {
      title,
      systemPrompt,
      model,
    });
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/conversations/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const conversation = await conversationService.getConversation(req.params.id, req.userId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/conversations/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await conversationService.updateConversation(req.params.id, req.userId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await conversationService.deleteConversation(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/conversations/:id/messages (clear messages)
router.delete('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const updated = await conversationService.clearMessages(req.params.id, req.userId);
    if (!updated) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
