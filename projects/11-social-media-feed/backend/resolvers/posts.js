import { GraphQLError } from 'graphql';
import { mockDB } from '../server.js';

export const postResolvers = {
  Query: {
    post: async (_, { id }) => {
      return mockDB.getPostById(id);
    },
    trendingHashtags: async () => {
      return mockDB.getTrendingHashtags();
    },
  },

  Mutation: {
    createPost: async (_, { input }, { userId, io }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const post = mockDB.createPost({ userId, content: input.content });
      if (io) io.emit('new_post', post);
      return post;
    },

    deletePost: async (_, { id }, { userId }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const post = mockDB.getPostById(id);
      if (!post) throw new GraphQLError('Post not found', { extensions: { code: 'NOT_FOUND' } });
      if (post.author.id !== userId) throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      return mockDB.deletePost(id);
    },

    likePost: async (_, { postId }, { userId, io }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const post = mockDB.likePost(userId, postId);
      if (io) {
        const notification = mockDB.createNotification({
          type: 'LIKE',
          toUserId: post.author.id,
          fromUserId: userId,
          postId,
        });
        io.to(`user_${post.author.id}`).emit('notification', notification);
      }
      return post;
    },

    unlikePost: async (_, { postId }, { userId }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return mockDB.unlikePost(userId, postId);
    },

    retweetPost: async (_, { postId }, { userId, io }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const post = mockDB.retweetPost(userId, postId);
      if (io) {
        const notification = mockDB.createNotification({
          type: 'RETWEET',
          toUserId: post.author.id,
          fromUserId: userId,
          postId,
        });
        io.to(`user_${post.author.id}`).emit('notification', notification);
      }
      return post;
    },

    commentOnPost: async (_, { postId, content }, { userId, io }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const comment = mockDB.addComment({ postId, userId, content });
      const post = mockDB.getPostById(postId);
      if (io && post) {
        const notification = mockDB.createNotification({
          type: 'COMMENT',
          toUserId: post.author.id,
          fromUserId: userId,
          postId,
        });
        io.to(`user_${post.author.id}`).emit('notification', notification);
      }
      return comment;
    },
  },

  Post: {
    isLiked: (post, _, { userId }) => {
      if (!userId) return false;
      return mockDB.isLiked(userId, post.id);
    },
    isRetweeted: (post, _, { userId }) => {
      if (!userId) return false;
      return mockDB.isRetweeted(userId, post.id);
    },
    comments: (post) => {
      return mockDB.getCommentsByPost(post.id);
    },
  },
};
