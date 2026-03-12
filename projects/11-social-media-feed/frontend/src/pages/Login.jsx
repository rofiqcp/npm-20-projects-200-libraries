import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext.jsx';
import { MOCK_AUTH } from '../mockData.js';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id username email bio avatarUrl followersCount followingCount createdAt }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user { id username email bio avatarUrl followersCount followingCount createdAt }
    }
  }
`;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '', bio: '' });
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: ({ login: data }) => {
      login(data.token, data.user);
      navigate('/');
    },
    onError: (err) => {
      if (err.networkError) {
        setUsingMock(true);
      } else {
        setError(err.message);
      }
    },
  });

  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: ({ register: data }) => {
      login(data.token, data.user);
      navigate('/');
    },
    onError: (err) => {
      if (err.networkError) {
        setUsingMock(true);
      } else {
        setError(err.message);
      }
    },
  });

  const loading = loginLoading || registerLoading;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      loginMutation({ variables: { input: { email: form.email, password: form.password } } });
    } else {
      if (!form.username || !form.email || !form.password) {
        setError('All fields are required');
        return;
      }
      registerMutation({ variables: { input: { username: form.username, email: form.email, password: form.password, bio: form.bio } } });
    }
  };

  const handleDemoLogin = () => {
    login(MOCK_AUTH.token, MOCK_AUTH.user);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left — Brand */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-[#1d9bf0]">
        <div className="text-center text-white">
          <svg viewBox="0 0 24 24" className="w-40 h-40 fill-white mx-auto" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <h1 className="text-4xl font-extrabold mt-6">SocialFeed</h1>
          <p className="text-xl mt-3 opacity-90">See what's happening in the world right now.</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <svg viewBox="0 0 24 24" className="w-12 h-12 fill-[#1d9bf0]" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold mb-8">
            {mode === 'login' ? 'Sign in to SocialFeed' : 'Join SocialFeed today'}
          </h2>

          {usingMock && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm">
              ⚠️ Backend not connected. Use demo login below or start the backend server.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-[#536471] mb-1">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="yourname"
                  className="w-full bg-transparent border border-[#2f3336] rounded-lg px-4 py-3 text-white placeholder-[#536471] outline-none focus:border-[#1d9bf0] transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-[#536471] mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-transparent border border-[#2f3336] rounded-lg px-4 py-3 text-white placeholder-[#536471] outline-none focus:border-[#1d9bf0] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#536471] mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent border border-[#2f3336] rounded-lg px-4 py-3 text-white placeholder-[#536471] outline-none focus:border-[#1d9bf0] transition-colors"
                required
                minLength={6}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm text-[#536471] mb-1">Bio (optional)</label>
                <input
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell the world about yourself"
                  className="w-full bg-transparent border border-[#2f3336] rounded-lg px-4 py-3 text-white placeholder-[#536471] outline-none focus:border-[#1d9bf0] transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2f3336]" />
            <span className="text-[#536471] text-sm">or</span>
            <div className="flex-1 h-px bg-[#2f3336]" />
          </div>

          {/* Demo login */}
          <button
            onClick={handleDemoLogin}
            className="w-full btn-ghost py-3 text-base"
          >
            🎭 Demo Login (no backend needed)
          </button>

          {mode === 'login' && (
            <div className="mt-4 text-sm text-[#536471] bg-[#16181c] rounded-xl p-3">
              <p className="font-medium text-white mb-1">Demo credentials:</p>
              <p>Email: <code className="text-[#1d9bf0]">alice@example.com</code></p>
              <p>Password: <code className="text-[#1d9bf0]">password</code></p>
            </div>
          )}

          <p className="text-center text-[#536471] text-sm mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setUsingMock(false); }}
              className="text-[#1d9bf0] hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
