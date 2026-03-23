import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { Users, Package, ShoppingBag, DollarSign, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userInfo = useSelector((state) => state.user.userInfo);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
    } else {
      const fetchStats = async () => {
        try {
          const { data } = await api.get('/orders/stats');
          setStats(data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [userInfo, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2 shadow-sm">
            <ShoppingBag className="w-5 h-5 text-gray-500" />
            Manage Orders
          </Link>
          <Link to="/admin/products" className="bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2 shadow-sm">
            <Package className="w-5 h-5" />
            Manage Products
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-green-100 p-4 rounded-xl text-green-600">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Sales</p>
            <h3 className="text-2xl font-bold text-gray-900">${stats.totalSales.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Active Users</p>
            <h3 className="text-2xl font-bold text-gray-900">124</h3> {/* Mocked for demo */}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-orange-100 p-4 rounded-xl text-orange-600">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-900">45</h3> {/* Mocked for demo */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button className="text-sm text-primary-600 font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-mono text-sm text-primary-600 font-medium">
                      #{order._id.substring(order._id.length - 6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {order.user ? order.user.name : 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.createdAt.substring(0, 10)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded border text-xs font-bold ${
                        order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {stats.topProducts.map((p, i) => (
              <li key={i} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{p._id}</h4>
                    <p className="text-xs text-gray-500 font-medium">{p.totalSold} Units Sold</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded">
                  ${p.revenue.toFixed(2)}
                </div>
              </li>
            ))}
            {stats.topProducts.length === 0 && (
              <li className="p-6 text-center text-gray-500 text-sm">No top products yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
