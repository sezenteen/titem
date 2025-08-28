import { useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartItem({ item, onQuantityChange, onRemove }) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onQuantityChange(item.product.id, newQty);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      onQuantityChange(item.product.id, newQty);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border">
      {/* Product Image */}
      <img
        src={item.product.imagePath || "/placeholder.png"}
        alt={item.product.name}
        className="w-20 h-20 object-cover rounded-xl border"
      />

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{item.product.name}</h3>
        <p className="text-sm text-gray-500">{item.product.shortName}</p>
        <p className="text-sm font-medium mt-1">${item.price.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrease}
          className="p-2 rounded-xl border hover:bg-gray-100"
        >
          <Minus size={16} />
        </button>
        <span className="px-3 font-semibold">{quantity}</span>
        <button
          onClick={handleIncrease}
          className="p-2 rounded-xl border hover:bg-gray-100"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.product.id)}
        className="p-2 rounded-xl border hover:bg-red-50 text-red-500"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
