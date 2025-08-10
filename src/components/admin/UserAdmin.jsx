import React, { useState, useEffect, useCallback } from "react";

// Mock component for AdminUserTable
// In a real application, this would be a separate file and potentially more complex.
const AdminUserTable = ({ users, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Хэрэглэгчийн жагсаалт</h3>
      {users.length === 0 ? (
        <p className="text-gray-600">Хэрэглэгч олдсонгүй.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хэрэглэгчийн нэр</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">И-мэйл</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үүрэг</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={user.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
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
// Reused from ProductAdmin and CategoryAdmin, ensuring consistent UI for dialogs
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

// Main UserAdmin Component
const UserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: "", name: "", email: "", role: "user", password: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for the custom modal (reused from other admin components)
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert", // 'alert' or 'confirm'
    onConfirm: () => {},
    onCancel: () => {},
    onClose: () => {},
  });

  // API base URL for users
  const API_BASE = "http://localhost:8080/api/admin/user";

  // Function to show custom alert modal
  const showAlert = useCallback((message, title = "Мэдээлэл") => {
    setModal({
      isOpen: true,
      title,
      message,
      type: "alert",
      onClose: () => setModal((prev) => ({ ...prev, isOpen: false })),
    });
  }, []);

  // Function to show custom confirmation modal
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

  // Fetch all users from the API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error(`HTTP алдаа: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Хэрэглэгч татах үед алдаа гарлаа:", err);
      setError("Хэрэглэгч татах үед алдаа гарлаа. Сүлжээгээ шалгана уу.");
      showAlert("Хэрэглэгч татах үед алдаа гарлаа. Сүлжээгээ шалгана уу.");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle input change for user form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({
      ...prev,
      [name]: name === "id" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // Save or update a user
  const handleSave = async () => {
    if (!currentUser.name || !currentUser.email || !currentUser.role === "") {
      showAlert("ID, Хэрэглэгчийн нэр, И-мэйл, болон Үүрэг талбаруудыг бөглөнө үү.");
      return;
    }
    // For new users, password is required
    if (editingIndex === null && !currentUser.password) {
      showAlert("Шинэ хэрэглэгч нэмэхэд нууц үг заавал шаардлагатай.");
      return;
    }

    setLoading(true);
    setError(null);
    const method = editingIndex !== null ? "PUT" : "POST";
    const url = editingIndex !== null ? `${API_BASE}/${users[editingIndex].id}` : API_BASE;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser),
      });

      if (!response.ok) {
        throw new Error(`HTTP алдаа: ${response.status}`);
      }

      showAlert(editingIndex !== null ? "Амжилттай шинэчиллээ." : "Амжилттай хадгаллаа.");
      setFormVisible(false);
      setCurrentUser({ name: "", email: "", role: "user", password: "" }); // Reset password field
      setEditingIndex(null);
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("Хадгалах үед алдаа гарлаа:", err);
      setError("Хадгалах үед алдаа гарлаа. Талбаруудыг шалгана уу.");
      showAlert("Хадгалах үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  // Set user for editing
  const handleEdit = (index) => {
    const userToEdit = users[index];
    setCurrentUser({
      ...userToEdit,
      id: userToEdit.id ?? "",
      password: "", // Do not pre-fill password for security reasons
    });
    setEditingIndex(index);
    setFormVisible(true);
  };

  // Delete a user
  const handleDelete = (index) => {
    showConfirm("Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?", async () => {
      setLoading(true);
      setError(null);
      const userId = users[index].id;
      try {
        const response = await fetch(`${API_BASE}/${userId}`, { method: "DELETE" });

        if (!response.ok) {
          throw new Error(`HTTP алдаа: ${response.status}`);
        }

        showAlert("Амжилттай устгалаа.");
        fetchUsers(); // Refresh the user list
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
          body {
            font-family: 'Inter', sans-serif;
          }
          .input-field {
            border-radius: 0.375rem; /* rounded-md */
            padding: 0.5rem 1rem; /* px-4 py-2 */
            width: 100%;
            border: 2px solid #D1D5DB; /* border-2 */
            transition: all 0.2s ease-in-out;
          }
          .input-field:focus {
            outline: none;
            border-color: #3B82F6; /* focus:ring-blue-500 */
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); /* focus:ring-2 */
          }
        `}
      </style>

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Хэрэглэгч удирдах</h1>

      {/* Loading Indicator */}
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

      {/* Add User Button */}
      <button
        onClick={() => {
          setFormVisible(!formVisible);
          setEditingIndex(null);
          setCurrentUser({ id: "", name: "", email: "", role: "user", password: "" });
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md mb-6 shadow-md transition-colors"
      >
        {formVisible ? "Хаах" : "Хэрэглэгч нэмэх"}
      </button>

      {/* User Form */}
      {formVisible && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editingIndex !== null ? "Хэрэглэгч засах" : "Шинэ хэрэглэгч нэмэх"}
          </h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Хэрэглэгчийн нэр:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentUser.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">И-мэйл:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={currentUser.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Нууц үг:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={currentUser.password}
              onChange={handleChange}
              className="input-field"
              placeholder={editingIndex !== null ? "Шинэ нууц үг оруулахгүй бол өөрчлөгдөхгүй" : ""}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Үүрэг:</label>
            <select
              id="role"
              name="role"
              value={currentUser.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="user">Хэрэглэгч</option>
              <option value="admin">Админ</option>
              <option value="manager">Менежер</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition-colors"
          >
            Хадгалах
          </button>
        </div>
      )}

      {/* User Table */}
      <AdminUserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Custom Alert/Confirm Modal */}
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        onClose={modal.onClose}
      />
    </div>
  );
};

export default UserAdmin;
