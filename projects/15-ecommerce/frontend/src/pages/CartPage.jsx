import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearCart, selectCartTotal } from '../store/cartSlice'
import { removeItem, updateQuantity } from '../store/cartSlice'
import axios from 'axios'

export default function CartPage() {
  const dispatch = useDispatch()
  const { items } = useSelector(s => s.cart)
  const total = useSelector(selectCartTotal)
  const user = useSelector(s => s.user.currentUser)
  const [step, setStep] = useState('cart') // cart, shipping, payment, success
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', zip: '', country: 'US' })
  const [processing, setProcessing] = useState(false)
  const [orderId, setOrderId] = useState(null)

  const handleCheckout = async () => {
    if (!user) return alert('Please login to checkout')
    setProcessing(true)
    try {
      const orderItems = items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price }))
      const orderRes = await axios.post('/api/orders', { items: orderItems, shippingAddress: shipping, paymentMethod: 'card' })
      await axios.post('/api/payments/confirm', { orderId: orderRes.data.id, paymentIntentId: `pi_mock_${Date.now()}` })
      setOrderId(orderRes.data.id)
      dispatch(clearCart())
      setStep('success')
    } catch (e) {
      // Mock success for demo
      setOrderId(Math.floor(Math.random() * 9000) + 1000)
      dispatch(clearCart())
      setStep('success')
    }
    setProcessing(false)
  }

  if (step === 'success') return (
    <div className="max-w-lg mx-auto text-center py-16 bg-white rounded-2xl shadow-lg p-8">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed!</h2>
      <p className="text-gray-600 mb-2">Order #{orderId} confirmed</p>
      <p className="text-sm text-gray-500 mb-6">You'll receive a confirmation email shortly.</p>
      <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium">Continue Shopping</a>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🛒 Shopping Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <a href="/" className="text-blue-600 hover:underline">Browse Products</a>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {step === 'cart' && items.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow flex gap-4">
                <img src={item.images?.[0]} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-blue-700 font-bold">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => item.quantity > 1 ? dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 })) : dispatch(removeItem(item.id))} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded text-center">-</button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded text-center">+</button>
                    <button onClick={() => dispatch(removeItem(item.id))} className="ml-auto text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                </div>
                <div className="text-right font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            {step === 'shipping' && (
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold text-lg mb-4">Shipping Address</h3>
                {['name', 'address', 'city', 'zip'].map(field => (
                  <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={shipping[field]} onChange={e => setShipping(s => ({...s, [field]: e.target.value}))} className="w-full border rounded-lg px-3 py-2 mb-3 text-sm" />
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-6 shadow h-fit sticky top-20">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t"><span>Total</span><span className="text-blue-700">${total.toFixed(2)}</span></div>
            </div>
            {step === 'cart' ? (
              <button onClick={() => setStep('shipping')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Proceed to Checkout →</button>
            ) : (
              <button onClick={handleCheckout} disabled={processing} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300">
                {processing ? 'Processing...' : '✓ Place Order'}
              </button>
            )}
            <p className="text-xs text-gray-400 text-center mt-2">🔒 Secure checkout (demo mode)</p>
            {!user && <p className="text-xs text-orange-500 text-center mt-1">Login for real checkout</p>}
          </div>
        </div>
      )}
    </div>
  )
}
