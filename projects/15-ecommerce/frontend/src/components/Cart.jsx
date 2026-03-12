import { useSelector, useDispatch } from 'react-redux'
import { removeItem, updateQuantity, clearCart, setCartOpen, selectCartTotal } from '../store/cartSlice'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, isOpen } = useSelector(s => s.cart)
  const total = useSelector(selectCartTotal)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => dispatch(setCartOpen(false))} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="p-4 bg-blue-700 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold">🛒 Shopping Cart ({items.length})</h2>
          <button onClick={() => dispatch(setCartOpen(false))} className="text-2xl hover:text-blue-200">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg">Your cart is empty</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
              <img src={item.images?.[0]} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => item.quantity > 1 ? dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 })) : dispatch(removeItem(item.id))} className="w-6 h-6 bg-gray-200 rounded text-center hover:bg-gray-300">-</button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="w-6 h-6 bg-gray-200 rounded text-center hover:bg-gray-300">+</button>
                  <button onClick={() => dispatch(removeItem(item.id))} className="ml-auto text-red-500 hover:text-red-700 text-xs">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-xl font-bold text-blue-700">${total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => dispatch(clearCart())} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 text-sm">Clear</button>
              <button onClick={() => { dispatch(setCartOpen(false)); navigate('/cart') }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">Checkout</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
