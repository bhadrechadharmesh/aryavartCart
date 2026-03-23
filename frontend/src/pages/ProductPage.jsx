import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import api from '../services/api';
import { Star, Truck, Shield, ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/600x400/png',
        price: product.price,
        quantity: qty,
      })
    );
    navigate('/cart');
  };

  const incrementQty = () => {
    if (qty < product.stock) setQty(qty + 1);
  };

  const decrementQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

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

  const imageSrc = product.images && product.images.length > 0 
    ? product.images[0].url 
    : 'https://placehold.co/600x400/png';

  return (
    <div className="max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          
          {/* Product Image Section */}
          <div className="bg-gray-100 p-8 flex items-center justify-center min-h-[400px]">
            <img 
              src={imageSrc} 
              alt={product.name} 
              className="max-w-full max-h-[500px] object-contain drop-shadow-xl rounded-xl"
            />
          </div>

          {/* Product Info Section */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="text-sm text-primary-600 font-semibold uppercase tracking-wider mb-2">
              {product.category}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-700">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 underline cursor-pointer">{product.numReviews} Reviews</span>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-6">
               ${product.price.toFixed(2)}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="border-t border-b border-gray-100 py-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="text-sm font-medium text-gray-700 w-24">Status:</div>
                <div className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
              
              {product.stock > 0 && (
                <div className="flex items-center gap-6 mt-4">
                  <div className="text-sm font-medium text-gray-700 w-24">Quantity:</div>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-32">
                    <button 
                      onClick={decrementQty}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
                      disabled={qty <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="flex-1 text-center font-semibold text-gray-900">
                      {qty}
                    </div>
                    <button 
                      onClick={incrementQty}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
                      disabled={qty >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg shadow-sm transition-all ${
                product.stock > 0 
                  ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="h-6 w-6" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Feature bullets */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-primary-500" /> Free Shipping
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-primary-500" /> Buyer Protection
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
