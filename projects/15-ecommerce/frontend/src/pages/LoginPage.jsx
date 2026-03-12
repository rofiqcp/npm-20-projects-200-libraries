import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, register } from '../store/userSlice'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.user)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const action = mode === 'login' ? login(form) : register(form)
    const result = await dispatch(action)
    if (!result.error) navigate('/')
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900">ShopHub</h1>
          <p className="text-gray-500 text-sm">{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{m}</button>
          ))}
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="First Name" required value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Last Name" required value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
          )}
          <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300">
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          <strong>Demo credentials:</strong><br />
          admin@shop.com / password123<br />
          user@shop.com / password123
        </div>
      </div>
    </div>
  )
}
