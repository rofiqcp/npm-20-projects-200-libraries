import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItem } from '../store/cartSlice'
import { setCartOpen } from '../store/cartSlice'

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const products = useSelector(s => s.products.items)
  const product = products.find(p => p.id === parseInt(id))
  const [quantity, setQuantity] = useState(1)

  if (!product) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">😕</div>
      <p className="text-gray-500">Product not found</p>
      <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline">Back to Home</button>
    </div>
  )

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) dispatch(addItem(product))
    dispatch(setCartOpen(true))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4 flex items-center gap-1">← Back</button>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <img src={product.images?.[0]} alt={product.name} className="w-full md:w-1/2 h-80 object-cover" />
          <div className="p-6 flex-1">
            <span className="text-xs text-blue-600 font-bold uppercase tracking-wide">{product.category}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(s => <span key={s} className={s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>)}
              <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ({product.reviewsCount} reviews)</span>
            </div>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="text-3xl font-bold text-blue-700 mb-4">${product.price.toFixed(2)}</div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm mb-4 ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </div>
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm text-gray-600 font-medium">Qty:</label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 bg-gray-100 hover:bg-gray-200">-</button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 bg-gray-100 hover:bg-gray-200">+</button>
                </div>
              </div>
            )}
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-semibold text-lg transition-colors">
              {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
