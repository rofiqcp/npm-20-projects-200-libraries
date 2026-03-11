import { createContext, useContext, useEffect, useReducer, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

// ── State ─────────────────────────────────────────────────────────────────────

const initialState = {
  user: null,
  token: null,
  socket: null,
  conversations: [],
  activeConversationId: null,
  messages: [],
  isTyping: false,
  streamingContent: '',
  error: null,
  isConnected: false,
  tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, conversationTokens: 0 },
  mode: 'mock', // 'mock' | 'openai'
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, user: action.user, token: action.token };

    case 'SET_SOCKET':
      return { ...state, socket: action.socket };

    case 'SET_CONNECTED':
      return { ...state, isConnected: action.connected };

    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.conversations };

    case 'ADD_CONVERSATION':
      return { ...state, conversations: [action.conversation, ...state.conversations] };

    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversation.id ? action.conversation : c
        ),
      };

    case 'REMOVE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((c) => c.id !== action.id),
        activeConversationId:
          state.activeConversationId === action.id ? null : state.activeConversationId,
        messages: state.activeConversationId === action.id ? [] : state.messages,
      };

    case 'SET_ACTIVE_CONVERSATION':
      return {
        ...state,
        activeConversationId: action.id,
        messages: action.messages || [],
        streamingContent: '',
        isTyping: false,
      };

    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };

    case 'SET_TYPING':
      return { ...state, isTyping: action.isTyping };

    case 'APPEND_TOKEN':
      return { ...state, streamingContent: state.streamingContent + action.token };

    case 'STREAM_COMPLETE':
      return {
        ...state,
        messages: [...state.messages, action.message],
        streamingContent: '',
        isTyping: false,
        tokenUsage: action.usage,
      };

    case 'SET_ERROR':
      return { ...state, error: action.error, isTyping: false, streamingContent: '' };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_MODE':
      return { ...state, mode: action.mode };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef(null);

  // ── Auth helpers ─────────────────────────────────────────────────────────────

  const api = useCallback(
    (config) => {
      return axios({
        baseURL: API_BASE,
        ...config,
        headers: {
          Authorization: state.token ? `Bearer ${state.token}` : undefined,
          'Content-Type': 'application/json',
          ...config.headers,
        },
      });
    },
    [state.token]
  );

  // ── Initialize socket ────────────────────────────────────────────────────────

  const initSocket = useCallback(
    (token) => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const socket = io(API_BASE, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;
      dispatch({ type: 'SET_SOCKET', socket });

      socket.on('connect', () => {
        dispatch({ type: 'SET_CONNECTED', connected: true });
      });

      socket.on('disconnect', () => {
        dispatch({ type: 'SET_CONNECTED', connected: false });
      });

      socket.on('typing_start', () => {
        dispatch({ type: 'SET_TYPING', isTyping: true });
      });

      socket.on('typing_end', () => {
        // handled by stream_complete
      });

      socket.on('token', ({ token: t }) => {
        dispatch({ type: 'APPEND_TOKEN', token: t });
      });

      socket.on('message_complete', ({ message, usage }) => {
        dispatch({ type: 'STREAM_COMPLETE', message, usage });
        // Refresh conversation list to reflect updated title and token count
        fetchConversations(token);
      });

      socket.on('conversation_updated', ({ conversation }) => {
        dispatch({ type: 'UPDATE_CONVERSATION', conversation });
      });

      socket.on('error', ({ message }) => {
        dispatch({ type: 'SET_ERROR', error: message });
        setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 5000);
      });

      return socket;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Check backend mode ────────────────────────────────────────────────────────

  useEffect(() => {
    axios
      .get(`${API_BASE}/health`)
      .then((res) => {
        dispatch({ type: 'SET_MODE', mode: res.data.mode });
      })
      .catch(() => {});
  }, []);

  // ── Restore session ────────────────────────────────────────────────────────────

  useEffect(() => {
    const stored = localStorage.getItem('chatbot_session');
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        dispatch({ type: 'SET_AUTH', user, token });
        initSocket(token);
        fetchConversations(token);
      } catch {
        localStorage.removeItem('chatbot_session');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch conversations ───────────────────────────────────────────────────────

  async function fetchConversations(token) {
    try {
      const res = await axios.get(`${API_BASE}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch({ type: 'SET_CONVERSATIONS', conversations: res.data.data });
    } catch {
      // ignore
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────────

  async function login(username) {
    const res = await axios.post(`${API_BASE}/api/auth/login`, { username });
    const { token, user } = res.data;
    localStorage.setItem('chatbot_session', JSON.stringify({ user, token }));
    dispatch({ type: 'SET_AUTH', user, token });
    const socket = initSocket(token);
    await fetchConversations(token);
    return { user, token, socket };
  }

  async function loginDemo() {
    const res = await axios.post(`${API_BASE}/api/auth/demo`);
    const { token, user } = res.data;
    localStorage.setItem('chatbot_session', JSON.stringify({ user, token }));
    dispatch({ type: 'SET_AUTH', user, token });
    initSocket(token);
    await fetchConversations(token);
    return { user, token };
  }

  function logout() {
    localStorage.removeItem('chatbot_session');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    dispatch({ type: 'SET_AUTH', user: null, token: null });
    dispatch({ type: 'SET_CONVERSATIONS', conversations: [] });
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', id: null, messages: [] });
    dispatch({ type: 'SET_SOCKET', socket: null });
  }

  // ── Conversations ─────────────────────────────────────────────────────────────

  async function createConversation(options = {}) {
    const res = await api({ method: 'post', url: '/api/conversations', data: options });
    const conv = res.data.data;
    dispatch({ type: 'ADD_CONVERSATION', conversation: conv });
    selectConversation(conv);
    return conv;
  }

  async function selectConversation(conv) {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', id: conv.id, messages: conv.messages || [] });
    // Join socket room
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', { conversationId: conv.id });
    }
    // Fetch full messages if not loaded
    try {
      const res = await api({ method: 'get', url: `/api/conversations/${conv.id}` });
      dispatch({
        type: 'SET_ACTIVE_CONVERSATION',
        id: conv.id,
        messages: res.data.data.messages || [],
      });
    } catch {
      // use what we have
    }
  }

  async function deleteConversation(id) {
    await api({ method: 'delete', url: `/api/conversations/${id}` });
    dispatch({ type: 'REMOVE_CONVERSATION', id });
  }

  async function updateConversation(id, updates) {
    const res = await api({ method: 'patch', url: `/api/conversations/${id}`, data: updates });
    dispatch({ type: 'UPDATE_CONVERSATION', conversation: res.data.data });
    return res.data.data;
  }

  async function clearMessages(id) {
    const res = await api({ method: 'delete', url: `/api/conversations/${id}/messages` });
    const updated = res.data.data;
    dispatch({ type: 'UPDATE_CONVERSATION', conversation: updated });
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', id, messages: [] });
  }

  // ── Messaging ─────────────────────────────────────────────────────────────────

  function sendMessage(content) {
    if (!socketRef.current || !state.activeConversationId) return;

    const userMessage = {
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MESSAGE', message: userMessage });

    socketRef.current.emit('send_message', {
      conversationId: state.activeConversationId,
      content,
    });
  }

  function updateSystemPrompt(conversationId, systemPrompt) {
    if (!socketRef.current) return;
    socketRef.current.emit('update_system_prompt', { conversationId, systemPrompt });
  }

  // ── Active conversation object ─────────────────────────────────────────────────

  const activeConversation = state.conversations.find((c) => c.id === state.activeConversationId);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        activeConversation,
        login,
        loginDemo,
        logout,
        createConversation,
        selectConversation,
        deleteConversation,
        updateConversation,
        clearMessages,
        sendMessage,
        updateSystemPrompt,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
