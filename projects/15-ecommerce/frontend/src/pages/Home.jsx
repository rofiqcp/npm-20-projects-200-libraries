import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, fetchCategories } from '../store/productSlice'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const dispatch = useDispatch()
  const { items: products, categories, loading } = useSelector(s => s.products)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('')
  const [priceRange, setPriceRange] = useState([0, 2000])

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchProducts())
  }, [dispatch])

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
    return matchSearch && matchCat && matchPrice
  }).sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    if (sort === 'rating') return b.rating - a.rating
    return 0
  })

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-8 mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome to ShopHub 🛒</h1>
        <p className="text-blue-200 mb-4">Discover amazing products at great prices</p>
        <div className="relative max-w-lg">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full px-4 py-3 rounded-xl text-gray-800 pr-10" />
          <span className="absolute right-3 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {(categories.length ? categories : ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports']).map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>{cat}</button>
        ))}
        <select value={sort} onChange={e => setSort(e.target.value)} className="ml-auto px-3 py-2 border rounded-lg text-sm text-gray-600">
          <option value="">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Best Rated</option>
        </select>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">{filtered.length} products found</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-xl h-72 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
