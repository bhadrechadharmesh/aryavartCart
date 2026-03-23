import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User as UserIcon, LogOut, Package } from 'lucide-react';
import { logout } from '../redux/userSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.cartItems);
  const userInfo = useSelector((state) => state.user.userInfo);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl text-primary-600 flex items-center gap-2 font-['Rozha_One'] tracking-wide">
          <Package className="h-6 w-6" /> AryavartCart
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {userInfo ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Hi, {userInfo.name.split(' ')[0]}
              </span>
              {userInfo.role === 'admin' && (
                 <Link to="/admin" className="text-sm font-medium text-primary-600 hover:text-primary-800">
                   Admin
                 </Link>
              )}
              <Link to="/orders" className="text-gray-600 hover:text-primary-600 items-center justify-center flex">
                 <UserIcon className="h-5 w-5 mr-1" />
                 <span className="text-sm hidden sm:inline">Orders</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                 <LogOut className="h-5 w-5" />
                 <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium font-sm text-sm">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
