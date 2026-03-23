import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { Package, Calendar, MapPin, Search } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userInfo = useSelector((state) => state.user.userInfo);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      const fetchOrders = async () => {
        try {
          const { data } = await api.get('/orders/myorders');
          setOrders(data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [userInfo, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-500 mt-2">View and track your previous purchases</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
           <Package className="h-16 w-16 text-gray-300 mb-4" />
           <p className="text-lg text-gray-600 mb-6">You have no orders yet.</p>
           <button onClick={() => navigate('/')} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-8 text-sm">
                  <div>
                    <span className="block text-gray-500 mb-1">Order Placed</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" /> {order.createdAt.substring(0, 10)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Total Amount</span>
                    <span className="font-semibold text-gray-900">${order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Order ID</span>
                    <span className="font-mono text-gray-900">#...{order._id.substring(order._id.length - 6)}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover border border-gray-100" />
                        <div>
                          <a href={`/product/${item.product}`} className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
                            {item.name}
                          </a>
                          <div className="text-sm text-gray-500 mt-1">
                            Qty: <span className="font-semibold text-gray-900">{item.quantity}</span> &times; ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-primary-500" /> Delivery Address
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {order.shippingAddress.street}<br/>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br/>
                      {order.shippingAddress.country}
                    </p>
                    
                    {order.trackingNumber && (
                      <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
                        <span className="text-xs font-bold text-primary-800 uppercase block mb-1">Tracking Number</span>
                        <div className="flex items-center gap-2 text-primary-900 font-mono text-sm font-semibold">
                          <Search className="h-4 w-4 text-primary-500" /> {order.trackingNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
