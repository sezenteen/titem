import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/category');
                setCategories(response.data);
                setLoading(false);
            } catch (err) {
                setError('Категориудыг татаж авахад алдаа гарлаа: ' + err.message);
                setLoading(false);
                console.error("Failed to fetch categories:", err);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return <p className="text-center py-4">Категориудыг татаж байна...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 py-4">Алдаа: {error}</p>;
    }

    return (
        <div className="flex overflow-x-auto gap-4 md:gap-8 py-2 scrollbar-hide whitespace-nowrap w-full">
            {categories.length > 0 ? (
                categories.map((category) => (
                    // Link to the dynamic category page
                    // Using encodeURIComponent for safety in URLs with special characters
                    <a
                        key={category.id}
                        href={`/category/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="flex-shrink-0 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer text-sm font-medium text-gray-800"
                    >
                        {category.name || 'Үл мэдэгдэх ангилал'}
                    </a>
                ))
            ) : (
                <p className="text-center text-gray-600">Одоогоор ангилал байхгүй байна.</p>
            )}
        </div>
    );
};

export default CategoryList;