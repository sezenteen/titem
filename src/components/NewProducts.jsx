// src/components/NewProducts.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard.astro';
import apiClient from '../api/apiClient.jsx';

/**
 * A React component to display a paginated list of new products.
 * This component fetches data and handles pagination on the client side.
 */
export default function NewProducts() {
  const PAGE_SIZE = 20;

  // Use state hooks to manage the component's data and UI state
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect hook to fetch data when the component mounts or the page changes
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.products.getPage(currentPage - 1, PAGE_SIZE);
        if (data && data.content) {
          setProducts(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setProducts([]);
          setTotalPages(1);
          setError("Бүтээгдэхүүний мэдээлэл хоосон байна.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Бүтээгдэхүүнүүдийг татаж чадсангүй. Таны сүлжээ эсвэл серверт асуудал байна.");
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [currentPage]); // Re-run effect whenever currentPage changes

  // Helper function to handle page change
  const handlePageChange = (pageNumber) => {
    // Clamp the new page number to a valid range
    const newPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(newPage);
  };

  // Logic to generate page numbers with ellipsis for the UI
  const pageRange = 2;
  const pages = [];
  if (totalPages > 1) {
    const start = Math.max(1, currentPage - pageRange);
    const end = Math.min(totalPages, currentPage + pageRange);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
  }

  // Render the component's UI
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner mt-8">
      <h2 className="text-2xl font-semibold text-center mb-6">Шинэ бүтээгдэхүүнүүд</h2>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Ачаалж байна...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-xl text-red-600">{error}</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard product={product} client:load />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`px-3 py-1 rounded border transition-colors duration-300 ${
                  currentPage <= 1 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Өмнөх
              </button>
              {pages.map((p, index) => (
                <React.Fragment key={index}>
                  {p === "..." ? (
                    <span className="px-3 py-1 text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 rounded transition-colors duration-300 ${
                        currentPage === p ? 'bg-[#f7941e] text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1 rounded border transition-colors duration-300 ${
                  currentPage >= totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Дараах
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Одоогоор бүтээгдэхүүн байхгүй байна.</p>
          <p className="text-gray-500 mt-2">Дараарай дахин шалгана уу.</p>
        </div>
      )}
    </div>
  );
}
