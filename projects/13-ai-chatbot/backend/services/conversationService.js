/**
 * Conversation Service - manages conversation CRUD with in-memory fallback.
 * Uses MongoDB when available, otherwise falls back to in-memory Map storage.
 */

const { v4: uuidv4 } = require('uuid');

// In-memory storage fallback
const inMemoryConversations = new Map();

let useDatabase = false;
let Conversation = null;

function initDatabase() {
  try {
    Conversation = require('../models/Conversation');
    useDatabase = true;
  } catch {
    useDatabase = false;
  }
}

// Try to init DB model (will be used only if mongoose is connected)
initDatabase();

function isMongooseConnected() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}

function shouldUseDB() {
  return useDatabase && isMongooseConnected();
}

// ─── In-memory helpers ───────────────────────────────────────────────────────

function memToConversation(obj) {
  return {
    id: obj.id,
    userId: obj.userId,
    title: obj.title,
    systemPrompt: obj.systemPrompt,
    messages: obj.messages,
    totalTokens: obj.totalTokens,
    model: obj.model,
    isArchived: obj.isArchived,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

async function createConversation(userId, { title, systemPrompt, model } = {}) {
  if (shouldUseDB()) {
    const conv = await Conversation.create({
      userId,
      title: title || 'New Conversation',
      systemPrompt: systemPrompt || 'You are a helpful, knowledgeable, and friendly AI assistant.',
      model: model || 'gpt-3.5-turbo',
    });
    return conv.toSafeObject();
  }

  const conv = {
    id: uuidv4(),
    userId,
    title: title || 'New Conversation',
    systemPrompt: systemPrompt || 'You are a helpful, knowledgeable, and friendly AI assistant.',
    messages: [],
    totalTokens: 0,
    model: model || 'gpt-3.5-turbo',
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryConversations.set(conv.id, conv);
  return memToConversation(conv);
}

async function getConversations(userId) {
  if (shouldUseDB()) {
    const convs = await Conversation.find({ userId, isArchived: false }).sort({ updatedAt: -1 }).lean();
    return convs.map((c) => ({ ...c, id: c._id.toString() }));
  }

  return Array.from(inMemoryConversations.values())
    .filter((c) => c.userId === userId && !c.isArchived)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(memToConversation);
}

async function getConversation(id, userId) {
  if (shouldUseDB()) {
    const conv = await Conversation.findOne({ _id: id, userId }).lean();
    if (!conv) return null;
    return { ...conv, id: conv._id.toString() };
  }

  const conv = inMemoryConversations.get(id);
  if (!conv || conv.userId !== userId) return null;
  return memToConversation(conv);
}

async function addMessage(conversationId, userId, message) {
  if (shouldUseDB()) {
    const conv = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      {
        $push: { messages: message },
        $inc: { totalTokens: message.tokens || 0 },
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!conv) return null;
    // Auto-title from first user message
    if (conv.messages.length === 1 && message.role === 'user') {
      await autoTitle(conversationId, message.content);
    }
    return conv.toSafeObject();
  }

  const conv = inMemoryConversations.get(conversationId);
  if (!conv || conv.userId !== userId) return null;

  conv.messages.push({ ...message, createdAt: new Date() });
  conv.totalTokens += message.tokens || 0;
  conv.updatedAt = new Date();

  if (conv.messages.length === 1 && message.role === 'user') {
    await autoTitle(conversationId, message.content);
  }

  return memToConversation(conv);
}

async function autoTitle(conversationId, firstMessage) {
  const maxLen = 50;
  const title =
    firstMessage.length > maxLen ? firstMessage.substring(0, maxLen).trim() + '…' : firstMessage.trim();

  if (shouldUseDB()) {
    await Conversation.findByIdAndUpdate(conversationId, { title });
    return;
  }

  const conv = inMemoryConversations.get(conversationId);
  if (conv) {
    conv.title = title;
    conv.updatedAt = new Date();
  }
}

async function updateConversation(id, userId, updates) {
  const allowedFields = ['title', 'systemPrompt', 'model', 'isArchived'];
  const safeUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key];
  }

  if (shouldUseDB()) {
    const conv = await Conversation.findOneAndUpdate(
      { _id: id, userId },
      { ...safeUpdates, updatedAt: new Date() },
      { new: true }
    );
    if (!conv) return null;
    return conv.toSafeObject();
  }

  const conv = inMemoryConversations.get(id);
  if (!conv || conv.userId !== userId) return null;

  Object.assign(conv, safeUpdates, { updatedAt: new Date() });
  return memToConversation(conv);
}

async function deleteConversation(id, userId) {
  if (shouldUseDB()) {
    const result = await Conversation.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  const conv = inMemoryConversations.get(id);
  if (!conv || conv.userId !== userId) return false;
  inMemoryConversations.delete(id);
  return true;
}

async function clearMessages(conversationId, userId) {
  if (shouldUseDB()) {
    const conv = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { messages: [], totalTokens: 0, updatedAt: new Date() },
      { new: true }
    );
    if (!conv) return null;
    return conv.toSafeObject();
  }

  const conv = inMemoryConversations.get(conversationId);
  if (!conv || conv.userId !== userId) return null;
  conv.messages = [];
  conv.totalTokens = 0;
  conv.updatedAt = new Date();
  return memToConversation(conv);
}

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  addMessage,
  updateConversation,
  deleteConversation,
  clearMessages,
};
