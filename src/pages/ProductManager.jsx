import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Save, Trash2, Edit3, Grid, Smartphone, Maximize } from 'lucide-react';

const API_URL = 'https://proglide-backend.vercel.app/api/products';

// Helper to format text (e.g. "radiusTopLeft" -> "Top Left Radius")
const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before caps
    .replace(/^./, str => str.toUpperCase()) // Capitalize first
    .replace('Radius', '') // Remove word Radius to add it at end if needed
    .trim() + (key.toLowerCase().includes('radius') ? ' Radius' : '');
};

const ProductManager = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const initialFormState = {
    category,
    compatibleDevices: '',
    specs: {
      originalDrawingModel: '', height: '', width: '',
      radiusTopLeft: '', radiusTopRight: '', radiusBottomLeft: '', radiusBottomRight: '',
      baseModel: '', modelNo: '', brandName: ''
    }
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch Data when category changes
  useEffect(() => {
    setLoading(true);
    setSearchTerm(''); // Reset search
    axios.get(`${API_URL}?category=${category}`)
      .then(res => {
        setProducts(res.data);
        setTimeout(() => setLoading(false), 300); // Small delay for smooth animation
      })
      .catch(err => setLoading(false));
  }, [category]);

  // Handlers
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        category: product.category,
        compatibleDevices: product.compatibleDevices,
        specs: { ...initialFormState.specs, ...product.specs }
      });
    } else {
      setEditingProduct(null);
      setFormData({ ...initialFormState, category });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("CONFIRM DELETE: This action cannot be undone.")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        const res = await axios.put(`${API_URL}/${editingProduct._id}`, formData);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
      } else {
        const res = await axios.post(API_URL, formData);
        setProducts([res.data, ...products]);
      }
      setIsModalOpen(false);
    } catch (error) { console.error(error); }
  };

  const handleChange = (e, isSpec = false) => {
    const { name, value } = e.target;
    if (isSpec) setFormData(prev => ({ ...prev, specs: { ...prev.specs, [name]: value } }));
    else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredProducts = products.filter(p => JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-[#f3f4f6] p-6 page-transition">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[rgb(157,71,10)] w-2 h-8 block"></span>
            <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">{category}</h2>
          </div>
          <p className="text-gray-500 font-medium ml-4">Inventory Management System</p>
        </div>

        <div className="flex gap-0 shadow-sm w-full md:w-auto mt-4 md:mt-0">
          <div className="relative flex-1 md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search specifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 focus:border-[rgb(157,71,10)] focus:ring-1 focus:ring-[rgb(157,71,10)] outline-none text-sm font-semibold sharp-edges"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[rgb(157,71,10)] text-white px-6 py-3 font-bold uppercase text-sm tracking-wider hover:bg-black transition-colors flex items-center gap-2 sharp-edges"
          >
            <Plus size={18} /> Add New
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center opacity-70">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-gray-300 border-t-[rgb(157,71,10)] mb-4 sharp-edges" />
          <p className="font-bold text-[rgb(157,71,10)] animate-pulse">LOADING DATA...</p>
        </div>
      ) : (
        /* GRID LAYOUT */
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          <AnimatePresence>
            {filteredProducts.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={item._id}
                className="card-box bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:border-[rgb(157,71,10)] transition-all duration-300 group flex flex-col sharp-edges"
              >
                {/* CARD HEADER */}
                <div className="p-5 border-b border-gray-100 bg-gray-50 group-hover:bg-[rgb(157,71,10)] group-hover:text-white transition-colors duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 block mb-1">
                        {item.specs.brandName || category}
                      </span>
                      <h3 className="text-xl font-black leading-none">
                        {/* Logic for Title: Shows OriginalDrawing, Base Model, or Model No */}
                        {item.specs.originalDrawingModel || item.specs.baseModel || item.specs.modelNo || "Unknown Model"}
                      </h3>
                    </div>
                    <Grid size={20} className="opacity-50" />
                  </div>
                </div>

                {/* CARD BODY (SPECS GRID) */}
                <div className="p-5 flex-1">

                  {/* Highlighted Compatible Devices */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-1 text-[rgb(157,71,10)]">
                      <Smartphone size={14} />
                      <span className="text-xs font-bold uppercase">Compatibility</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 leading-snug">
                      {item.compatibleDevices || "Universal"}
                    </p>
                  </div>

                  {/* Dynamic Technical Specs Grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    {Object.entries(item.specs).map(([key, value]) => {
                      if (!value) return null;

                      // LOGIC UPDATE: 
                      // We check if this specific key is already being used as the Big Header Title.
                      // If it is, we hide it here to avoid duplication.
                      // For CC Board/Center Panel: 'baseModel' is the header, so 'modelNo' WILL show here.
                      const isUsedAsHeader =
                        (key === 'originalDrawingModel') ||
                        (key === 'baseModel') ||
                        // Only hide Model No if it's the ONLY title (like Battery/Combo)
                        (key === 'modelNo' && (category === 'Battery' || category === 'Combo/Display'));

                      if (isUsedAsHeader) return null;
                      if (key === 'brandName') return null; // Brand name is shown small at top

                      return (
                        <div key={key} className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400">{formatKey(key)}</span>
                          <span className="text-sm font-bold text-gray-900 truncate" title={value}>{value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* CARD FOOTER (ACTIONS) */}
                <div className="flex border-t border-gray-200">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 py-3 text-xs font-bold uppercase text-gray-600 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 border-r border-gray-200 sharp-edges"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="w-16 py-3 text-gray-400 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center sharp-edges"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* EDIT/ADD MODAL (Clean & Sharp) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] sharp-edges"
            >
              {/* Modal Header */}
              <div className="bg-black text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-[rgb(157,71,10)] p-1">
                    <Maximize size={20} />
                  </div>
                  <h3 className="font-bold text-xl uppercase tracking-wider">
                    {editingProduct ? 'Edit Specification' : 'New Entry'}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="hover:text-[rgb(157,71,10)] transition"><X size={24} /></button>
              </div>

              {/* Modal Form */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Common: Compatible Devices */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">Compatible Devices List</label>
                    <textarea
                      name="compatibleDevices"
                      rows="2"
                      value={formData.compatibleDevices}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-300 focus:border-[rgb(157,71,10)] focus:ring-1 focus:ring-[rgb(157,71,10)] outline-none font-medium sharp-edges"
                      placeholder="e.g. iPhone 13 Pro, Samsung S22, Pixel 6..."
                    />
                  </div>

                  {/* DYNAMIC FIELDS based on Category */}

                  {category === 'Screen Guard' && (
                    <>
                      <div className="md:col-span-2 p-4 bg-gray-50 border border-gray-200">
                        <label className="block text-xs font-black text-[rgb(157,71,10)] uppercase mb-2">Original Drawing (Master Model)</label>
                        <input name="originalDrawingModel" value={formData.specs.originalDrawingModel} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none font-bold sharp-edges" placeholder="Required" />
                      </div>

                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase">Height (mm)</label>
                        <input type="number" name="height" value={formData.specs.height} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase">Width (mm)</label>
                        <input type="number" name="width" value={formData.specs.width} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" />
                      </div>

                      <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-2">
                        <span className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Corner Radius Settings</span>
                        {['radiusTopLeft', 'radiusTopRight', 'radiusBottomLeft', 'radiusBottomRight'].map(field => (
                          <div key={field}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">{formatKey(field)}</label>
                            <input type="number" name={field} value={formData.specs[field]} onChange={e => handleChange(e, true)} className="w-full p-2 border border-gray-300 focus:border-[rgb(157,71,10)] outline-none bg-gray-50 sharp-edges" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {(category === 'Phone Case' || category === 'CC Board' || category === 'Center Panel') && (
                    <>
                      <div className="md:col-span-2"><label className="text-xs font-black text-gray-400 uppercase">Base Model</label><input name="baseModel" value={formData.specs.baseModel} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" /></div>
                      {(category === 'CC Board' || category === 'Center Panel') && <div><label className="text-xs font-black text-gray-400 uppercase">Model No</label><input name="modelNo" value={formData.specs.modelNo} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" /></div>}
                    </>
                  )}

                  {(category === 'Combo/Display' || category === 'Battery') && (
                    <>
                      {category === 'Combo/Display' && <div><label className="text-xs font-black text-gray-400 uppercase">Brand Name</label><input name="brandName" value={formData.specs.brandName} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" /></div>}
                      <div><label className="text-xs font-black text-gray-400 uppercase">Model Number</label><input name="modelNo" value={formData.specs.modelNo} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" /></div>
                    </>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-5 bg-gray-100 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold uppercase text-gray-500 hover:bg-gray-200 transition text-sm sharp-edges">Cancel</button>
                <button onClick={handleSave} className="bg-[rgb(157,71,10)] text-white px-8 py-3 font-bold uppercase text-sm hover:bg-black transition flex items-center shadow-lg sharp-edges">
                  <Save size={16} className="mr-2" /> Save Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManager;