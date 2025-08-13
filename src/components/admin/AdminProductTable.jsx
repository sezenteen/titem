import React from "react";

const AdminProductTable = ({ products, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white">
      <table className="min-w-full table-auto divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs hidden md:table-header-group">
          <tr>
            <th className="px-4 md:px-6 py-3 text-left">Нэр</th>
            <th className="px-4 md:px-6 py-3 text-left">Баркод</th>
            <th className="px-4 md:px-6 py-3 text-left">Үнэ</th>
            <th className="px-4 md:px-6 py-3 text-center">Үйлдэл</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500">
                Бүтээгдэхүүн алга байна.
              </td>
            </tr>
          ) : (
            products.map((product, index) => (
              <tr key={product._id || index} className="hover:bg-gray-50 block md:table-row">
                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap flex md:table-cell justify-between">
                  <span className="md:hidden text-gray-500">Нэр</span>
                  <span>{product.name}</span>
                </td>
                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap flex md:table-cell justify-between">
                  <span className="md:hidden text-gray-500">Баркод</span>
                  <span>{product.barcode}</span>
                </td>
                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap flex md:table-cell justify-between">
                  <span className="md:hidden text-gray-500">Үнэ</span>
                  <span>{product.price}</span>
                </td>
                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap flex md:table-cell justify-between">
                  <span className="md:hidden text-gray-500">Үйлдэл</span>
                  <span className="text-center space-x-2">
                    <button
                      onClick={() => onEdit(index)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => onDelete(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Устгах
                    </button>
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductTable;
