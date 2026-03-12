const conversationService = require('../services/conversationService');
const { streamLLMResponse } = require('../services/llmService');

// Simple in-memory rate limiter: userId -> { count, resetAt }
const rateLimits = new Map();
const RATE_LIMIT = 20; // messages per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(userId) {
  const now = Date.now();
  const entry = rateLimits.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count += 1;
  return true;
}

function registerSocketHandlers(io, socket) {
  const userId = socket.userId;

  // ── send_message ──────────────────────────────────────────────────────────
  socket.on('send_message', async (data) => {
    const { conversationId, content, model } = data;

    if (!conversationId || !content?.trim()) {
      socket.emit('error', { message: 'conversationId and content are required' });
      return;
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      socket.emit('error', { message: 'Rate limit exceeded. Please wait a moment.' });
      return;
    }

    try {
      // 1. Load conversation
      const conversation = await conversationService.getConversation(conversationId, userId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // 2. Save user message
      const userMessage = {
        role: 'user',
        content: content.trim(),
        tokens: Math.ceil(content.length / 4),
        createdAt: new Date(),
      };
      await conversationService.addMessage(conversationId, userId, userMessage);

      // 3. Emit typing indicator
      socket.emit('typing_start', { conversationId });

      // 4. Build message history for LLM
      const messageHistory = [...conversation.messages, userMessage];

      // 5. Stream LLM response
      let fullResponse = '';

      await streamLLMResponse({
        messages: messageHistory,
        systemPrompt: conversation.systemPrompt,
        model: model || conversation.model,
        onToken: (token) => {
          fullResponse += token;
          socket.emit('token', { conversationId, token });
        },
        onComplete: async (response, usage) => {
          // Save assistant message
          const assistantMessage = {
            role: 'assistant',
            content: response,
            tokens: usage?.completion_tokens || Math.ceil(response.length / 4),
            createdAt: new Date(),
          };
          await conversationService.addMessage(conversationId, userId, assistantMessage);

          // Get updated conversation for token counts
          const updated = await conversationService.getConversation(conversationId, userId);

          socket.emit('message_complete', {
            conversationId,
            message: assistantMessage,
            usage: {
              promptTokens: usage?.prompt_tokens || 0,
              completionTokens: usage?.completion_tokens || 0,
              totalTokens: usage?.total_tokens || 0,
              conversationTokens: updated?.totalTokens || 0,
            },
          });

          socket.emit('typing_end', { conversationId });
        },
        onError: (error) => {
          console.error('[Socket] LLM error:', error);
          socket.emit('typing_end', { conversationId });
          socket.emit('error', {
            message: 'Failed to generate response. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          });
        },
      });
    } catch (error) {
      console.error('[Socket] send_message error:', error);
      socket.emit('typing_end', { conversationId });
      socket.emit('error', { message: 'An unexpected error occurred.' });
    }
  });

  // ── update_system_prompt ──────────────────────────────────────────────────
  socket.on('update_system_prompt', async ({ conversationId, systemPrompt }) => {
    try {
      const updated = await conversationService.updateConversation(conversationId, userId, {
        systemPrompt,
      });
      if (!updated) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }
      socket.emit('conversation_updated', { conversation: updated });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // ── join_conversation ─────────────────────────────────────────────────────
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User ${userId} disconnected`);
  });
}

module.exports = { registerSocketHandlers };
