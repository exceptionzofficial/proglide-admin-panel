import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Store, Mail, Phone, User, CreditCard, Crown, Shield, Clock, Calendar, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = 'https://proglide-backend.vercel.app/api';


// ─── Users Tab (existing) ───────────────────────────────────────────
const UsersTab = ({ users, searchTerm }) => {
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
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
    );
};

// ─── Helper: Status Badge ───────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const config = {
        active: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active', dot: 'bg-emerald-500' },
        expired: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Expired', dot: 'bg-red-500' },
        none: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', label: 'Free', dot: 'bg-gray-400' },
    };
    const c = config[status] || config.none;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${c.bg} ${c.text} ${c.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`}></span>
            {c.label}
        </span>
    );
};

// ─── Helper: Plan Badge ─────────────────────────────────────────────
const PlanBadge = ({ planType }) => {
    if (planType === 'Premium') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-sm">
                <Crown size={12} />
                Premium
            </span>
        );
    }
    if (planType === 'Pro') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-sm">
                <Shield size={12} />
                Pro
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wide rounded-full border border-gray-200">
            <User size={12} />
            Free
        </span>
    );
};

// ─── Helper: Days Remaining ─────────────────────────────────────────
const getDaysRemaining = (expiresDate) => {
    if (!expiresDate) return null;
    const diff = new Date(expiresDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
};

// ─── Subscriptions Tab ──────────────────────────────────────────────
const SubscriptionsTab = ({ data, loading, error, searchTerm, onRefresh }) => {
    const [expandedUser, setExpandedUser] = useState(null);

    const filtered = data.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.subscription?.planType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const activeCount = data.filter(u => u.subscription?.status === 'active').length;
    const expiredCount = data.filter(u => u.subscription?.status === 'expired').length;
    const freeCount = data.filter(u => !u.subscription || u.subscription.status === 'none').length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <RefreshCw size={32} className="text-[rgb(157,71,10)] animate-spin" />
                <p className="text-gray-500 font-bold uppercase tracking-wide text-sm">Fetching subscription data from RevenueCat...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <AlertCircle size={48} className="text-red-400" />
                <p className="text-red-500 font-bold text-lg">Failed to load subscriptions</p>
                <p className="text-gray-400 text-sm">{error}</p>
                <button onClick={onRefresh} className="mt-2 px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wide hover:bg-[rgb(157,71,10)] transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 shadow-lg border-l-4 border-emerald-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Subscribers</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{activeCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 flex items-center justify-center">
                            <CreditCard size={24} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 shadow-lg border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Expired</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{expiredCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 flex items-center justify-center">
                            <Clock size={24} className="text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 shadow-lg border-l-4 border-gray-400">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Free Users</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{freeCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                            <User size={24} className="text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">User</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">Plan</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">Status</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">Product ID</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">Purchase Date</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">Expiry / Remaining</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">History</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-10 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <CreditCard size={48} className="text-gray-300" />
                                        <p className="text-lg font-bold">No subscription data found</p>
                                        <p className="text-sm">Try adjusting your search</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((user, idx) => {
                                const sub = user.subscription;
                                const days = sub?.expiresDate ? getDaysRemaining(sub.expiresDate) : null;
                                const isExpanded = expandedUser === user._id;
                                const allSubs = sub?.allSubscriptions || [];
                                const hasHistory = allSubs.length > 0 || (sub?.activeEntitlements?.length > 0);

                                return (
                                    <React.Fragment key={user._id || idx}>
                                        <motion.tr
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className={`border-b border-gray-100 hover:bg-orange-50 transition-colors group cursor-pointer ${isExpanded ? 'bg-orange-50' : ''}`}
                                            onClick={() => setExpandedUser(isExpanded ? null : user._id)}
                                        >
                                            {/* User */}
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-600 font-bold group-hover:bg-[rgb(157,71,10)] group-hover:text-white transition-colors">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-800 block">{user.name}</span>
                                                        <span className="text-xs text-gray-400">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Plan */}
                                            <td className="p-5">
                                                <PlanBadge planType={sub?.planType || 'Free'} />
                                            </td>

                                            {/* Status */}
                                            <td className="p-5">
                                                <StatusBadge status={sub?.status || 'none'} />
                                                {user.rcStatus && (
                                                    <span className="block mt-1 text-[10px] text-red-400 font-mono">RC: {user.rcStatus}</span>
                                                )}
                                            </td>

                                            {/* Product ID */}
                                            <td className="p-5">
                                                {sub?.productId ? (
                                                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 text-gray-600 rounded">
                                                        {sub.productId}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">{'\u2014'}</span>
                                                )}
                                            </td>

                                            {/* Purchase Date */}
                                            <td className="p-5">
                                                {sub?.purchaseDate ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                        <Calendar size={12} className="text-[rgb(157,71,10)]" />
                                                        {new Date(sub.purchaseDate).toLocaleDateString()}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-300">{'\u2014'}</span>
                                                )}
                                            </td>

                                            {/* Expiry / Remaining */}
                                            <td className="p-5">
                                                {sub?.expiresDate ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <Clock size={12} />
                                                            {new Date(sub.expiresDate).toLocaleDateString()}
                                                        </div>
                                                        {days !== null && (
                                                            <span className={`text-xs font-bold ${days > 7 ? 'text-emerald-600' : days > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                                                                {days > 0 ? `${days} days left` : 'Expired'}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-300">{'\u2014'}</span>
                                                )}
                                            </td>

                                            {/* History Toggle */}
                                            <td className="p-5">
                                                {hasHistory ? (
                                                    <div className="flex items-center gap-1 text-xs text-[rgb(157,71,10)] font-bold">
                                                        <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                        {allSubs.length} sub{allSubs.length !== 1 ? 's' : ''}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-300">{'\u2014'}</span>
                                                )}
                                            </td>
                                        </motion.tr>

                                        {/* Expanded History */}
                                        {isExpanded && hasHistory && (
                                            <tr>
                                                <td colSpan="7" className="p-0">
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="bg-gray-50 border-b-2 border-[rgb(157,71,10)] px-8 py-5"
                                                    >
                                                        {/* RC Info */}
                                                        {sub?.originalAppUserId && (
                                                            <div className="mb-3 text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
                                                                <span><span className="font-bold">RC User ID:</span> <span className="font-mono">{sub.originalAppUserId}</span></span>
                                                                {sub.firstSeen && (
                                                                    <span><span className="font-bold">First Seen:</span> {new Date(sub.firstSeen).toLocaleDateString()}</span>
                                                                )}
                                                                {sub.lastSeen && (
                                                                    <span><span className="font-bold">Last Seen:</span> {new Date(sub.lastSeen).toLocaleDateString()}</span>
                                                                )}
                                                                {sub.lastSeenPlatform && (
                                                                    <span><span className="font-bold">Platform:</span> {sub.lastSeenPlatform}</span>
                                                                )}
                                                                {sub.lastSeenCountry && (
                                                                    <span><span className="font-bold">Country:</span> {sub.lastSeenCountry}</span>
                                                                )}
                                                                {sub.lastSeenAppVersion && (
                                                                    <span><span className="font-bold">App Version:</span> {sub.lastSeenAppVersion}</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* All Subscriptions */}
                                                        {allSubs.length > 0 && (
                                                            <div className="mb-4">
                                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">All Subscription Records</h4>
                                                                <div className="grid gap-2">
                                                                    {allSubs.map((s, i) => (
                                                                        <div key={i} className={`flex flex-wrap items-center gap-3 p-3 rounded text-xs ${s.isActive ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-gray-200'}`}>
                                                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.isActive ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                                                                            <span className="font-mono font-bold text-gray-700">{s.productId}</span>
                                                                            {s.entitlementName && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">{s.entitlementName}</span>}
                                                                            <span className="text-gray-400">|</span>
                                                                            <span className="text-gray-600">Start: {s.purchaseDate ? new Date(s.purchaseDate).toLocaleDateString() : '\u2014'}</span>
                                                                            <span className="text-gray-400">{'\u2192'}</span>
                                                                            <span className="text-gray-600">Expires: {s.expiresDate ? new Date(s.expiresDate).toLocaleDateString() : '\u2014'}</span>
                                                                            <span className="text-gray-400">|</span>
                                                                            <span className={`font-bold ${s.status === 'active' ? 'text-emerald-600' : 'text-red-500'}`}>{s.status}</span>
                                                                            <span className="text-gray-400">|</span>
                                                                            <span className="text-gray-500">{s.store || '\u2014'}</span>
                                                                            {s.autoRenewal && <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.autoRenewal === 'will_renew' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{s.autoRenewal === 'will_renew' ? 'AUTO-RENEW' : 'NO RENEW'}</span>}
                                                                            {s.isSandbox && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold">SANDBOX</span>}
                                                                            {s.revenueUsd && <span className="text-gray-500">Revenue: ${s.revenueUsd.gross?.toFixed(2)}</span>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Active Entitlements */}
                                                        {sub?.activeEntitlements?.length > 0 && (
                                                            <div>
                                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Active Entitlements</h4>
                                                                <div className="grid gap-2">
                                                                    {sub.activeEntitlements.map((e, i) => (
                                                                        <div key={i} className="flex items-center gap-4 p-3 rounded text-xs bg-emerald-50 border border-emerald-200">
                                                                            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-500"></span>
                                                                            <span className="font-bold text-gray-700">{e.id}</span>
                                                                            <span className="text-gray-400">|</span>
                                                                            <span className="text-gray-600">Expires: {e.expiresDate ? new Date(e.expiresDate).toLocaleDateString() : 'N/A'}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Main Users Page ────────────────────────────────────────────────
const Users = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [subData, setSubData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subLoading, setSubLoading] = useState(false);
    const [subError, setSubError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch users on mount
    useEffect(() => {
        axios.get(`${API_BASE}/users`)
            .then(res => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Fetch subscription data when switching to subscriptions tab
    const fetchSubscriptions = () => {
        setSubLoading(true);
        setSubError(null);
        axios.get(`${API_BASE}/users/subscriptions`)
            .then(res => {
                setSubData(res.data);
                setSubLoading(false);
            })
            .catch(err => {
                setSubError(err.response?.data?.error || err.message);
                setSubLoading(false);
            });
    };

    useEffect(() => {
        if (activeTab === 'subscriptions' && subData.length === 0) {
            fetchSubscriptions();
        }
    }, [activeTab]);

    const tabs = [
        { id: 'users', label: 'Users', icon: User, count: users.length },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subData.filter(u => u.subscription?.status === 'active').length },
    ];

    return (
        <div className="p-8 h-full bg-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
                    {activeTab === 'users' ? 'Registered Users' : 'Subscriptions'}
                </h2>
                <div className="flex items-center gap-4">
                    {activeTab === 'subscriptions' && (
                        <button
                            onClick={fetchSubscriptions}
                            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wide hover:bg-[rgb(157,71,10)] transition-colors"
                        >
                            <RefreshCw size={14} className={subLoading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    )}
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={activeTab === 'users' ? "Search by Name or Shop..." : "Search by Name, Shop or Plan..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border-b-2 border-gray-200 focus:border-[rgb(157,71,10)] outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 mb-6 bg-white shadow-sm">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                            className={`relative flex items-center gap-2.5 px-8 py-4 text-sm font-bold uppercase tracking-wide transition-all duration-200
                                ${isActive
                                    ? 'text-[rgb(157,71,10)] bg-orange-50/60'
                                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 text-[10px] font-black rounded-full
                                    ${isActive ? 'bg-[rgb(157,71,10)] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(157,71,10)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading && activeTab === 'users' ? (
                <div className="text-center py-20 text-gray-500 font-bold uppercase">Loading Database...</div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'users' ? (
                            <UsersTab users={users} searchTerm={searchTerm} />
                        ) : (
                            <SubscriptionsTab
                                data={subData}
                                loading={subLoading}
                                error={subError}
                                searchTerm={searchTerm}
                                onRefresh={fetchSubscriptions}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default Users;