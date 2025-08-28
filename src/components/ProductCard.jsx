export default function ProductCard({ product }) {
  const displayImage =
    product.imagePath ||
    "https://placehold.co/600x400/E5E7EB/6B7280?text=No+Image";
  const displayShort = product.shortName || "";
  const displayPrice = product.price ?? "-";

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <img
        src={displayImage}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
          {product.name}
        </h2>

        {displayShort && (
          <p className="text-sm text-gray-600 truncate">{displayShort}</p>
        )}

        {(product.categoryName || product.categoryId) && (
          <p className="mt-1 text-xs text-gray-500">
            Ангилал: {product.categoryName || `ID ${product.categoryId}`}
          </p>
        )}

        <p className="mt-2 text-gray-800">
          Үнэ: {displayPrice}
          {typeof displayPrice === "number" ? " ₮" : ""}
        </p>

        <a
          href={`/product/${product.id}`}
          className="mt-4 inline-block bg-[#f7941e] text-white px-4 py-2 rounded hover:bg-[#e6831c] transition"
        >
          Дэлгэрэнгүй
        </a>
      </div>
    </div>
  );
}
