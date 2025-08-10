import React, { useState, useEffect, useCallback } from "react";

// Custom Modal Component to replace native alert/confirm
// Reused from other admin components for consistent UI
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

// Main SettingsAdmin Component
const SettingsAdmin = () => {
  const [settings, setSettings] = useState({
    shopName: "",
    address: "",
    contactEmail: "",
    phoneNumber: "",
    currencySymbol: "₮", // Default to Mongolian Tugrik
    vatRate: 0,
    onlineOrderingEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for the custom modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "alert", // 'alert' or 'confirm'
    onConfirm: () => {},
    onCancel: () => {},
    onClose: () => {},
  });

  // Mock API base URL for settings (replace with your actual backend endpoint)
  const API_BASE = "http://localhost:8080/api/settings";

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

  // Fetch settings from the API
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate fetching settings. In a real app, this would be a GET request.
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error(`HTTP алдаа: ${response.status}`);
      }
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error("Тохиргоо татах үед алдаа гарлаа:", err);
      setError("Тохиргоо татах үед алдаа гарлаа. Сүлжээгээ шалгана уу.");
      showAlert("Тохиргоо татах үед алдаа гарлаа. Сүлжээгээ шалгана уу.");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle input change for settings form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save settings to the API
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate saving settings. In a real app, this would be a PUT/POST request.
      const response = await fetch(API_BASE, {
        method: "PUT", // Or POST, depending on your API design
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP алдаа: ${response.status}`);
      }

      showAlert("Тохиргоо амжилттай хадгалагдлаа.");
    } catch (err) {
      console.error("Тохиргоо хадгалах үед алдаа гарлаа:", err);
      setError("Тохиргоо хадгалах үед алдаа гарлаа.");
      showAlert("Тохиргоо хадгалах үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
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

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Тохиргоо</h1>

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

      <div className="bg-white shadow-md rounded-lg p-6 space-y-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800">Ерөнхий тохиргоо</h2>

        {/* Shop Name */}
        <div>
          <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">Дэлгүүрийн нэр:</label>
          <input
            type="text"
            id="shopName"
            name="shopName"
            value={settings.shopName}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Хаяг:</label>
          <textarea
            id="address"
            name="address"
            value={settings.address}
            onChange={handleChange}
            className="input-field h-24"
          ></textarea>
        </div>

        {/* Contact Email */}
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Холбоо барих и-мэйл:</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={settings.contactEmail}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар:</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={settings.phoneNumber}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Currency Symbol */}
        <div>
          <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 mb-1">Валютын тэмдэг:</label>
          <input
            type="text"
            id="currencySymbol"
            name="currencySymbol"
            value={settings.currencySymbol}
            onChange={handleChange}
            className="input-field w-24"
          />
        </div>

        {/* VAT Rate */}
        <div>
          <label htmlFor="vatRate" className="block text-sm font-medium text-gray-700 mb-1">НӨАТ-ын хувь (%):</label>
          <input
            type="number"
            id="vatRate"
            name="vatRate"
            value={settings.vatRate}
            onChange={handleChange}
            className="input-field w-32"
            step="0.01"
            min="0"
            max="100"
          />
        </div>

        {/* Feature Toggle: Online Ordering */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="onlineOrderingEnabled"
            name="onlineOrderingEnabled"
            checked={settings.onlineOrderingEnabled}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <label htmlFor="onlineOrderingEnabled" className="text-sm font-medium text-gray-700">Онлайн захиалга идэвхжүүлэх</label>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition-colors"
        >
          Тохиргоог хадгалах
        </button>
      </div>

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

export default SettingsAdmin;
