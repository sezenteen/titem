import React, { useState, useEffect, useCallback } from "react";
import apiClient from '../../api/apiClient.jsx';

// Mock component for AdminCategoryTable
// In a real application, this would be a separate file and potentially more complex.
const AdminCategoryTable = ({ categories, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Ангилалын жагсаалт</h3>
      {categories.length === 0 ? (
        <p className="text-gray-600">Ангилал олдсонгүй.</p>
      ) : (
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50 hidden md:table-header-group">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">ID</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Нэр</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category, index) => (
              <tr key={category.id || index} className="hover:bg-gray-50 block md:table-row">
                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex md:table-cell justify-between">
                  <span className="md:hidden text-gray-500">ID</span>
                  <span>{category.id}</span>
                </td>
                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500 flex md:table-cell justify-between">
                  <span className="md:hidden text-gray-500">Нэр</span>
                  <span>{category.name}</span>
                </td>
                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm flex md:table-cell justify-between">
                  <span className="md:hidden text-gray-500">Үйлдэл</span>
                  <span>
                    <button
                      onClick={() => onEdit(index)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium transition-colors"
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => onDelete(index)}
                      className="text-red-600 hover:text-red-900 font-medium transition-colors"
                    >
                      Устгах
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Custom Modal Component to replace native alert/confirm
// Reused from ProductAdmin, ensuring consistent UI for dialogs
const Modal = ({ isOpen, title, message, type, onConfirm, onCancel, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all scale-100 opacity-100">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        {message && <p className="text-gray-700 mb-6">{message}</p>}
        {children} {/* Allows rendering custom content inside the modal */}
        <div className="flex justify-end space-x-3 mt-4">
          {type === "confirm" && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Үгүй
            </button>
          )}
          <button
            onClick={type === "alert" ? onClose : onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {type === "alert" ? "Хаах" : "Тийм"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main CategoryAdmin Component
const CategoryAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: "", name: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    onConfirm: () => {},
    onCancel: () => {},
    onClose: () => {},
  });

  const showAlert = useCallback((message, title = "Мэдээлэл") => {
    setModal({
      isOpen: true,
      title,
      message,
      type: "alert",
      onClose: () => setModal((prev) => ({ ...prev, isOpen: false })),
    });
  }, []);

  const showConfirm = useCallback((message, onConfirmCallback, title = "Баталгаажуулах") => {
    setModal({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm: () => {
        onConfirmCallback();
        setModal((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setModal((prev) => ({ ...prev, isOpen: false })),
    });
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.categories.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ангилал татах үед алдаа гарлаа:", err);
      setError("Ангилал татах үед алдаа гарлаа. Сүлжээгээ шалгана уу.");
      showAlert("Ангилал татах үед алдаа гарлаа. Сүлжээгээ шалгана уу.");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if ((currentCategory.name || "").trim() === "") {
      showAlert("Нэр талбаруудыг бөглөнө үү.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingIndex !== null) {
        await apiClient.categories.update(categories[editingIndex].id, { name: currentCategory.name });
      } else {
        await apiClient.categories.create({ name: currentCategory.name });
      }

      showAlert(editingIndex !== null ? "Амжилттай шинэчиллээ." : "Амжилттай хадгаллаа.");
      setFormVisible(false);
      setCurrentCategory({ id: "", name: "" });
      setEditingIndex(null);
      fetchCategories();
    } catch (err) {
      console.error("Хадгалах үед алдаа гарлаа:", err);
      setError("Хадгалах үед алдаа гарлаа. Талбаруудыг шалгана уу.");
      showAlert("Хадгалах үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    const categoryToEdit = categories[index];
    setCurrentCategory({ id: categoryToEdit.id ?? "", name: categoryToEdit.name ?? "" });
    setEditingIndex(index);
    setFormVisible(true);
  };

  const handleDelete = (index) => {
    showConfirm("Та энэ ангиллыг устгахдаа итгэлтэй байна уу?", async () => {
      setLoading(true);
      setError(null);
      const categoryId = categories[index].id;
      try {
        await apiClient.categories.remove(categoryId);
        showAlert("Амжилттай устгалаа.");
        fetchCategories();
      } catch (err) {
        console.error("Устгах үед алдаа гарлаа:", err);
        setError("Устгах үед алдаа гарлаа.");
        showAlert("Устгах үед алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans antialiased">
      {/* Tailwind CSS CDN for styling */}
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .input-field { border-radius: 0.375rem; padding: 0.5rem 1rem; width: 100%; border: 2px solid #D1D5DB; transition: all 0.2s ease-in-out; }
          .input-field:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); }
        `}
      </style>

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Ангилал удирдах</h1>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="flex items-center space-x-2 text-white text-lg">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Уншиж байна...</span>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setFormVisible(!formVisible);
          setEditingIndex(null);
          setCurrentCategory({ id: "", name: "" });
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md mb-6 shadow-md transition-colors"
      >
        {formVisible ? "Хаах" : "Ангилал нэмэх"}
      </button>

      {formVisible && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editingIndex !== null ? "Ангилал засах" : "Шинэ ангилал нэмэх"}
          </h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Нэр:</label>
            <input type="text" id="name" name="name" value={currentCategory.name} onChange={handleChange} className="input-field" />
          </div>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition-colors">Хадгалах</button>
        </div>
      )}

      <AdminCategoryTable categories={categories} onEdit={handleEdit} onDelete={handleDelete} />

      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onConfirm={modal.onConfirm} onCancel={modal.onCancel} onClose={modal.onClose} />
    </div>
  );
};

export default CategoryAdmin;
