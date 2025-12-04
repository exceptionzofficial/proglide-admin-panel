import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        if (email === adminEmail && password === adminPassword) {
            sessionStorage.setItem('isAuthenticated', 'true');
            // Store a dummy token or just rely on isAuthenticated for this simple logic
            sessionStorage.setItem('token', 'simple-auth-token');
            navigate('/');
        } else {
            setError('Invalid credentials. Access denied.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
            <div className="bg-white p-8 shadow-xl w-full max-w-md border-t-4 border-[rgb(157,71,10)]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Admin Panel</h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Secure Access</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 text-sm font-bold mb-6 border border-red-200 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Email Address</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-[rgb(157,71,10)] outline-none font-bold text-gray-700 transition-colors"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-[rgb(157,71,10)] outline-none font-bold text-gray-700 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[rgb(157,71,10)] text-white py-3 font-black uppercase tracking-wider hover:bg-black transition-colors shadow-lg"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
