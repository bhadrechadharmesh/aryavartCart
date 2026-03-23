import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingBag, Edit, ArrowLeft, X, Search, Eye } from 'lucide-react';
import api from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderStatus: '',
    trackingNumber: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // View Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const userInfo = useSelector((state) => state.user.userInfo);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
    } else {
      fetchOrders();
    }
  }, [userInfo, navigate]);

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setFormData({
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber || '',
    });
    setUpdateError(null);
    setShowEditModal(true);
  };

  const handleViewClick = (order) => {
    setSelectedOrderDetails(order);
    setShowDetailsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setUpdateError(null);
      
      await api.put(`/orders/${selectedOrder._id}/status`, formData);
      
      // Update local state without refetching all array
      setOrders(orders.map((o) => 
        o._id === selectedOrder._id 
          ? { ...o, orderStatus: formData.orderStatus, trackingNumber: formData.trackingNumber } 
          : o
      ));
      
      setShowEditModal(false);
      setIsUpdating(false);
    } catch (err) {
      setUpdateError(err.response?.data?.message || err.message);
      setIsUpdating(false);
    }
  };

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

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6 flex flex-col gap-1">
        <Link to="/admin" className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 font-medium transition w-max">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <ShoppingBag className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Orders</h1>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium mb-6">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Tracking</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-mono text-sm text-primary-600 font-medium">
                      #{order._id.substring(order._id.length - 6)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{order.user ? order.user.name : 'Unknown User'}</div>
                      <div className="text-xs text-gray-500">{order.user ? order.user.email : 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                      {order.createdAt.substring(0, 10)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      {order.trackingNumber ? (
                         <span className="flex items-center gap-1 text-xs font-semibold bg-gray-100 px-2 py-1 rounded"><Search className="w-3 h-3 text-gray-400"/> {order.trackingNumber}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewClick(order)}
                          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition border border-transparent inline-flex items-center gap-1 text-xs font-bold"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                        <button
                          onClick={() => handleEditClick(order)}
                          className="text-primary-600 hover:text-primary-800 p-2 rounded-lg hover:bg-primary-50 transition border border-transparent hover:border-primary-100 inline-flex items-center gap-1 text-xs font-bold"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 text-sm">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      No orders found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {updateError && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm font-medium">
                  {updateError}
                </div>
              )}
              
              <div className="mb-5 bg-gray-50 border border-gray-100 p-3 rounded-lg text-sm">
                <span className="text-gray-500 font-medium">Updating Order: </span>
                <span className="font-mono font-bold text-gray-900">#{selectedOrder?._id}</span>
              </div>

              <form id="updateStatusForm" onSubmit={handleUpdateStatus} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Order Status *</label>
                  <select
                    name="orderStatus"
                    required
                    value={formData.orderStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition appearance-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tracking Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition font-mono"
                    placeholder="E.g. 1Z9999999999999999"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="updateStatusForm"
                disabled={isUpdating}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center min-w-[120px]"
              >
                {isUpdating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Order #{selectedOrderDetails._id}</p>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Customer Info</h3>
                  {selectedOrderDetails.user ? (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700 font-medium">{selectedOrderDetails.user.name}</p>
                      <p className="text-sm text-gray-500">{selectedOrderDetails.user.email}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Guest User (No Account)</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Shipping Address</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>{selectedOrderDetails.shippingAddress?.street}</p>
                    <p>{selectedOrderDetails.shippingAddress?.city}, {selectedOrderDetails.shippingAddress?.state} {selectedOrderDetails.shippingAddress?.zipCode}</p>
                    <p>{selectedOrderDetails.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrderDetails.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover border border-gray-200" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary & Financials */}
              <div className="bg-primary-50 p-5 rounded-xl border border-primary-100">
                <h3 className="text-sm font-bold text-primary-900 mb-4 uppercase tracking-wider border-b border-primary-200 pb-2">Payment Summary</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Payment Method:</span>
                    <span className="font-medium uppercase">{selectedOrderDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">${(selectedOrderDetails.totalPrice - (selectedOrderDetails.shippingPrice || 0) - (selectedOrderDetails.taxPrice || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Shipping:</span>
                    <span className="font-medium">${(selectedOrderDetails.shippingPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Tax:</span>
                    <span className="font-medium">${(selectedOrderDetails.taxPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary-900 mt-2 pt-2 border-t border-primary-200">
                    <span>Total:</span>
                    <span>${selectedOrderDetails.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-800 text-white px-6 py-2.5 rounded-lg hover:bg-gray-900 transition font-medium"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
