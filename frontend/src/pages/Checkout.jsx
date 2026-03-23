import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, clearCartItems } from '../redux/cartSlice';
import api from '../services/api';
import { CheckCircle, Truck, CreditCard, ChevronRight } from 'lucide-react';

const Checkout = () => {
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress } = cart;
  const userInfo = useSelector((state) => state.user.userInfo);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(shippingAddress.street || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [stateCode, setStateCode] = useState(shippingAddress.state || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.zipCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');
  
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
    }
  }, [userInfo, navigate]);

  const submitShipping = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ street: address, city, state: stateCode, zipCode: postalCode, country }));
    setStep(2);
  };

  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);
  const itemsPrice = addDecimals(cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0));
  const shippingPrice = addDecimals(itemsPrice > 100 ? 0 : 10);
  const taxPrice = addDecimals(Number((0.15 * itemsPrice).toFixed(2)));
  const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)).toFixed(2);

  const placeOrderHandler = async () => {
    try {
      setPlacingOrder(true);
      setError(null);
      const { data } = await api.post('/orders', {
        orderItems: cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });
      
      dispatch(clearCartItems());
      navigate(`/orders`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-sm ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <span className="font-medium">Shipping</span>
        </div>
        <div className={`w-16 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-sm ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <span className="font-medium">Payment & Review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {step === 1 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary-500" /> Shipping Address
            </h2>
            <form onSubmit={submitShipping} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    value={city}
                    required
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    value={stateCode}
                    required
                    onChange={(e) => setStateCode(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    value={postalCode}
                    required
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    value={country}
                    required
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-primary-700 transition flex items-center gap-2"
                >
                  Continue to Payment <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Shipping Details
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {cart.shippingAddress.street}, <br/>
                  {cart.shippingAddress.city}, {cart.shippingAddress.state} {cart.shippingAddress.zipCode}, <br/>
                  {cart.shippingAddress.country}
                </p>
                <button onClick={() => setStep(1)} className="mt-4 text-sm text-primary-600 underline hover:text-primary-800">Edit Address</button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-500" /> Payment Method
                </h3>
                <div className="text-gray-600 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary-600 ring-2 ring-primary-100 ring-offset-2"></div>
                  Stripe / Credit Card
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
                <ul className="divide-y divide-gray-100">
                  {cartItems.map((item, index) => (
                    <li key={index} className="py-3 flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-gray-100" />
                      <div className="flex-1">
                        <Link to={`/product/${item.product}`} className="text-sm font-semibold text-gray-900 hover:underline">{item.name}</Link>
                        <div className="text-xs text-gray-500">{item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Items</span>
                    <span>${itemsPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Shipping</span>
                    <span>${shippingPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Tax</span>
                    <span>${taxPrice}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-extrabold text-primary-600">${totalPrice}</span>
                  </div>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-lg text-sm">{error}</div>}

                <button
                  onClick={placeOrderHandler}
                  disabled={placingOrder}
                  className={`w-full text-white rounded-xl py-4 font-bold text-lg flex justify-center items-center shadow-sm transition-all ${
                    placingOrder ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-md'
                  }`}
                >
                  {placingOrder ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
