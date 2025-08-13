import React, { useEffect, useMemo, useState } from 'react';

const slugify = (name) =>
  encodeURIComponent(String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-'));

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('http://localhost:8080/api/category', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Категори татахад алдаа гарлаа.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const items = useMemo(() => categories.map((c) => ({ ...c, slug: slugify(c.name) })), [categories]);

  if (loading) {
    return (
      <div className="flex overflow-x-auto gap-4 py-2 w-full">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm py-2" role="alert">
        <span>{error}</span>
        <button
          onClick={() => {
            // Simple retry by resetting state to loading; effect will not re-run without a trigger, so reload
            window.location.reload();
          }}
          className="px-2 py-1 bg-red-600 text-white rounded-md text-xs"
        >
          Дахин оролдох
        </button>
      </div>
    );
  }

  if (!items.length) {
    return <p className="text-center text-gray-600">Одоогоор ангилал байхгүй байна.</p>;
  }

  return (
    <div className="flex overflow-x-auto gap-3 md:gap-4 py-2 scrollbar-hide whitespace-nowrap w-full">
      <a
        href="/products"
        className={`flex-shrink-0 px-4 py-2 rounded-lg shadow-sm transition-colors text-sm font-medium ${
          currentPath.startsWith('/products') || currentPath === '/' ? 'bg-[#f7941e] text-white' : 'bg-white hover:bg-gray-100 text-gray-800'
        }`}
      >
        Бүгд
      </a>
      {items.map((category) => {
        const href = `/category/${category.slug}`;
        const isActive = currentPath.startsWith(href);
        return (
          <a
            key={category.id}
            href={href}
            className={`flex-shrink-0 px-4 py-2 rounded-lg shadow-sm transition-colors text-sm font-medium ${
              isActive ? 'bg-[#f7941e] text-white' : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {category.name || 'Үл мэдэгдэх ангилал'}
          </a>
        );
      })}
    </div>
  );
};

export default CategoryList;