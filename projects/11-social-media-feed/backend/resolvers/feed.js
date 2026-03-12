import { mockDB } from '../server.js';

export const feedResolvers = {
  Query: {
    feed: async (_, { cursor, limit = 10 }, { userId }) => {
      return mockDB.getFeed({ userId, cursor, limit });
    },
    notifications: async (_, __, { userId }) => {
      if (!userId) return [];
      return mockDB.getNotifications(userId);
    },
  },

  Mutation: {
    markNotificationsRead: async (_, __, { userId }) => {
      if (!userId) return false;
      mockDB.markNotificationsRead(userId);
      return true;
    },
  },
};
