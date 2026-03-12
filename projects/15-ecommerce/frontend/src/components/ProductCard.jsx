import { useDispatch, useSelector } from 'react-redux'
import { addItem } from '../store/cartSlice'
import { Link } from 'react-router-dom'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
    </div>
  )
}

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const cartItems = useSelector(s => s.cart.items)
  const inCart = cartItems.find(i => i.id === product.id)

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
      <Link to={`/product/${product.id}`}>
        <img src={product.images?.[0]} alt={product.name} className="w-full h-48 object-cover hover:opacity-90 transition-opacity" />
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">{product.category}</span>
        <Link to={`/product/${product.id}`} className="font-semibold text-gray-800 hover:text-blue-700 line-clamp-2 mb-1">{product.name}</Link>
        <p className="text-gray-500 text-sm line-clamp-2 mb-2 flex-1">{product.description}</p>
        <StarRating rating={product.rating} />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-blue-700">${product.price.toFixed(2)}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
          </span>
        </div>
        <button
          onClick={() => dispatch(addItem(product))}
          disabled={product.stock === 0}
          className={`mt-3 w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
            product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : inCart ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {product.stock === 0 ? 'Out of Stock' : inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
