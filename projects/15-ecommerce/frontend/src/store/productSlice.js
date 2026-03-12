import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API = '/api'

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const res = await axios.get(`${API}/products?${query}`)
  return res.data
})

export const fetchCategories = createAsyncThunk('products/fetchCategories', async () => {
  const res = await axios.get(`${API}/categories`)
  return res.data
})

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], categories: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.products
        state.total = action.payload.total
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
        // Fallback mock data
        state.items = MOCK_PRODUCTS
        state.total = MOCK_PRODUCTS.length
      })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload })
      .addCase(fetchCategories.rejected, (state) => {
        state.categories = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports']
      })
  },
})

const MOCK_PRODUCTS = [
  { id: 1, name: 'MacBook Pro 14"', description: 'Apple M3 chip, 16GB RAM, 512GB SSD', price: 1999.99, stock: 15, category: 'Electronics', images: ['https://via.placeholder.com/400x300/1a1a2e/white?text=MacBook+Pro'], rating: 4.8, reviewsCount: 124 },
  { id: 2, name: 'Sony WH-1000XM5', description: 'Noise-canceling wireless headphones', price: 349.99, stock: 32, category: 'Electronics', images: ['https://via.placeholder.com/400x300/16213e/white?text=Sony+Headphones'], rating: 4.7, reviewsCount: 89 },
  { id: 3, name: 'iPhone 15 Pro', description: 'A17 Pro chip, titanium design', price: 1099.99, stock: 28, category: 'Electronics', images: ['https://via.placeholder.com/400x300/0f3460/white?text=iPhone+15'], rating: 4.9, reviewsCount: 256 },
  { id: 4, name: 'Samsung 4K Monitor', description: '27" 4K UHD IPS monitor', price: 599.99, stock: 20, category: 'Electronics', images: ['https://via.placeholder.com/400x300/533483/white?text=Samsung+Monitor'], rating: 4.6, reviewsCount: 67 },
  { id: 5, name: 'Mechanical Keyboard', description: 'TKL with Cherry MX switches', price: 129.99, stock: 45, category: 'Electronics', images: ['https://via.placeholder.com/400x300/e94560/white?text=Keyboard'], rating: 4.5, reviewsCount: 203 },
  { id: 6, name: 'Premium Cotton T-Shirt', description: '100% organic cotton', price: 29.99, stock: 150, category: 'Clothing', images: ['https://via.placeholder.com/400x300/2d6a4f/white?text=T-Shirt'], rating: 4.3, reviewsCount: 88 },
  { id: 7, name: 'Slim Fit Jeans', description: 'Premium denim slim fit', price: 69.99, stock: 80, category: 'Clothing', images: ['https://via.placeholder.com/400x300/1b4332/white?text=Jeans'], rating: 4.4, reviewsCount: 115 },
  { id: 8, name: 'Running Sneakers', description: 'Lightweight with responsive cushioning', price: 119.99, stock: 60, category: 'Clothing', images: ['https://via.placeholder.com/400x300/40916c/white?text=Sneakers'], rating: 4.6, reviewsCount: 178 },
  { id: 9, name: 'JavaScript: The Definitive Guide', description: 'Comprehensive JS reference', price: 49.99, stock: 35, category: 'Books', images: ['https://via.placeholder.com/400x300/d62828/white?text=JS+Book'], rating: 4.7, reviewsCount: 445 },
  { id: 10, name: 'Clean Code', description: 'Agile Software Craftsmanship', price: 39.99, stock: 50, category: 'Books', images: ['https://via.placeholder.com/400x300/f77f00/white?text=Clean+Code'], rating: 4.8, reviewsCount: 892 },
  { id: 11, name: 'Design Patterns', description: 'Gang of Four classic', price: 44.99, stock: 28, category: 'Books', images: ['https://via.placeholder.com/400x300/fcbf49/333?text=Design+Patterns'], rating: 4.6, reviewsCount: 334 },
  { id: 12, name: 'Smart LED Desk Lamp', description: 'Adjustable brightness, USB-C charging', price: 59.99, stock: 40, category: 'Home', images: ['https://via.placeholder.com/400x300/eae2b7/333?text=Desk+Lamp'], rating: 4.5, reviewsCount: 156 },
  { id: 13, name: 'Ergonomic Office Chair', description: 'Lumbar support, breathable mesh', price: 349.99, stock: 12, category: 'Home', images: ['https://via.placeholder.com/400x300/003049/white?text=Office+Chair'], rating: 4.7, reviewsCount: 267 },
  { id: 14, name: 'Standing Desk Converter', description: 'Adjustable height desk riser', price: 189.99, stock: 18, category: 'Home', images: ['https://via.placeholder.com/400x300/606c38/white?text=Desk+Converter'], rating: 4.4, reviewsCount: 89 },
  { id: 15, name: 'Yoga Mat Premium', description: 'Non-slip 6mm thick with strap', price: 34.99, stock: 90, category: 'Sports', images: ['https://via.placeholder.com/400x300/bc6c25/white?text=Yoga+Mat'], rating: 4.5, reviewsCount: 312 },
  { id: 16, name: 'Resistance Bands Set', description: 'Set of 5 with handles', price: 24.99, stock: 120, category: 'Sports', images: ['https://via.placeholder.com/400x300/dda15e/333?text=Resistance+Bands'], rating: 4.4, reviewsCount: 445 },
  { id: 17, name: 'Wireless Gaming Mouse', description: 'Lightweight, 25K DPI sensor', price: 89.99, stock: 38, category: 'Electronics', images: ['https://via.placeholder.com/400x300/370617/white?text=Gaming+Mouse'], rating: 4.7, reviewsCount: 289 },
  { id: 18, name: 'Protein Powder Whey', description: '25g per serving, vanilla', price: 54.99, stock: 65, category: 'Sports', images: ['https://via.placeholder.com/400x300/6a994e/white?text=Protein+Powder'], rating: 4.6, reviewsCount: 523 },
  { id: 19, name: 'Coffee Maker Pro', description: '12-cup programmable with thermal carafe', price: 79.99, stock: 55, category: 'Home', images: ['https://via.placeholder.com/400x300/283618/white?text=Coffee+Maker'], rating: 4.3, reviewsCount: 201 },
  { id: 20, name: 'Smart Water Bottle', description: 'Tracks hydration, insulated', price: 44.99, stock: 75, category: 'Sports', images: ['https://via.placeholder.com/400x300/606c38/white?text=Water+Bottle'], rating: 4.3, reviewsCount: 167 },
]

export default productSlice.reducer
