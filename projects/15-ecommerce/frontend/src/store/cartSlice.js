import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], isOpen: false },
  reducers: {
    addItem: (state, action) => {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) { existing.quantity += 1 }
      else { state.items.push({ ...action.payload, quantity: 1 }) }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(i => i.id === action.payload.id)
      if (item) item.quantity = action.payload.quantity
    },
    clearCart: (state) => { state.items = [] },
    toggleCart: (state) => { state.isOpen = !state.isOpen },
    setCartOpen: (state, action) => { state.isOpen = action.payload },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, toggleCart, setCartOpen } = cartSlice.actions
export const selectCartTotal = (state) => state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0)
export default cartSlice.reducer
