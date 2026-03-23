import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../redux/cartSlice';
import { Trash2, ArrowRight, ShoppingCart, Minus, Plus } from 'lucide-react';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector((state) => state.cart.cartItems);

  const updateQuantity = (item, newQuantity) => {
    dispatch(addToCart({ ...item, quantity: Number(newQuantity) }));
  };

  const removeItemHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/checkout');
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-primary-50 p-6 rounded-full mb-6">
          <ShoppingCart className="h-16 w-16 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
        <Link 
          to="/" 
          className="bg-primary-600 text-white px-8 py-3 rounded-xl font-medium shadow-sm hover:bg-primary-700 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 hidden md:grid grid-cols-12 gap-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-1 border"></div>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <li key={item.product} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <Link to={`/product/${item.product}`} className="font-semibold text-lg text-gray-900 hover:text-primary-600 line-clamp-2 transition-colors">
                        {item.name}
                      </Link>
                    </div>

                    <div className="col-span-1 md:col-span-2 text-gray-900 font-bold md:text-center text-lg">
                      ${item.price.toFixed(2)}
                    </div>

                    <div className="col-span-1 md:col-span-3 flex md:justify-center items-center">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-28">
                        <button 
                          onClick={() => updateQuantity(item, item.quantity > 1 ? item.quantity - 1 : 1)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex-1 text-center font-semibold text-sm">
                          {item.quantity}
                        </div>
                        <button 
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-1 flex md:justify-center">
                      <button 
                        onClick={() => removeItemHandler(item.product)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium text-gray-900">${totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-extrabold text-primary-600">${totalPrice}</span>
              </div>
            </div>

            <button 
              onClick={checkoutHandler}
              className="w-full bg-primary-600 text-white rounded-xl py-4 font-bold text-lg flex justify-center items-center gap-2 hover:bg-primary-700 hover:shadow-md transition-all"
            >
              Proceed to Checkout <ArrowRight className="h-5 w-5" />
            </button>
            
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-primary-600 font-medium hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
