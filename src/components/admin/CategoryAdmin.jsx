import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryAdmin = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategorySortID, setNewCategorySortID] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    const API_URL = 'http://localhost:8080/api/category';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setCategories(response.data);
            setLoading(false);
        } catch (err) {
            setError('Ангилал татахад алдаа гарлаа: ' + err.message);
            setLoading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const response = await axios.post(API_URL, {
                name: newCategoryName,
                sortID: parseInt(newCategorySortID) || 0
            });
            setCategories([...categories, response.data]);
            setNewCategoryName('');
            setNewCategorySortID('');
        } catch (err) {
            setError('Ангилал нэмэхэд алдаа гарлаа: ' + err.message);
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editingCategory || !editingCategory.name.trim()) return;
        try {
            const response = await axios.put(`${API_URL}/${editingCategory.id}`, {
                id: editingCategory.id,
                name: editingCategory.name,
                sortID: parseInt(editingCategory.sortID) || 0
            });
            setCategories(categories.map(cat =>
                cat.id === editingCategory.id ? response.data : cat
            ));
            setEditingCategory(null);
        } catch (err) {
            setError('Ангилал шинэчлэхэд алдаа гарлаа: ' + err.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Энэ ангилалыг устгахдаа итгэлтэй байна уу?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            setCategories(categories.filter(cat => cat.id !== id));
        } catch (err) {
            setError('Ангилал устгахад алдаа гарлаа: ' + err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10">
            <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
                <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
                    Ангилал нэмэх
                </h2>
                <form
                    onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
                >
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                        <input
                            type="text"
                            id="categoryName"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingCategory ? editingCategory.name : newCategoryName}
                            onChange={e =>
                                editingCategory
                                    ? setEditingCategory({ ...editingCategory, name: e.target.value })
                                    : setNewCategoryName(e.target.value)
                            }
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="categorySortID" className="block text-sm font-medium text-gray-700 mb-1">Эрэмбэлэх ID</label>
                        <input
                            type="number"
                            id="categorySortID"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingCategory ? editingCategory.sortID : newCategorySortID}
                            onChange={e =>
                                editingCategory
                                    ? setEditingCategory({ ...editingCategory, sortID: e.target.value })
                                    : setNewCategorySortID(e.target.value)
                            }
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-200"
                        >
                            {editingCategory ? 'Хадгалах' : 'Нэмэх'}
                        </button>
                        {editingCategory && (
                            <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg transition duration-200"
                            >
                                Цуцлах
                            </button>
                        )}
                    </div>
                </form>
                {error && <p className="mt-4 text-red-500">{error}</p>}
            </div>

            <div className="bg-white shadow-lg rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Ангилалын жагсаалт</h3>
                {loading ? (
                    <p className="text-center text-gray-500">Ангилал ачаалж байна...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 rounded-lg">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700 border-b">ID</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700 border-b">Нэр</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700 border-b">Эрэмбэлэх ID</th>
                                    <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700 border-b">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-500">Ангилал олдсонгүй.</td>
                                    </tr>
                                ) : (
                                    categories.map(category => (
                                        <tr key={category.id} className="hover:bg-blue-50 border-b">
                                            <td className="py-3 px-4 text-sm text-gray-800">{category.id}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{category.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{category.sortID}</td>
                                            <td className="py-3 px-4 text-sm flex gap-2">
                                                <button
                                                    onClick={() => setEditingCategory({ ...category })}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-4 rounded-lg text-xs transition duration-200"
                                                >
                                                    Засах
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded-lg text-xs transition duration-200"
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
                )}
            </div>
        </div>
    );
};

export default CategoryAdmin;