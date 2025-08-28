import { useState, useEffect } from "react";
import apiClient from "../api/apiClient.jsx";
import ProductCard from "./ProductCard.jsx";

const PAGE_SIZE = 24;

export default function CategoryId({ categoryId, categoryTitle }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0); // backend expects 0-based
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await apiClient.products.getByCategoryId(
          categoryId,
          page,
          PAGE_SIZE
        );
        if (Array.isArray(data.content)) {
          // replace products when page changes
          setProducts(data.content);
          setTotalPages(data.totalPages || 1);
        }
      } catch (e) {
        console.error(e);
        setError("Бүтээгдэхүүн татахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // build pagination range
  const pages = [];
  const pageRange = 2;
  const start = Math.max(0, page - pageRange);
  const end = Math.min(totalPages - 1, page + pageRange);
  if (start > 0) {
    pages.push(0);
    if (start > 1) pages.push("...");
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) {
    if (end < totalPages - 2) pages.push("...");
    pages.push(totalPages - 1);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{categoryTitle}</h2>

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 0 || loading}
                className={`px-3 py-1 rounded border ${
                  page <= 0
                    ? "pointer-events-none opacity-50 bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Өмнөх
              </button>

              {pages.map((p, idx) =>
                p === "..." ? (
                  <span key={idx} className="px-3 py-1 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 rounded ${
                      page === p
                        ? "bg-[#f7941e] text-white"
                        : "bg-white border text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {p + 1}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1 || loading}
                className={`px-3 py-1 rounded border ${
                  page >= totalPages - 1
                    ? "pointer-events-none opacity-50 bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Дараах
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
