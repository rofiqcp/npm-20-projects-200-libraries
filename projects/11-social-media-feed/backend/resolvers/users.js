import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { generateToken } from '../middleware/auth.js';
import { mockDB } from '../server.js';

export const userResolvers = {
  Query: {
    me: async (_, __, { userId }) => {
      if (!userId) return null;
      return mockDB.getUserById(userId);
    },
    user: async (_, { username }) => {
      return mockDB.getUserByUsername(username);
    },
    searchUsers: async (_, { query }) => {
      return mockDB.searchUsers(query);
    },
    suggestedUsers: async (_, __, { userId }) => {
      return mockDB.getSuggestedUsers(userId);
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      const { username, email, password, bio } = input;
      const existing = mockDB.getUserByEmail(email) || mockDB.getUserByUsername(username);
      if (existing) {
        throw new GraphQLError('User already exists', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = mockDB.createUser({ username, email, passwordHash, bio });
      const token = generateToken(user.id);
      return { token, user };
    },

    login: async (_, { input }) => {
      const { email, password } = input;
      const user = mockDB.getUserByEmail(email);
      if (!user) {
        throw new GraphQLError('Invalid credentials', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new GraphQLError('Invalid credentials', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const token = generateToken(user.id);
      return { token, user };
    },

    followUser: async (_, { userId: targetId }, { userId }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return mockDB.followUser(userId, targetId);
    },

    unfollowUser: async (_, { userId: targetId }, { userId }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return mockDB.unfollowUser(userId, targetId);
    },
  },

  User: {
    isFollowing: (user, _, { userId }) => {
      if (!userId) return false;
      return mockDB.isFollowing(userId, user.id);
    },
    posts: (user) => {
      return mockDB.getPostsByUser(user.id);
    },
  },
};
