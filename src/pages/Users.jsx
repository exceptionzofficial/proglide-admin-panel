import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Store, Mail, Phone, User } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        axios.get('https://proglide-backend.vercel.app/api/users')
            .then(res => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 h-full bg-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Registered Users</h2>
                <div className="relative w-96">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name or Shop..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border-b-2 border-gray-200 focus:border-[rgb(157,71,10)] outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500 font-bold uppercase">Loading Database...</div>
            ) : (
                <div className="bg-white shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="p-5 text-xs font-bold uppercase tracking-wider">User Details</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider">Shop Info</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider">Contact</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider">Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <User size={48} className="text-gray-300" />
                                            <p className="text-lg font-bold">No users found</p>
                                            <p className="text-sm">Try adjusting your search</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={user._id || idx}
                                        className="border-b border-gray-100 hover:bg-orange-50 transition-colors group"
                                    >
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-600 font-bold group-hover:bg-[rgb(157,71,10)] group-hover:text-white transition-colors">
                                                    <User size={18} />
                                                </div>
                                                <span className="font-bold text-gray-800">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Store size={16} className="text-[rgb(157,71,10)]" />
                                                <span className="font-medium">{user.shopName || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600"><Mail size={12} /> {user.email}</div>
                                                <div className="flex items-center gap-2 text-gray-600"><Phone size={12} /> {user.phone}</div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="text-gray-400 font-mono">
                                                    Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                                </div>
                                                {user.lastLogin && (
                                                    <div className="text-green-600 font-semibold">
                                                        Last Login: {new Date(user.lastLogin).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Users;