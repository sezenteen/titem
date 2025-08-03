// src/components/admin/ProductAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import BarcodeScanner from './BarcodeScanner'; // Ensure this path is correct

const ProductAdmin = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // To populate category dropdown
    const [measureUnits, setMeasureUnits] = useState([]); // To populate measure unit dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newProduct, setNewProduct] = useState({
        name: '',
        shortName: '',
        barcode: '',
        price: 0,
        categoryID: '', // Will store selected category ID
        allowCityTax: true,
        measureUnitID: '', // Will store selected measure unit ID
        customCode: '',
        imagePath: '', // For displaying existing path or new path
        packageCount: 1,
        mainCategoryCode: '',
        isVATFree: false,
    });
    const [editingProduct, setEditingProduct] = useState(null); // Stores the product being edited
    const [productImageFile, setProductImageFile] = useState(null); // For new image file

    // --- NEW: Barcode Search State & Scanner Visibility ---
    const [searchBarcode, setSearchBarcode] = useState(''); // State for the search input
    const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false);

    const API_URL = 'http://localhost:8080/api/product';
    const CATEGORY_API_URL = 'http://localhost:8080/api/category';
    const MEASURE_UNIT_API_URL = 'http://localhost:8080/api/measureunit';
    const UPLOAD_API_URL = 'http://localhost:8080/api/upload'; // Explicit image upload URL

    // --- FETCHING FUNCTIONS ---
    // Use useCallback for memoization if these functions are passed as props to child components
    const fetchProducts = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setProducts(response.data);
        } catch (err) {
            setError('Бүтээгдэхүүн татахад алдаа гарлаа: ' + (err.response?.data?.message || err.message));
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(CATEGORY_API_URL);
            setCategories(response.data);
        } catch (err) {
            console.error("Failed to fetch categories for dropdown:", err);
        }
    }, []);

    const fetchMeasureUnits = useCallback(async () => {
        try {
            const response = await axios.get(MEASURE_UNIT_API_URL);
            setMeasureUnits(response.data);
        } catch (err) {
            console.error("Failed to fetch measure units for dropdown:", err);
        }
    }, []);

    // --- NEW: Search by Barcode Function ---
    const searchProductsByBarcode = useCallback(async (barcode) => {
        setError(null);
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/barcode/${barcode}`);
            // Assuming your backend returns a single product object for exact match
            // or null/empty response if not found. Adjust based on your API.
            setProducts(response.data ? [response.data] : []); 
            if (!response.data) {
                setError('Энэ баркодтой бүтээгдэхүүн олдсонгүй.');
            }
        } catch (err) {
            setError('Баркодоор хайхад алдаа гарлаа: ' + (err.response?.data?.message || err.message));
            setProducts([]); // Clear products on error or no results
            console.error("Failed to search product by barcode:", err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);


    // --- EFFECT HOOKS ---
    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchMeasureUnits();
    }, [fetchProducts, fetchCategories, fetchMeasureUnits]); // Dependencies for useCallback functions

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (editingProduct) {
            setEditingProduct(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        } else {
            setNewProduct(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleFileChange = (e) => {
        setProductImageFile(e.target.files[0]);
    };

    // --- NEW: Barcode Scan Handler ---
    const handleBarcodeScan = (scannedBarcode) => {
        if (editingProduct) {
            setEditingProduct(prev => ({ ...prev, barcode: scannedBarcode }));
        } else {
            setNewProduct(prev => ({ ...prev, barcode: scannedBarcode }));
        }
        setSearchBarcode(scannedBarcode); // Also update the search input field
        setBarcodeScannerVisible(false); // Hide scanner after scan
        // Optionally, trigger a search immediately after scanning
        searchProductsByBarcode(scannedBarcode); 
    };

    // --- NEW: Handle Search Barcode Input Change ---
    const handleSearchBarcodeChange = (e) => {
        setSearchBarcode(e.target.value);
    };

    // --- NEW: Handle Search Button Click ---
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Prevent form submission if it's within a form
        if (searchBarcode.trim()) {
            searchProductsByBarcode(searchBarcode.trim());
        } else {
            // If search bar is empty, fetch all products
            fetchProducts();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        let payload;
        let url;
        let method;

        // Determine if it's an update or create operation
        if (editingProduct) {
            payload = {
                ...editingProduct,
                price: parseFloat(editingProduct.price),
                packageCount: parseInt(editingProduct.packageCount),
                // Ensure categoryID and measureUnitID are sent as objects with 'id'
                categoryID: editingProduct.categoryID ? { id: parseInt(editingProduct.categoryID) } : null,
                measureUnitID: editingProduct.measureUnitID ? { id: parseInt(editingProduct.measureUnitID) } : null
            };
            url = `${API_URL}/${editingProduct.id}`;
            method = 'put';
        } else {
            payload = {
                ...newProduct,
                price: parseFloat(newProduct.price),
                packageCount: parseInt(newProduct.packageCount),
                categoryID: newProduct.categoryID ? { id: parseInt(newProduct.categoryID) } : null,
                measureUnitID: newProduct.measureUnitID ? { id: parseInt(newProduct.measureUnitID) } : null
            };
            url = API_URL;
            method = 'post';
        }

        // Handle image upload if a new file is selected
        if (productImageFile) {
            const formData = new FormData();
            formData.append('file', productImageFile);

            try {
                const uploadResponse = await axios.post(UPLOAD_API_URL, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                payload.imagePath = uploadResponse.data.filePath; // Update payload with new image path
            } catch (uploadErr) {
                setError('Зураг байршуулахад алдаа гарлаа: ' + (uploadErr.response?.data?.message || uploadErr.message));
                console.error("Image upload failed:", uploadErr);
                return; // Stop if image upload fails
            }
        }

        try {
            const response = await axios({ method, url, data: payload });
            if (editingProduct) {
                // Update the product in the list with the full object returned by the server
                setProducts(products.map(prod => prod.id === response.data.id ? response.data : prod));
                setEditingProduct(null);
            } else {
                setProducts([...products, response.data]);
                setNewProduct({ // Reset form
                    name: '', shortName: '', barcode: '', price: 0, categoryID: '', allowCityTax: true,
                    measureUnitID: '', customCode: '', imagePath: '', packageCount: 1, mainCategoryCode: '', isVATFree: false,
                });
            }
            setProductImageFile(null); // Clear file input
        } catch (err) {
            setError('Бүтээгдэхүүн хадгалахад алдаа гарлаа: ' + (err.response?.data?.message || err.message));
            console.error("Failed to save product:", err);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Энэ бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу?')) return;
        setError(null); // Clear previous errors
        try {
            await axios.delete(`${API_URL}/${id}`);
            setProducts(products.filter(prod => prod.id !== id));
        } catch (err) {
            setError('Бүтээгдэхүүн устгахад алдаа гарлаа: ' + (err.response?.data?.message || err.message));
            console.error("Failed to delete product:", err);
        }
    };

    const handleEditClick = (product) => {
        // When setting editingProduct, ensure you store the ID for category/measureUnit
        // so the dropdowns reflect the correct current selection.
        setEditingProduct({
            ...product,
            categoryID: product.categoryID ? product.categoryID.id : '',
            measureUnitID: product.measureUnitID ? product.measureUnitID.id : ''
        });
        setProductImageFile(null); // Clear any previously selected file when starting an edit
    };

    if (loading) return <p className="text-center text-gray-700">Бүтээгдэхүүн ачаалж байна...</p>;
    
    const currentProduct = editingProduct || newProduct;

    return (
        <div>
            {/* Create/Edit Form */}
            <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-lg shadow-md bg-white">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingProduct ? 'Бүтээгдэхүүн засах' : 'Шинэ бүтээгдэхүүн нэмэх'}</h3>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>} {/* Display form-specific errors */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Нэр:</label>
                        <input type="text" id="name" name="name" value={currentProduct.name} onChange={handleChange} className="input-field border-2 rounded-md px-5 py-2" required />
                    </div>
                    <div>
                        <label htmlFor="shortName" className="block text-sm font-medium text-gray-700">Богино нэр:</label>
                        <input type="text" id="shortName" name="shortName" value={currentProduct.shortName} onChange={handleChange} className="input-field border-2 rounded-md px-5 py-2 " />
                    </div>
                    <div>
                        <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">Баркод:</label>
                        <div className="flex items-center space-x-3">
                            <input type="text" id="barcode" name="barcode" value={currentProduct.barcode} onChange={handleChange} className="input-field border-2 rounded-md px-5 py-2 flex-grow" />
                            <button
                                type="button"
                                onClick={() => setBarcodeScannerVisible(true)}
                                className="btn-secondary whitespace-nowrap !px-4 !py-2"
                            >
                                <img src="../img/scan.png" alt="scan" className="w-8 ml-5" />
                                Скан хийх
                            </button>
                        </div>
                        {/* Popover for Barcode Scanner */}
                        {barcodeScannerVisible && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                <div className="absolute inset-0 bg-black opacity-40" onClick={() => setBarcodeScannerVisible(false)} />
                                <div className="relative bg-white rounded-lg p-6 max-w-lg w-full shadow-lg border border-gray-200">
                                    <h4 className="text-xl font-semibold mb-4 text-gray-800">Баркод сканнердах</h4>
                                    <BarcodeScanner onScanSuccess={handleBarcodeScan} />
                                    <button
                                        type="button"
                                        onClick={() => setBarcodeScannerVisible(false)}
                                        className="btn-secondary mt-4 bg-[#003375]"
                                    >
                                        Хаах
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Үнэ:</label>
                        <input type="number" id="price" name="price" value={currentProduct.price} onChange={handleChange} className="input-field border-2 rounded-md px-5 py-2" step="0.01" required />
                    </div>
                    <div>
                        <label htmlFor="categoryID" className="block text-sm font-medium text-gray-700">Ангилал:</label>
                        <select id="categoryID" name="categoryID" value={currentProduct.categoryID} onChange={handleChange} className="input-field border-2 rounded-md px-5 py-2" required>
                            <option value="">Ангилал сонгоно уу</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="measureUnitID" className="block text-sm font-medium text-gray-700">Хэмжих нэгж:</label>
                        <select id="measureUnitID" name="measureUnitID" value={currentProduct.measureUnitID} onChange={handleChange} className="input-field border-2 rounded-md px-5 py-2" required>
                            <option value="">Нэгж сонгоно уу</option>
                            {measureUnits.map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="customCode" className="block text-sm font-medium text-gray-700">Захиалгат код:</label>
                        <input type="text" id="customCode" name="customCode" value={currentProduct.customCode} onChange={handleChange} className="input-field border-2 rounded-md px-5 py-2" />
                    </div>
                    <div>
                        <label htmlFor="packageCount" className="block text-sm font-medium text-gray-700">Багцын тоо:</label>
                        <input type="number" id="packageCount" name="packageCount" value={currentProduct.packageCount} onChange={handleChange} className="input-field border-2 rounded-md px-5 py-2" min="1" />
                    </div>
                    <div>
                        <label htmlFor="mainCategoryCode" className="block text-sm font-medium text-gray-700">Үндсэн ангиллын код:</label>
                        <input type="text" id="mainCategoryCode" name="mainCategoryCode" value={currentProduct.mainCategoryCode} onChange={handleChange} className="input-field border-2 rounded-md px-5 py-2" />
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="allowCityTax" name="allowCityTax" checked={currentProduct.allowCityTax} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label htmlFor="allowCityTax" className="ml-2 text-sm font-medium text-gray-700">Хотын татвар зөвшөөрөх</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="isVATFree" name="isVATFree" checked={currentProduct.isVATFree} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label htmlFor="isVATFree" className="ml-2 text-sm font-medium text-gray-700">НӨАТгүй</label>
                    </div>
                    <div>
                        <label htmlFor="productImageFile" className="block text-sm font-medium text-gray-700">Зураг:</label>
                        <input type="file" id="productImageFile" name="productImageFile" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        {currentProduct.imagePath && (
                            <p className="text-xs text-gray-500 mt-1">
                                Одоогийн зураг: <a href={currentProduct.imagePath} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    {currentProduct.imagePath.split('/').pop()}
                                </a>
                                <img src={currentProduct.imagePath} alt="Product" className="mt-2 w-40 h-40 object-contain border rounded-md" />
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex space-x-3 mt-6">
                    <button
                        type="submit"
                        className="btn-primary bg-gradient-to-tr from-[#f7941e] to-[#003375] text-white p-2 rounded-md hover:from-[#003375] hover:to-[#f7941e] transition-colors duration-200"
                    >
                        {editingProduct ? 'Хадгалах' : 'Нэмэх'}
                    </button>
                    {editingProduct && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingProduct(null);
                                setNewProduct({ // Reset new product form when canceling edit
                                    name: '', shortName: '', barcode: '', price: 0, categoryID: '', allowCityTax: true,
                                    measureUnitID: '', customCode: '', imagePath: '', packageCount: 1, mainCategoryCode: '', isVATFree: false,
                                });
                                setProductImageFile(null); // Clear file input on cancel
                            }}
                            className="btn-secondary bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                        >
                            Цуцлах
                        </button>
                    )}
                </div>
            </form>

            {/* --- NEW: Barcode Search Section --- */}
            <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-md bg-white">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Баркодоор хайх</h3>
                <div className="flex items-center space-x-3">
                    <input
                        type="text"
                        placeholder="Баркод оруулна уу..."
                        value={searchBarcode}
                        onChange={handleSearchBarcodeChange}
                        className="input-field border-2 rounded-md px-5 py-2 flex-grow"
                    />
                    <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="btn-primary whitespace-nowrap !px-4 !py-2 rounded-md bg-gradient-to-tr from-[#f7941e] to-[#003375] text-white hover:from-[#003375] hover:to-[#f7941e] transition-colors duration-200"
                    >
                        Хайх
                    </button>
                    <button
                        type="button"
                        onClick={fetchProducts} // Button to clear search and show all products
                        className="btn-secondary whitespace-nowrap !px-4 !py-2 rounded-md bg-[#003375] text-white hover:bg-[#f7941e] transition-colors duration-200"
                    >
                        Бүх бүтээгдэхүүнийг харуулах
                    </button>
                </div>
            </div>

            {/* Products List */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Бүтээгдэхүүний жагсаалт</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Зураг</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Нэр</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Баркод</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ангилал</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Үнэ</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">Бүтээгдэхүүн олдсонгүй.</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-900">{product.id}</td>
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {product.imagePath ? (
                                            <img src={product.imagePath} alt={product.name} className="w-16 h-16 object-contain rounded-md border" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded-md">Зураггүй</div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-900">{product.name}</td>
                                    <td className="py-3 px-4 text-sm text-gray-900">{product.barcode || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-900">{product.categoryID?.name || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-900">₮{product.price.toLocaleString('mn-MN')}</td>
                                    <td className="py-3 px-4 text-sm flex space-x-2">
                                        <button
                                            onClick={() => handleEditClick(product)}
                                            className="btn-secondary !px-3 !py-1 mt-5 text-xs rounded-md bg-[#003375] text-white hover:bg-blue-600 transition-colors duration-200"
                                        >
                                            Засах
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="btn-danger !px-3 !py-1 mt-5 text-xs rounded-md bg-red-500 text-white hover:bg-red-700 transition-colors duration-200"
                                        >
                                            Устгах
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};



export default ProductAdmin;