const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tokens: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
    },
    systemPrompt: {
      type: String,
      default: 'You are a helpful, knowledgeable, and friendly AI assistant.',
    },
    messages: [messageSchema],
    totalTokens: {
      type: Number,
      default: 0,
    },
    model: {
      type: String,
      default: 'gpt-3.5-turbo',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId,
    title: this.title,
    systemPrompt: this.systemPrompt,
    messages: this.messages,
    totalTokens: this.totalTokens,
    model: this.model,
    isArchived: this.isArchived,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Conversation', conversationSchema);
