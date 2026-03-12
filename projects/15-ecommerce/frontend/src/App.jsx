import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initAuth } from './store/userSlice'
import Navbar from './components/Navbar'
import Cart from './components/Cart'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  const dispatch = useDispatch()
  useEffect(() => { dispatch(initAuth()) }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Cart />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}
