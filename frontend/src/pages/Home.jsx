import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products${keyword ? `?keyword=${keyword}` : ''}`);
        setProducts(data.products || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchTrigger]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTrigger((prev) => prev + 1);
  };

  return (
    <div>
      <div className="bg-primary-600 rounded-2xl p-8 mb-12 text-center text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
             Discover Amazing Products
          </h1>
          <p className="text-primary-100 text-lg mb-8">
             High quality items shipped right to your door at unbeatable prices.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md mx-auto">
            <div className="relative flex-grow">
               <input
                 type="text"
                 placeholder="Search products..."
                 value={keyword}
                 onChange={(e) => setKeyword(e.target.value)}
                 className="w-full px-4 py-3 pl-10 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-sm"
               />
               <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium shadow-sm">
               Search
            </button>
          </form>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="mb-6 flex justify-between items-end">
         <h2 className="text-2xl font-bold text-gray-900">
            {keyword ? `Search Results for "${keyword}"` : 'Latest Arrivals'}
         </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
           No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
