import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const login = createAsyncThunk('user/login', async ({ email, password }) => {
  const res = await axios.post('/api/auth/login', { email, password })
  localStorage.setItem('token', res.data.token)
  axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
  return res.data
})

export const register = createAsyncThunk('user/register', async (data) => {
  const res = await axios.post('/api/auth/register', data)
  localStorage.setItem('token', res.data.token)
  axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
  return res.data
})

const userSlice = createSlice({
  name: 'user',
  initialState: { currentUser: null, token: localStorage.getItem('token'), loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.currentUser = null
      state.token = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
    setUser: (state, action) => { state.currentUser = action.payload },
    initAuth: (state) => {
      const token = localStorage.getItem('token')
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        state.token = token
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.currentUser = action.payload.user; state.token = action.payload.token })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.error.message })
      .addCase(register.fulfilled, (state, action) => { state.currentUser = action.payload.user; state.token = action.payload.token })
  },
})

export const { logout, setUser, initAuth } = userSlice.actions
export default userSlice.reducer
