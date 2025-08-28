// ===== 2. FIXED NEW PRODUCTS COMPONENT (src/components/NewProducts.jsx) =====
import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient.jsx';

export default function NewProducts() {
  const PAGE_SIZE = 20;

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      
      try {
        // FIXED: Use zero-based page index for backend
        const data = await apiClient.products.getPage(currentPage - 1, PAGE_SIZE);
        
        if (data && data.content) {
          setProducts(data.content);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        } else {
          // Handle case where backend returns different structure
          setProducts([]);
          setTotalPages(1);
          setTotalElements(0);
          setError("Бүтээгдэхүүний мэдээлэл хоосон байна.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Бүтээгдэхүүнүүдийг татаж чадсангүй. Таны сүлжээ эсвэл серверт асуудал байна.");
        setProducts([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    const newPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(newPage);
    // Smooth scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // FIXED: Better pagination logic
  const generatePageNumbers = () => {
    const pages = [];
    const pageRange = 2;
    
    if (totalPages <= 1) return pages;

    const start = Math.max(1, currentPage - pageRange);
    const end = Math.min(totalPages, currentPage + pageRange);

    // Add first page if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    // Add page range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  if (loading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl shadow-inner mt-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Шинэ бүтээгдэхүүнүүд</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(PAGE_SIZE)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl shadow-inner mt-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Шинэ бүтээгдэхүүнүүд</h2>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-medium">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Шинэ бүтээгдэхүүнүүд</h2>
        <span className="text-sm text-gray-600">
          Нийт: {totalElements.toLocaleString()} бүтээгдэхүүн
        </span>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={product.imagePath || 'https://placehold.co/600x400/E5E7EB/6B7280?text=No+Image'} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400/E5E7EB/6B7280?text=No+Image';
                  }}
                />
                <div className="p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  {product.shortName && (
                    <p className="text-sm text-gray-600 truncate">{product.shortName}</p>
                  )}
                  <p className="mt-2 text-lg font-bold text-gray-800">
                    {product.price ? `${product.price.toLocaleString()} ₮` : 'Үнэ тодорхойгүй'}
                  </p>
                  <a 
                    href={`/product/${product.id}`} 
                    className="mt-3 inline-block w-full text-center bg-[#f7941e] text-white px-4 py-2 rounded hover:bg-[#e6831c] transition-colors"
                  >
                    Дэлгэрэнгүй
                  </a>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`px-4 py-2 rounded border transition-colors duration-300 ${
                  currentPage <= 1 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
              >
                ‹ Өмнөх
              </button>

              {pages.map((p, index) => (
                <React.Fragment key={index}>
                  {p === "..." ? (
                    <span className="px-3 py-2 text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`px-4 py-2 rounded transition-colors duration-300 ${
                        currentPage === p 
                          ? 'bg-[#f7941e] text-white border-[#f7941e]' 
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
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
                className={`px-4 py-2 rounded border transition-colors duration-300 ${
                  currentPage >= totalPages 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
              >
                Дараах ›
              </button>
            </div>
          )}

        </>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m5-8h2M9 9h2" />
          </svg>
          <p className="text-xl text-gray-600 mb-2">Одоогоор бүтээгдэхүүн байхгүй байна.</p>
          <p className="text-gray-500">Дараарай дахин шалгана уу.</p>
        </div>
      )}
    </div>
  );
}
