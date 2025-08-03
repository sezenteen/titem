// src/components/admin/UserAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '', // Be careful with passwords on the frontend!
        roles: ['USER'] // Default role
    });
    const [editingUser, setEditingUser] = useState(null);

    // Consider using an environment variable for API_URL in a real application
    const API_URL = 'http://localhost:8080/api/admin/user'; 

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            const response = await axios.get(API_URL);
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Хэрэглэгч татахад алдаа гарлаа: ' + (err.response?.data?.message || err.message));
            setLoading(false);
            console.error("Failed to fetch users:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editingUser) {
            setEditingUser({ ...editingUser, [name]: value });
        } else {
            setNewUser({ ...newUser, [name]: value });
        }
    };

    const handleRoleChange = (e) => {
        const { value, checked } = e.target;
        if (editingUser) {
            setEditingUser(prev => ({
                ...prev,
                roles: checked ? [...prev.roles, value] : prev.roles.filter(role => role !== value)
            }));
        } else {
            setNewUser(prev => ({
                ...prev,
                roles: checked ? [...prev.roles, value] : prev.roles.filter(role => role !== value)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        let payload = {};
        let url;
        let method;

        if (editingUser) {
            // For editing, only send password if it's explicitly changed (not empty)
            payload = { 
                name: editingUser.name,
                email: editingUser.email,
                roles: editingUser.roles
            };
            if (editingUser.password) { // Only include password if it's not empty
                payload.password = editingUser.password;
            }
            url = `${API_URL}/${editingUser.id}`;
            method = 'put';
        } else {
            payload = newUser;
            url = API_URL;
            method = 'post';
        }

        try {
            let response;
            if (method === 'post') {
                response = await axios.post(url, payload);
            } else { // method === 'put'
                response = await axios.put(url, payload);
            }
            
            if (editingUser) {
                setUsers(users.map(user => user.id === response.data.id ? response.data : user));
                setEditingUser(null);
            } else {
                setUsers([...users, response.data]);
                setNewUser({ name: '', email: '', password: '', roles: ['USER'] }); // Reset form
            }
        } catch (err) {
            setError('Хэрэглэгч хадгалахад алдаа гарлаа: ' + (err.response?.data?.message || err.message));
            console.error("Failed to save user:", err);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?')) return;
        setError(null); // Clear previous errors
        try {
            await axios.delete(`${API_URL}/${id}`);
            setUsers(users.filter(user => user.id !== id));
        } catch (err) {
            setError('Хэрэглэгч устгахад алдаа гарлаа: ' + (err.response?.data?.message || err.message));
            console.error("Failed to delete user:", err);
        }
    };

    if (loading) return <p className="text-center">Хэрэглэгч ачаалж байна...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    const currentUser = editingUser || newUser; // For form binding

    return (
        <div>
            {/* Create/Edit Form */}
            <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-4">{editingUser ? 'Хэрэглэгч засах' : 'Шинэ хэрэглэгч нэмэх'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Хэрэглэгчийн нэр:</label>
                        <input type="text" id="name" name="name" value={currentUser.name} onChange={handleChange} className="input-field border-2 p-2 rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Имэйл:</label>
                        <input type="email" id="email" name="email" value={currentUser.email} onChange={handleChange} className="input-field border-2 p-2 rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Нууц үг:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={currentUser.password}
                            onChange={handleChange}
                            className="input-field border-2 p-2 rounded-md"
                            // Only require password on creation or if explicitly changed for edit
                            required={!editingUser}
                        />
                        {editingUser && <p className="text-xs text-gray-500 mt-1">Нууц үг өөрчлөхгүй бол хоосон орхино уу.</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Үүрэг:</label>
                        <div className="mt-1 flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    value="USER"
                                    checked={currentUser.roles.includes('USER')}
                                    onChange={handleRoleChange}
                                    className="form-checkbox"
                                />
                                <span className="ml-2 text-gray-700">Хэрэглэгч</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    value="ADMIN"
                                    checked={currentUser.roles.includes('ADMIN')}
                                    onChange={handleRoleChange}
                                    className="form-checkbox"
                                />
                                <span className="ml-2 text-gray-700">Админ</span>
                            </label>
                            {/* Add more roles if needed */}
                        </div>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                    >
                        {editingUser ? 'Хадгалах' : 'Нэмэх'}
                    </button>
                    {editingUser && (
                        <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                        >
                            Цуцлах
                        </button>
                    )}
                </div>
            </form>

            {/* Users List */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 border-b">ID</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 border-b">Хэрэглэгчийн нэр</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 border-b">Имэйл</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 border-b">Үүрэг</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 border-b">Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500">Хэрэглэгч олдсонгүй.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 border-b">
                                    <td className="py-3 px-4 text-sm text-gray-800">{user.id}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{user.name}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{user.email}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{user.roles ? user.roles.join(', ') : 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm flex space-x-2">
                                        <button
                                            onClick={() => setEditingUser({ ...user, password: '' })} // Don't pre-fill password for security
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-xs transition duration-200"
                                        >
                                            Засах
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-xs transition duration-200"
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

export default UserAdmin;