import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from 'react-dom';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

// A mock component for AdminProductTable.
// This displays the list of products in a responsive table format.
// Pagination buttons are now included here.
const AdminProductTable = ({ products, onEdit, onDelete, currentPage, totalPages, onPageChange }) => {
    // Function to generate an array of page numbers to display in the pagination buttons
    // Redesigned pagination: always show first page, last page, current, and neighbors, with ellipsis as needed
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Number of page buttons (excluding first/last/ellipsis)
        if (totalPages <= maxPagesToShow + 2) {
            // Show all pages if few pages
            for (let i = 0; i < totalPages; i++) pageNumbers.push(i);
            return pageNumbers;
        }

        // Always show first page
        pageNumbers.push(0);

        let startPage = Math.max(1, currentPage);
        let endPage = Math.min(totalPages - 2, currentPage + 1);

        if (currentPage <= 2) {
            endPage = Math.min(totalPages - 2, maxPagesToShow);
        }
        if (currentPage >= totalPages - 3) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        }

        if (startPage > 1) pageNumbers.push('...');
        for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        if (endPage < totalPages - 2) pageNumbers.push('...');
        // Always show last page
        pageNumbers.push(totalPages - 1);

        return pageNumbers;
    };

    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Бүтээгдэхүүний жагсаалт</h3>
            {products.length === 0 ? (
                <p className="text-gray-600">Бүтээгдэхүүн олдсонгүй.</p>
            ) : (
                <table className="min-w-full table-auto divide-y divide-gray-200">
                    <thead className="bg-gray-50 hidden md:table-header-group">
                        <tr>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Нэр</th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Богино Нэр</th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Баркод</th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Үнэ</th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категори ID</th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хэмжих Нэгж ID</th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Хотын Татвар</th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">НӨАТгүй</th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product, index) => (
                            <tr key={product.id || index} className="hover:bg-gray-50 block md:table-row">
                                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex md:table-cell justify-between">
                                    <span className="md:hidden text-gray-500">Нэр</span>
                                    <span>{product.name}</span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500 flex md:table-cell justify-between">
                                    <span className="md:hidden text-gray-500">Богино Нэр</span>
                                    <span>{product.shortName}</span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500 flex md:table-cell justify-between">
                                    <span className="md:hidden text-gray-500">Баркод</span>
                                    <span>{product.barcode}</span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500 flex md:table-cell justify-between">
                                    <span className="md:hidden text-gray-500">Үнэ</span>
                                    <span>{product.price}</span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500 flex md:table-cell justify-between">
                                    <span className="md:hidden text-gray-500">Категори ID</span>
                                    <span>{product.categoryID?.id}</span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500 flex md:table-cell justify-between">
                                    <span className="md:hidden text-gray-500">Хэмжих Нэгж ID</span>
                                    <span>{product.measureUnitID?.id}</span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500 flex md:table-cell justify-between">
                                    <span className="md:hidden text-gray-500">Хотын Татвар</span>
                                    <span>{product.allowCityTax ? "Тийм" : "Үгүй"}</span>
                                </td>
                                <td className="px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500 flex md:table-cell justify-between">
                                    <span className="md:hidden text-gray-500">НӨАТгүй</span>
                                    <span>{product.isVATFree ? "Тийм" : "Үгүй"}</span>
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
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Өмнөх
                    </button>
                    {getPageNumbers().map((page, idx) => (
                        typeof page === 'number' ? (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`px-4 py-2 border rounded-md transition-colors ${currentPage === page
                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                    : "bg-white text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {page + 1}
                            </button>
                        ) : (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 select-none">...</span>
                        )
                    ))}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Дараах
                    </button>
                </div>
            )}
        </div>
    );
};


// BarcodeScanner component using html5-qrcode for barcode/QR scanning
const BarcodeScanner = ({ onScanSuccess, onClose, showAlert }) => {
    const scannerRef = useRef(null);
    const containerId = 'qr-reader';

    useEffect(() => {
        try {
            scannerRef.current = new Html5QrcodeScanner(
                containerId,
                {
                    fps: 10,
                    qrbox: { width: 300, height: 300 },
                    rememberLastUsedCamera: true,
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.QR_CODE,
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.UPC_A,
                        Html5QrcodeSupportedFormats.UPC_E,
                        Html5QrcodeSupportedFormats.CODE_128,
                    ],
                },
                false
            );

            const onSuccess = (decodedText) => {
                // Stop scanner and report success
                scannerRef.current?.clear().catch(() => {});
                onScanSuccess(decodedText);
            };

            const onError = () => {
                // ignore continuous scan errors
            };

            scannerRef.current.render(onSuccess, onError);
        } catch (err) {
            showAlert("Камер эхлүүлэхэд алдаа гарлаа: " + (err?.message || err));
            onClose();
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
            }
        };
    }, [onScanSuccess, onClose, showAlert]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <p className="text-gray-700 mb-4">Камер ашиглан баркод/QR уншуулах.</p>
            <div
                id={containerId}
                className="w-full max-w-sm aspect-video rounded-lg overflow-hidden bg-black mb-4 border-2 border-gray-300"
            />
            <button
                onClick={() => {
                    if (scannerRef.current) {
                        scannerRef.current.clear().finally(() => onClose());
                    } else {
                        onClose();
                    }
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
            >
                Хаах
            </button>
        </div>
    );
};

// A custom Modal Component to replace native alert/confirm
const Modal = ({ isOpen, title, message, type, onConfirm, onCancel, onClose, children }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all scale-100 opacity-100">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
                {message && <p className="text-gray-700 mb-6">{message}</p>}
                {children}
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
        </div>,
        document.body
    );
};

// Main ProductAdmin Component
const ProductAdmin = () => {
    const [products, setProducts] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        name: "", shortName: "", barcode: "", price: "",
        categoryID: { id: "" }, allowCityTax: false,
        measureUnitID: { id: "" }, customCode: "", imagePath: "",
        packageCount: 1, mainCategoryCode: "", isVATFree: false,
    });
    const [editingIndex, setEditingIndex] = useState(null);
    const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false);
    const [searchBarcode, setSearchBarcode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); // New state for current page
    const [totalPages, setTotalPages] = useState(0); // New state for total pages
    const PAGE_SIZE = 10; // You can adjust the page size here

    const [modal, setModal] = useState({
        isOpen: false, title: "", message: "", type: "alert",
        onConfirm: () => { }, onCancel: () => { }, onClose: () => { },
    });

    // NOTE: The API_BASE is hardcoded. In a real application, this should be configurable.
    const API_BASE = "http://localhost:8080/api/product";

    const showAlert = useCallback((message, title = "Мэдээлэл") => {
        setModal({
            isOpen: true, title, message, type: "alert",
            onClose: () => setModal((prev) => ({ ...prev, isOpen: false })),
        });
    }, []);

    const showConfirm = useCallback((message, onConfirmCallback, title = "Баталгаажуулах") => {
        setModal({
            isOpen: true, title, message, type: "confirm",
            onConfirm: () => {
                onConfirmCallback();
                setModal((prev) => ({ ...prev, isOpen: false }));
            },
            onCancel: () => setModal((prev) => ({ ...prev, isOpen: false })),
        });
    }, []);

    // Updated fetchProducts to handle pagination.
    // It now takes a page number as an argument.
    const fetchProducts = useCallback(async (page = 0) => {
        setLoading(true); setError(null);
        try {
            const response = await fetch(`${API_BASE}?page=${page}&size=${PAGE_SIZE}`);
            if (!response.ok) { throw new Error(`HTTP алдаа: ${response.status}`); }
            const data = await response.json();
            setProducts(data.content);
            setCurrentPage(data.number); // Update current page from API response
            setTotalPages(data.totalPages); // Update total pages from API response
        } catch (err) {
            console.error("Бүтээгдэхүүн татах үед алдаа гарлаа:", err);
            setError("Бүтээгдэхүүн татах үед алдаа гарлаа. Сүлжээгээ шалгана уу.");
            showAlert("Бүтээгдэхүүн татах үед алдаа гарлаа. Сүлжээгээ шалгана уу.");
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    // Handle page change function
    const handlePageChange = (newPage) => {
        // Only fetch if the new page is within the valid range
        if (newPage >= 0 && newPage < totalPages) {
            fetchProducts(newPage);
        }
    };

    // A new effect to handle the initial load and re-fetch when search is cleared.
    useEffect(() => {
        // Only fetch products if the search bar is empty
        if (!searchBarcode) {
            fetchProducts();
        }
    }, [fetchProducts, searchBarcode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "categoryID" || name === "measureUnitID") {
            setCurrentProduct((prev) => ({
                ...prev,
                [name]: { id: value === "" ? "" : Number(value) },
            }));
        } else if (type === "checkbox") {
            setCurrentProduct((prev) => ({
                ...prev, [name]: checked,
            }));
        } else if (type === "number") {
            setCurrentProduct((prev) => ({
                ...prev, [name]: value === "" ? "" : Number(value),
            }));
        } else {
            setCurrentProduct((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        if (!currentProduct.name || !currentProduct.barcode || !currentProduct.price ||
            !currentProduct.categoryID.id || !currentProduct.measureUnitID.id) {
            showAlert("Нэр, Баркод, Үнэ, Категори ID, болон Хэмжих Нэгж ID талбаруудыг бөглөнө үү.");
            return;
        }

        setLoading(true); setError(null);
        const method = editingIndex !== null ? "PUT" : "POST";
        const url = editingIndex !== null ? `${API_BASE}/${products[editingIndex].id}` : API_BASE;

        try {
            const response = await fetch(url, {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProduct),
            });

            if (!response.ok) { throw new Error(`HTTP алдаа: ${response.status}`); }

            showAlert(editingIndex !== null ? "Амжилттай шинэчиллээ." : "Амжилттай хадгаллаа.");
            setFormVisible(false);
            setCurrentProduct({
                name: "", shortName: "", barcode: "", price: "",
                categoryID: { id: "" }, allowCityTax: false,
                measureUnitID: { id: "" }, customCode: "", imagePath: "",
                packageCount: 1, mainCategoryCode: "", isVATFree: false,
            });
            setEditingIndex(null);
            // After save, refresh the current page to see the new/updated product
            fetchProducts(currentPage);
        } catch (err) {
            console.error("Хадгалах үед алдаа гарлаа:", err);
            setError("Хадгалах үед алдаа гарлаа. Талбаруудыг шалгана уу.");
            showAlert("Хадгалах үед алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (index) => {
        const productToEdit = products[index];
        setCurrentProduct({
            ...productToEdit,
            categoryID: productToEdit.categoryID || { id: "" },
            measureUnitID: productToEdit.measureUnitID || { id: "" },
            allowCityTax: productToEdit.allowCityTax ?? false,
            isVATFree: productToEdit.isVATFree ?? false,
            price: productToEdit.price ?? "",
            packageCount: productToEdit.packageCount ?? "",
        });
        setEditingIndex(index);
        setFormVisible(true);
    };

    const handleDelete = (index) => {
        showConfirm("Та энэ бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу?", async () => {
            setLoading(true); setError(null);
            const productId = products[index].id;
            try {
                const response = await fetch(`${API_BASE}/${productId}`, { method: "DELETE" });

                if (!response.ok) { throw new Error(`HTTP алдаа: ${response.status}`); }

                showAlert("Амжилттай устгалаа.");
                // After deleting, refresh the current page
                fetchProducts(currentPage);
            } catch (err) {
                console.error("Устгах үед алдаа гарлаа:", err);
                setError("Устгах үед алдаа гарлаа.");
                showAlert("Устгах үед алдаа гарлаа.");
            } finally {
                setLoading(false);
            }
        });
    };

    const handleSearchBarcodeChange = (e) => setSearchBarcode(e.target.value);

    // Search over all pages to ensure barcodes from the last page are found
    const handleSearchSubmit = async (barcodeInput) => {
        const query = (barcodeInput ?? searchBarcode)?.trim();
        if (!query) {
            fetchProducts(0);
            return;
        }

        setLoading(true); setError(null);
        try {
            const PAGE_SIZE_FOR_SEARCH = 1000;
            let page = 0;
            let totalPagesLocal = 1;
            const matches = [];

            do {
                const response = await fetch(`${API_BASE}?page=${page}&size=${PAGE_SIZE_FOR_SEARCH}`);
                if (!response.ok) { throw new Error(`HTTP алдаа: ${response.status}`); }
                const data = await response.json();
                totalPagesLocal = data.totalPages ?? 1;

                const pageContent = Array.isArray(data.content) ? data.content : [];
                const pageMatches = pageContent.filter(product => product.barcode === query);
                if (pageMatches.length > 0) {
                    matches.push(...pageMatches);
                    // Assuming barcode is unique, stop early
                    break;
                }
                page += 1;
            } while (page < totalPagesLocal);

            setProducts(matches);
            setTotalPages(1);
            setCurrentPage(0);

            if (matches.length === 0) {
                showAlert("Хайсан баркодтой бүтээгдэхүүн олдсонгүй.");
            }
        } catch (err) {
            console.error("Хайлт хийх үед алдаа гарлаа:", err);
            setError("Хайлт хийх үед алдаа гарлаа.");
            showAlert("Хайлт хийх үед алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    // This function is now responsible for setting the barcode and triggering the search
    const handleBarcodeScanSuccess = (barcode) => {
        setBarcodeScannerVisible(false);
        setSearchBarcode(barcode);
        handleSearchSubmit(barcode);
    };


    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans antialiased">
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          .input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1 {
            border-radius: 0.375rem;
            padding: 0.5rem 1rem;
            width: 100%;
            border: 2px solid #D1D5DB;
            transition: all 0.2s ease-in-out;
          }
          .input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1:focus {
            outline: none;
            border-color: #3B82F6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }
        `}
            </style>

            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Бүтээгдэхүүн удирдах</h1>

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

            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 p-4 bg-white shadow-md rounded-lg">
                <input
                    type="text"
                    placeholder="Баркод оруулна уу..."
                    value={searchBarcode}
                    onChange={handleSearchBarcodeChange}
                    className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1 flex-grow"
                />
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={() => handleSearchSubmit()}
                        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded-md w-full sm:w-auto"
                    >
                        Хайх
                    </button>
                    <button
                        onClick={() => {
                            setSearchBarcode(""); // Clear search bar
                            // The useEffect hook will now trigger a re-fetch of the first page
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
                    >
                        Бүх бүтээгдэхүүн
                    </button>
                    <button
                        onClick={() => setBarcodeScannerVisible(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full sm:w-auto"
                    >
                        Сканнер асаах
                    </button>
                </div>
            </div>

            <button
                onClick={() => {
                    setFormVisible(!formVisible);
                    setEditingIndex(null);
                    setCurrentProduct({
                        name: "", shortName: "", barcode: "", price: "",
                        categoryID: { id: "" }, allowCityTax: false,
                        measureUnitID: { id: "" }, customCode: "", imagePath: "",
                        packageCount: 1, mainCategoryCode: "", isVATFree: false,
                    });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md mb-6 shadow-md transition-colors"
            >
                {formVisible ? "Хаах" : "Бүтээгдэхүүн нэмэх"}
            </button>

            {formVisible && (
                <div className="bg-white shadow-md rounded-lg p-6 space-y-4 mb-6">
                    <h2 className="text-2xl text-center font-semibold text-gray-800">
                        {editingIndex !== null ? "Бүтээгдэхүүн засах" : "Шинэ бүтээгдэхүүн нэмэх"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Нэр:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={currentProduct.name}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="shortName" className="block text-sm font-medium text-gray-700 mb-1">Богино Нэр:</label>
                            <input
                                type="text"
                                id="shortName"
                                name="shortName"
                                value={currentProduct.shortName}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Баркод:</label>
                            <input
                                type="text"
                                id="barcode"
                                name="barcode"
                                value={currentProduct.barcode}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Үнэ:</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={currentProduct.price}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="categoryID" className="block text-sm font-medium text-gray-700 mb-1">Категори ID:</label>
                            <input
                                type="number"
                                id="categoryID"
                                name="categoryID"
                                value={currentProduct.categoryID.id}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="measureUnitID" className="block text-sm font-medium text-gray-700 mb-1">Хэмжих Нэгж ID:</label>
                            <input
                                type="number"
                                id="measureUnitID"
                                name="measureUnitID"
                                value={currentProduct.measureUnitID.id}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="allowCityTax"
                                name="allowCityTax"
                                checked={currentProduct.allowCityTax}
                                onChange={handleChange}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            />
                            <label htmlFor="allowCityTax" className="text-sm font-medium text-gray-700">Хотын Татвар зөвшөөрөх</label>
                        </div>
                        <div>
                            <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-1">Захиалгат Код:</label>
                            <input
                                type="text"
                                id="customCode"
                                name="customCode"
                                value={currentProduct.customCode}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="imagePath" className="block text-sm font-medium text-gray-700 mb-1">Зургийн Зам:</label>
                            <input
                                type="text"
                                id="imagePath"
                                name="imagePath"
                                value={currentProduct.imagePath}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="packageCount" className="block text-sm font-medium text-gray-700 mb-1">Багцын Тоо:</label>
                            <input
                                type="number"
                                id="packageCount"
                                name="packageCount"
                                value={currentProduct.packageCount}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="mainCategoryCode" className="block text-sm font-medium text-gray-700 mb-1">Үндсэн Категори Код:</label>
                            <input
                                type="text"
                                id="mainCategoryCode"
                                name="mainCategoryCode"
                                value={currentProduct.mainCategoryCode}
                                onChange={handleChange}
                                className="input-field w-full p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isVATFree"
                                name="isVATFree"
                                checked={currentProduct.isVATFree}
                                onChange={handleChange}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            />
                            <label htmlFor="isVATFree" className="text-sm font-medium text-gray-700">НӨАТгүй</label>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 mr-15">
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition-colors"
                        >
                            Хадгалах
                        </button>
                    </div>

                </div>
            )}

            <AdminProductTable
                products={products}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <Modal
                isOpen={barcodeScannerVisible}
                title="Баркод сканнер"
                onClose={() => setBarcodeScannerVisible(false)}
                type="alert"
            >
                <BarcodeScanner
                    onScanSuccess={handleBarcodeScanSuccess}
                    onClose={() => setBarcodeScannerVisible(false)}
                    showAlert={showAlert}
                />
            </Modal>

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

export default ProductAdmin;
