import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const MOCK_ORDERS = [
  { id: 1001, totalAmount: '349.98', status: 'paid', createdAt: new Date(Date.now() - 86400000 * 2), items: [{ productId: 1, quantity: 1 }] },
  { id: 1002, totalAmount: '59.99', status: 'pending', createdAt: new Date(Date.now() - 86400000), items: [{ productId: 6, quantity: 2 }] },
]

const STATUS_COLORS = { paid: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', shipped: 'bg-blue-100 text-blue-700', delivered: 'bg-purple-100 text-purple-700' }

export default function OrdersPage() {
  const user = useSelector(s => s.user.currentUser)
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!user) return navigate('/login')
    axios.get('/api/orders').then(r => setOrders(r.data)).catch(() => setOrders(MOCK_ORDERS))
  }, [user])

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📦 My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500">No orders yet</p>
          <a href="/" className="mt-3 inline-block text-blue-600 hover:underline">Start Shopping</a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-sm text-gray-500">{order.items?.length || 0} item(s)</span>
                <span className="font-bold text-blue-700 text-lg">${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
