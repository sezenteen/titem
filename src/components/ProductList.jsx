// src/components/ProductList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard.astro';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/product')
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error(err);
        setError('Бүтээгдэхүүнүүдийг татаж чадсангүй.');
      });
  }, []);

  if (error) {
    return <p className="text-red-500 text-center py-4">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
};

export default ProductList;
