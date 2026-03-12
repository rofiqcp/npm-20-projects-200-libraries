import { useState, useEffect } from 'react';
import axios from 'axios';
import ArchitectureDiagram from '../components/ArchitectureDiagram.jsx';
import ServiceHealth from '../components/ServiceHealth.jsx';

const MOCK_PRODUCTS = [
  { id: 'p1',  name: 'Wireless Headphones',   category: 'Electronics', price: 79.99,  stock: 45,  rating: 4.5, image: '🎧' },
  { id: 'p2',  name: 'Smart Watch',            category: 'Electronics', price: 199.99, stock: 28,  rating: 4.7, image: '⌚' },
  { id: 'p3',  name: 'Running Shoes',          category: 'Sports',      price: 89.99,  stock: 62,  rating: 4.3, image: '👟' },
  { id: 'p4',  name: 'Coffee Maker',           category: 'Appliances',  price: 49.99,  stock: 33,  rating: 4.1, image: '☕' },
  { id: 'p5',  name: 'Yoga Mat',               category: 'Sports',      price: 29.99,  stock: 87,  rating: 4.6, image: '🧘' },
  { id: 'p6',  name: 'Laptop Stand',           category: 'Electronics', price: 35.99,  stock: 52,  rating: 4.4, image: '💻' },
  { id: 'p7',  name: 'Water Bottle',           category: 'Sports',      price: 19.99,  stock: 120, rating: 4.2, image: '🍶' },
  { id: 'p8',  name: 'Desk Organizer',         category: 'Office',      price: 24.99,  stock: 41,  rating: 4.0, image: '🗂' },
  { id: 'p9',  name: 'Bluetooth Speaker',      category: 'Electronics', price: 59.99,  stock: 38,  rating: 4.8, image: '🔊' },
  { id: 'p10', name: 'Mechanical Keyboard',    category: 'Electronics', price: 129.99, stock: 19,  rating: 4.9, image: '⌨️' }
];

export default function Home() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get('/api/products').then(r => setProducts(r.data)).catch(() => {});
  }, []);

  const categories = ['All', ...new Set(MOCK_PRODUCTS.map(p => p.category))];
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="space-y-6">
      {/* Top panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ArchitectureDiagram />
        <ServiceHealth />
      </div>

      {/* Store */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-white">🛍️ Product Catalog <span className="text-slate-400 text-sm font-normal">(via API Gateway)</span></h3>
          {cart.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Cart: {cart.reduce((s,i) => s+i.qty,0)} items</span>
              <span className="font-bold text-green-400">${cartTotal.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 min-w-[200px] bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500" />
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === cat ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 hover:border-violet-500/50 transition-colors group">
              <div className="text-4xl text-center mb-3">{product.image}</div>
              <h4 className="font-semibold text-white text-sm mb-1">{product.name}</h4>
              <p className="text-xs text-slate-400 mb-2">{product.category}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-violet-400">${product.price}</span>
                <span className="text-xs text-yellow-400">{'★'.repeat(Math.round(product.rating))} {product.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${product.stock > 20 ? 'text-green-400' : 'text-red-400'}`}>
                  {product.stock} in stock
                </span>
                <button onClick={() => addToCart(product)}
                  className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded-lg font-medium transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8">No products found</p>
        )}
      </div>
    </div>
  );
}
