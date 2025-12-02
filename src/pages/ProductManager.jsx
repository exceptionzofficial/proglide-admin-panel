import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Save, Trash2, Edit3, Grid, Smartphone, Maximize, Minimize2, List } from 'lucide-react';

const API_URL = 'https://proglide-backend.vercel.app/api/products';

// Helper to format text
const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace('Radius', '')
    .trim() + (key.toLowerCase().includes('radius') ? ' Radius' : '');
};

const ProductManager = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // View Mode State
  const [isExpandedView, setIsExpandedView] = useState(false);

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
  const [tagInput, setTagInput] = useState('');

  // Fetch Data
  useEffect(() => {
    setLoading(true);
    setSearchTerm('');
    axios.get(`${API_URL}?category=${category}`)
      .then(res => {
        setProducts(res.data);
        setTimeout(() => setLoading(false), 300);
      })
      .catch(err => setLoading(false));
  }, [category]);

  // --- HANDLERS ---

  const handleOpenModal = (product = null) => {
    setTagInput('');
    setIsExpandedView(false);
    if (product) {
      setEditingProduct(product);
      setFormData({
        category: product.category,
        compatibleDevices: product.compatibleDevices || '',
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

  // --- TAG LOGIC ---
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (!val) return;
      const currentTags = formData.compatibleDevices ? formData.compatibleDevices.split(',') : [];
      if (!currentTags.includes(val)) {
        const newTags = [...currentTags, val];
        setFormData(prev => ({ ...prev, compatibleDevices: newTags.join(',') }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = formData.compatibleDevices ? formData.compatibleDevices.split(',') : [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({ ...prev, compatibleDevices: newTags.join(',') }));
  };

  const filteredProducts = products.filter(p => JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-[#f3f4f6] p-4 md:p-6 page-transition">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b-2 border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[rgb(157,71,10)] w-2 h-8 block"></span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter">{category}</h2>
          </div>
          <p className="text-gray-500 font-medium ml-4 text-sm">Inventory Management System</p>
        </div>
        <div className="flex gap-0 shadow-sm w-full md:w-auto mt-4 md:mt-0">
          <div className="relative flex-1 md:w-64 lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 focus:border-[rgb(157,71,10)] focus:ring-1 focus:ring-[rgb(157,71,10)] outline-none text-sm font-semibold sharp-edges"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[rgb(157,71,10)] text-white px-5 py-2.5 font-bold uppercase text-xs tracking-wider hover:bg-black transition-colors flex items-center gap-2 sharp-edges"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center opacity-70">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-gray-300 border-t-[rgb(157,71,10)] mb-4 sharp-edges" />
          <p className="font-bold text-[rgb(157,71,10)] animate-pulse">LOADING...</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pb-20">
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
                <div className="p-3 border-b border-gray-100 bg-gray-50 group-hover:bg-[rgb(157,71,10)] group-hover:text-white transition-colors duration-300">
                  <div className="flex justify-between items-start">
                    <div className="overflow-hidden">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 block mb-0.5 truncate">
                        {(category === 'Battery' || category === 'Combo/Display') ? `${item.specs.brandName || category} - Model No` : (item.specs.brandName || category)}
                      </span>
                      <h3 className="text-lg font-black leading-none truncate" title={item.specs.originalDrawingModel || item.specs.baseModel || item.specs.modelNo}>
                        {item.specs.originalDrawingModel || item.specs.baseModel || item.specs.modelNo || "Unknown Model"}
                      </h3>
                    </div>
                    <Grid size={16} className="opacity-50 shrink-0 ml-1" />
                  </div>
                </div>
                <div className="p-3 flex-1">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-2 mb-3 pb-3 border-b border-gray-100">
                    {Object.entries(item.specs).map(([key, value]) => {
                      if (!value) return null;
                      const isUsedAsHeader = (key === 'originalDrawingModel') || (key === 'baseModel') || (key === 'modelNo' && (category === 'Battery' || category === 'Combo/Display'));
                      if (isUsedAsHeader || key === 'brandName') return null;
                      return (
                        <div key={key} className="flex flex-col overflow-hidden">
                          <span className="text-[9px] uppercase font-bold text-gray-400 truncate">{formatKey(key)}</span>
                          <span className="text-xs font-bold text-gray-900 truncate" title={value}>{value}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 text-[rgb(157,71,10)]">
                      <Smartphone size={12} />
                      <span className="text-[10px] font-bold uppercase">Compatibility</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                      {item.compatibleDevices ? item.compatibleDevices.split(',').join(', ') : "Universal"}
                    </p>
                  </div>
                </div>
                <div className="flex border-t border-gray-200">
                  <button onClick={() => handleOpenModal(item)} className="flex-1 py-2.5 text-[10px] font-bold uppercase text-gray-600 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1 border-r border-gray-200 sharp-edges">
                    <Edit3 size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="w-10 py-2.5 text-gray-400 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center sharp-edges">
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* EDIT/ADD MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] sharp-edges"
            >

              {/* MODAL HEADER */}
              <div className="bg-black text-white p-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-[rgb(157,71,10)] p-1">
                    {isExpandedView ? <List size={20} /> : <Maximize size={20} />}
                  </div>
                  <h3 className="font-bold text-xl uppercase tracking-wider">
                    {isExpandedView ? 'Device Manager' : (editingProduct ? 'Edit Specification' : 'New Entry')}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="hover:text-[rgb(157,71,10)] transition"><X size={24} /></button>
              </div>

              {/* 
                  MODAL CONTENT WRAPPER 
                  'flex-1' makes it take all remaining height.
                  'overflow-y-auto' enables scrolling on this container.
              */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white min-h-0">

                {isExpandedView ? (
                  /* === EXPANDED VIEW === */
                  <div className="flex flex-col h-full">

                    {/* Sub Header */}
                    <div className="bg-white p-3 border-b border-gray-200 flex justify-between items-center shrink-0 shadow-sm">
                      <span className="text-xs font-black text-gray-500 uppercase">
                        All Devices ({formData.compatibleDevices ? formData.compatibleDevices.split(',').filter(Boolean).length : 0})
                      </span>
                      <button onClick={() => setIsExpandedView(false)} className="text-[rgb(157,71,10)] font-bold text-xs uppercase hover:underline flex items-center">
                        <Minimize2 size={14} className="mr-1" /> Return to Form
                      </button>
                    </div>

                    {/* SCROLLABLE AREA (Expanded) */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50 min-h-0">
                      <div className="flex flex-wrap gap-2 content-start">
                        {formData.compatibleDevices && formData.compatibleDevices.split(',').filter(t => t.trim() !== '').map((tag, index) => (
                          <span key={index} className="inline-flex items-center bg-white border border-gray-300 shadow-sm text-black text-sm font-bold px-3 py-2 uppercase tracking-wide sharp-edges group hover:border-[rgb(157,71,10)] transition-colors">
                            {tag} <button type="button" onClick={() => removeTag(tag)} className="ml-3 text-gray-300 hover:text-red-600"><X size={14} /></button>
                          </span>
                        ))}
                      </div>

                      {(!formData.compatibleDevices || formData.compatibleDevices.length === 0) && (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 min-h-[150px]">
                          <Grid size={40} />
                          <span className="font-bold uppercase mt-2">No Devices Added</span>
                        </div>
                      )}
                    </div>

                    {/* INPUT AT BOTTOM */}
                    <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        autoFocus
                        className="w-full p-4 border-2 border-gray-300 focus:border-[rgb(157,71,10)] outline-none font-bold text-lg sharp-edges"
                        placeholder="Type device name & Press Enter..."
                      />
                    </div>
                  </div>
                ) : (

                  /* === NORMAL FORM VIEW === */
                  <div className="p-8">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {category === 'Screen Guard' && (
                        <>
                          <div className="md:col-span-2 p-4 bg-gray-50 border border-gray-200">
                            <label className="block text-xs font-black text-[rgb(157,71,10)] uppercase mb-2">Original Drawing (Master Model)</label>
                            <input name="originalDrawingModel" value={formData.specs.originalDrawingModel} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none font-bold sharp-edges" placeholder="e.g. Vivo Y20" autoFocus />
                          </div>
                          <div><label className="text-xs font-black text-gray-400 uppercase">Height (mm)</label><input type="number" name="height" value={formData.specs.height} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" /></div>
                          <div><label className="text-xs font-black text-gray-400 uppercase">Width (mm)</label><input type="number" name="width" value={formData.specs.width} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" /></div>

                          <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-2">
                            <span className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Corner Radius Settings</span>
                            {['radiusTopLeft', 'radiusTopRight', 'radiusBottomLeft', 'radiusBottomRight'].map(field => (
                              <div key={field}><label className="text-[10px] font-bold text-gray-400 uppercase">{formatKey(field)}</label><input type="number" name={field} value={formData.specs[field]} onChange={e => handleChange(e, true)} className="w-full p-2 border border-gray-300 focus:border-[rgb(157,71,10)] outline-none bg-gray-50 sharp-edges" /></div>
                            ))}
                          </div>
                        </>
                      )}

                      {(category === 'Phone Case' || category === 'CC Board' || category === 'Center Panel') && (
                        <>
                          <div className="md:col-span-2"><label className="block text-xs font-black text-[rgb(157,71,10)] uppercase mb-2">Base Model</label><input name="baseModel" value={formData.specs.baseModel} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges font-bold" placeholder="e.g. Samsung A50" autoFocus /></div>
                          {(category === 'CC Board' || category === 'Center Panel') && <div><label className="text-xs font-black text-gray-400 uppercase">Model No</label><input name="modelNo" value={formData.specs.modelNo} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" /></div>}
                        </>
                      )}

                      {(category === 'Combo/Display' || category === 'Battery') && (
                        <>
                          {category === 'Combo/Display' && <div><label className="text-xs font-black text-gray-400 uppercase">Brand Name</label><input name="brandName" value={formData.specs.brandName} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges" /></div>}
                          <div className={category === 'Battery' ? "md:col-span-2" : ""}><label className="text-xs font-black text-[rgb(157,71,10)] uppercase">Model Number</label><input name="modelNo" value={formData.specs.modelNo} onChange={e => handleChange(e, true)} className="w-full p-3 border border-gray-300 focus:border-black outline-none sharp-edges font-bold" autoFocus /></div>
                        </>
                      )}

                      {/* COMPATIBLE DEVICES (Mini View) */}
                      <div className="md:col-span-2 border-t-2 border-gray-100 pt-6 mt-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-black text-gray-400 uppercase">Compatible Devices</label>
                          {/* EXPAND BUTTON */}
                          <button
                            type="button"
                            onClick={() => setIsExpandedView(true)}
                            className="text-[10px] font-bold text-[rgb(157,71,10)] uppercase flex items-center hover:bg-black hover:text-white px-3 py-1 border border-gray-200 transition-colors"
                          >
                            <Maximize size={12} className="mr-1" /> Expand View
                          </button>
                        </div>

                        <div className="bg-gray-50 border border-gray-300 p-2 sharp-edges">
                          <div className="flex flex-wrap gap-2 mb-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {formData.compatibleDevices && formData.compatibleDevices.split(',').filter(t => t.trim() !== '').map((tag, index) => (
                              <span key={index} className="inline-flex items-center bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-wider sharp-edges">
                                {tag} <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-[rgb(157,71,10)]"><X size={12} /></button>
                              </span>
                            ))}
                          </div>
                          <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className="w-full bg-transparent outline-none text-sm font-semibold p-1" placeholder="Type device name & press Enter..." />
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* FOOTER (Fixed Height) */}
              <div className="p-5 bg-gray-100 border-t border-gray-200 flex justify-end gap-3 shrink-0 relative z-30">
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