import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleCart } from '../store/cartSlice'
import { logout } from '../store/userSlice'
import { selectCartCount } from '../store/cartSlice'

export default function Navbar() {
  const dispatch = useDispatch()
  const cartCount = useSelector(selectCartCount)
  const user = useSelector(s => s.user.currentUser)

  return (
    <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">🛒 ShopHub</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-blue-200 text-sm">Home</Link>
          {user && <Link to="/orders" className="hover:text-blue-200 text-sm">My Orders</Link>}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-200">Hi, {user.firstName}!</span>
              <button onClick={() => dispatch(logout())} className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded">Login</Link>
          )}
          <button onClick={() => dispatch(toggleCart())} className="relative bg-orange-500 hover:bg-orange-400 px-3 py-2 rounded-lg font-medium">
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
