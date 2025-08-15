import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient.jsx';

// This is a placeholder for a React version of ProductCard.astro
// In a real application, this would be in its own file: `src/components/ProductCard.jsx`
const ProductCard = ({ product }) => {
  return (
    <a href={`/product/${product.id}`} className="block transform transition-transform duration-300 hover:scale-105">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <img
          src={product.imageUrl || `https://placehold.co/400x300/E5E7EB/4B5563?text=Бүтээгдэхүүн+Зураг`}
          alt={product.name}
          className="w-full h-48 object-cover object-center"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x300/E5E7EB/4B5563?text=Зураг+Олдсонгүй`;
          }}
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">{product.price}₮</span>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full transition-colors"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating to the product page when clicking the button
                // Add your "add to cart" or other functionality here
                console.log(`Та сагсанд ${product.name} бүтээгдэхүүнийг нэмлээ.`);
              }}
            >
              Сагсанд хийх
            </button>
          </div>
        </div>
      </div>
    </a>
  );
};


const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await apiClient.get('/product');
      const data = response.data;
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError('Бүтээгдэхүүнүүдийг татаж чадсангүй. Сүлжээгээ шалгана уу.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-lg text-gray-700">Уншиж байна...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center py-4 text-lg font-medium">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-gray-500 text-center py-4 text-lg">Одоогоор бүтээгдэхүүн олдсонгүй.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
};

export default ProductList;
