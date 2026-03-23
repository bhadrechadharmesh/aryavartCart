import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating if clicking the button
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/600x400/png',
        price: product.price,
        quantity: 1,
      })
    );
  };

  const imageSrc = product.images && product.images.length > 0 
    ? product.images[0].url 
    : 'https://placehold.co/600x400/png';

  return (
    <Link to={`/product/${product._id}`} className="group relative block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-primary-600 font-semibold mb-1 uppercase tracking-wider">{product.category}</div>
        <h3 className="text-gray-900 font-medium text-lg leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-3">
           <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
           <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
           <span className="text-xs text-gray-500">({product.numReviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              product.stock > 0
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
