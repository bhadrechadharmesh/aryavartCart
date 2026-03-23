import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, Plus, Trash2, ArrowLeft, X, Upload, Edit } from 'lucide-react';
import api from '../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    supplierPrice: '',
    stock: '',
    category: '',
  });
  const [addingError, setAddingError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const userInfo = useSelector((state) => state.user.userInfo);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch up to 100 products for admin view
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products);
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
      fetchProducts();
    }
  }, [userInfo, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setIsDeleting(true);
        await api.delete(`/products/${id}`);
        setProducts(products.filter((p) => p._id !== id));
        setIsDeleting(false);
      } catch (err) {
        console.error('Delete error: ', err);
        alert(err.response?.data?.message || err.message || 'Failed to delete product');
        setIsDeleting(false);
      }
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      supplierPrice: product.supplierPrice || '',
      stock: product.stock,
      category: product.category,
    });
    setImageUrl(product.images && product.images.length > 0 ? product.images[0].url : '');
    setAddingError(null);
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    setUploadingImage(true);
    try {
      const { data } = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(data.url);
      setUploadingImage(false);
    } catch (err) {
      setAddingError(err.response?.data?.message || err.message);
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsAdding(true);
      setAddingError(null);
      // Backend expects numbers for price and stock
      const payload = {
        ...formData,
        price: Number(formData.price),
        supplierPrice: Number(formData.supplierPrice),
        stock: Number(formData.stock),
        images: imageUrl ? [{ url: imageUrl }] : [],
      };
      
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      
      // Reset and refresh
      setShowAddModal(false);
      setImageUrl('');
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        supplierPrice: '',
        stock: '',
        category: '',
      });
      fetchProducts();
      setIsAdding(false);
    } catch (err) {
      setAddingError(err.response?.data?.message || err.message);
      setIsAdding(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Link to="/admin" className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <Package className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Products</h1>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              supplierPrice: '',
              stock: '',
              category: '',
            });
            setImageUrl('');
            setShowAddModal(true);
          }}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
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
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                      <div className="text-xs text-gray-400 font-medium">Cost: ${product.supplierPrice?.toFixed(2) || '0.00'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded border text-xs font-bold ${
                        product.stock > 10 ? 'bg-green-100 text-green-800 border-green-200' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-primary-600 hover:text-primary-800 p-2 rounded-lg hover:bg-primary-50 transition border border-transparent hover:border-primary-100 inline-flex items-center gap-1 text-xs font-bold"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={isDeleting}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition border border-transparent inline-flex items-center gap-1 text-xs font-bold"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      No products found. Add your first product!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{selectedProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {addingError && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm font-medium">
                  {addingError}
                </div>
              )}
              
              <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                    placeholder="E.g. Traditional Handwoven Saree"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                    placeholder="Enter product details..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Supplier Price ($) *</label>
                    <input
                      type="number"
                      name="supplierPrice"
                      required
                      min="0"
                      step="0.01"
                      value={formData.supplierPrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                    <input
                      type="text"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                      placeholder="E.g. Clothing"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Image</label>
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-lg border-dashed">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="image-file"
                        accept="image/*"
                        onChange={uploadFileHandler}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200 transition cursor-pointer"
                      />
                    </div>
                    {uploadingImage && <div className="text-sm text-gray-500 animate-pulse font-medium">Uploading...</div>}
                    {imageUrl && (
                      <div className="w-14 h-14 rounded overflow-hidden border border-gray-200 shrink-0 bg-white">
                        <img src={`http://localhost:3000${imageUrl}`} alt="Product preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="productForm"
                disabled={isAdding}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center min-w-[120px]"
              >
                {isAdding ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  selectedProduct ? 'Save Changes' : 'Create Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
