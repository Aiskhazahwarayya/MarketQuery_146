import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  
  const [formData, setFormData] = useState({
    nama_barang: '',
    harga: '',
    stok: '',
    kategori: '',
    deskripsi: '',
    gambar: null  
  });

  const [imagePreview, setImagePreview] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3009/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, gambar: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nama_barang', formData.nama_barang);
      formDataToSend.append('harga', formData.harga);
      formDataToSend.append('stok', formData.stok);
      formDataToSend.append('kategori', formData.kategori);
      formDataToSend.append('deskripsi', formData.deskripsi);
      
      if (formData.gambar) {
        formDataToSend.append('gambar', formData.gambar);
      }

      const res = await fetch('http://localhost:3009/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Product created successfully!');
        fetchProducts();
        closeModal();
      } else {
        alert(data.message || 'Failed to create product');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error creating product');
    }
  };

  const handleUpdate = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nama_barang', formData.nama_barang);
      formDataToSend.append('harga', formData.harga);
      formDataToSend.append('stok', formData.stok);
      formDataToSend.append('kategori', formData.kategori);
      formDataToSend.append('deskripsi', formData.deskripsi);

      if (formData.gambar instanceof File) {
        formDataToSend.append('gambar', formData.gambar);
      } 
      else if (formData.gambar === null) {
        formDataToSend.append('delete_image', 'true');
      }

      const res = await fetch(`http://localhost:3009/api/products/${editingProduct.ID_Product}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Product updated successfully!');
        fetchProducts();
        closeModal();
      } else {
        alert(data.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error updating product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`http://localhost:3009/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Product deleted successfully!');
        fetchProducts();
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ 
      nama_barang: '', 
      harga: '', 
      stok: '', 
      kategori: '',
      deskripsi: '',
      gambar: null
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setFormData({
      nama_barang: product.nama_barang,
      harga: product.harga,
      stok: product.stok,
      kategori: product.kategori,
      deskripsi: product.deskripsi || '',
      gambar: product.gambar || null  
    });
    if (product.gambar) {
      setImagePreview(getImageUrl(product.gambar));
    } else {
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ 
      nama_barang: '', 
      harga: '', 
      stok: '', 
      kategori: '',
      deskripsi: '',
      gambar: null
    });
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (!formData.nama_barang || !formData.harga || !formData.stok || !formData.kategori) {
      alert('Please fill all required fields!');
      return;
    }
    if (modalMode === 'create') {
      handleCreate();
    } else {
      handleUpdate();
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.kategori))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nama_barang.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:3009/uploads/${imagePath}`;
  };

  const openZoomModal = (product) => {
    setSelectedProduct(product);
    setZoomedImage(getImageUrl(product.gambar));
    setZoomLevel(1);
    setShowZoomModal(true);
  };

  const closeZoomModal = () => {
    setShowZoomModal(false);
    setZoomedImage(null);
    setSelectedProduct(null);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-28 px-4 md:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Product Catalog
            </h1>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-3xl"
            >
              📦
            </motion.div>
          </div>
          <p className="text-gray-400 text-lg">
            Browse our collection of {products.length} products
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCreateModal}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </motion.button>
            )}

            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 text-gray-400 text-sm">
            Showing <span className="text-white font-bold">{filteredProducts.length}</span> of <span className="text-white font-bold">{products.length}</span> products
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  📭
                </motion.div>
                <h3 className="text-white text-2xl font-bold mb-2">No Products Found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </motion.div>
            ) : (
              <>
                {viewMode === 'grid' && (
                  <motion.div
                    key="grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.ID_Product}
                        variants={itemVariants}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300" />
                        
                        {product.gambar ? (
                          <div 
                            className="relative h-48 overflow-hidden cursor-zoom-in"
                            onClick={() => openZoomModal(product)}
                          >
                            <img 
                              src={getImageUrl(product.gambar)} 
                              alt={product.nama_barang}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                            
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                </svg>
                              </div>
                            </div>
                            
                            <span className="absolute top-3 left-3 text-xs font-bold uppercase px-2 py-1 bg-purple-500/80 backdrop-blur-sm text-white rounded-lg border border-purple-400/30">
                              {product.kategori}
                            </span>
                          </div>
                        ) : (
                          <div className="relative h-48 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 15 }}
                              className="text-6xl"
                            >
                              📦
                            </motion.div>
                            <span className="absolute top-3 left-3 text-xs font-bold uppercase px-2 py-1 bg-purple-500/80 backdrop-blur-sm text-white rounded-lg border border-purple-400/30">
                              {product.kategori}
                            </span>
                          </div>
                        )}
                        
                        <div className="relative z-10 p-6">
                          <h3 className="text-white font-bold text-xl mb-2 group-hover:text-purple-300 transition-colors line-clamp-1">
                            {product.nama_barang}
                          </h3>

                          {product.deskripsi && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                              {product.deskripsi}
                            </p>
                          )}

                          <div className="mb-4">
                            <div className="text-xs text-gray-500 mb-1">Price</div>
                            <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              Rp {Number(product.harga).toLocaleString('id-ID')}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                product.stok > 10 ? 'bg-green-400' : product.stok > 0 ? 'bg-yellow-400' : 'bg-red-400'
                              } animate-pulse`} />
                              <span className="text-gray-400 text-sm">
                                Stock: <span className="text-white font-bold">{product.stok}</span>
                              </span>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openEditModal(product)}
                                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(product.ID_Product)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {viewMode === 'list' && (
                  <motion.div
                    key="list"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.ID_Product}
                        variants={itemVariants}
                        whileHover={{ x: 5 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-6 flex-1">
                            {product.gambar ? (
                              <img 
                                src={getImageUrl(product.gambar)} 
                                alt={product.nama_barang}
                                className="w-20 h-20 rounded-xl object-cover cursor-zoom-in hover:opacity-80 transition-opacity"
                                onClick={() => openZoomModal(product)}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                                📦
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold text-lg mb-1">{product.nama_barang}</h3>
                              {product.deskripsi && (
                                <p className="text-gray-400 text-sm mb-2 line-clamp-1">
                                  {product.deskripsi}
                                </p>
                              )}
                              <span className="text-xs font-bold uppercase px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                                {product.kategori}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                              Rp {Number(product.harga).toLocaleString('id-ID')}
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <div className={`w-2 h-2 rounded-full ${
                                product.stok > 10 ? 'bg-green-400' : product.stok > 0 ? 'bg-yellow-400' : 'bg-red-400'
                              } animate-pulse`} />
                              <span className="text-gray-400 text-sm">
                                Stock: <span className="text-white font-bold">{product.stok}</span>
                              </span>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-2 flex-shrink-0">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openEditModal(product)}
                                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all font-medium text-sm"
                              >
                                Edit
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(product.ID_Product)}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-all font-medium text-sm"
                              >
                                Delete
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl my-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black text-white">
                      {modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Product Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nama_barang}
                      onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all resize-none"
                      placeholder="Enter product description"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Product Image
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all"
                      />
                      {imagePreview && (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-40 object-cover rounded-xl border border-white/10"
                          />
                          <button
                            onClick={() => {
                              setImagePreview(null);
                              setFormData({ ...formData, gambar: null });
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Price (Rp) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.harga}
                        onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Stock <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.stok}
                        onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all"
                      placeholder="Enter category"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-bold transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-bold shadow-lg shadow-purple-500/30 transition-all"
                  >
                    {modalMode === 'create' ? 'Create Product' : 'Update Product'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showZoomModal && zoomedImage && selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeZoomModal}
              className="fixed inset-0 backdrop-blur-xl z-[100]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-8"
            >
              <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                
                <div className="md:w-1/2 relative bg-black/50 flex items-center justify-center p-4 overflow-auto">
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomOut}
                      className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg transition-all"
                      title="Zoom Out"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleResetZoom}
                      className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg transition-all"
                      title="Reset Zoom"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleZoomIn}
                      className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg transition-all"
                      title="Zoom In"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </motion.button>
                  </div>

                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg z-10">
                    <span className="text-white font-bold text-sm">{Math.round(zoomLevel * 100)}%</span>
                  </div>

                  <motion.img
                    src={zoomedImage}
                    alt={selectedProduct.nama_barang}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s ease-out'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600x600?text=Image+Not+Found';
                    }}
                  />
                </div>

                <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
                  <div className="flex justify-end mb-4">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closeZoomModal}
                      className="p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-xl border border-red-400/30 rounded-xl transition-all"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  <div className="space-y-6">
                    <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold uppercase border border-purple-500/30">
                      {selectedProduct.kategori}
                    </span>

                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                      {selectedProduct.nama_barang}
                    </h2>

                    {selectedProduct.deskripsi && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Description</h3>
                        <p className="text-gray-300 leading-relaxed">
                          {selectedProduct.deskripsi}
                        </p>
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
                      <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Price</p>
                      <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Rp {Number(selectedProduct.harga).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Stock</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedProduct.stok > 10 ? 'bg-green-400' : selectedProduct.stok > 0 ? 'bg-yellow-400' : 'bg-red-400'
                          } animate-pulse`} />
                          <p className="text-white font-bold text-2xl">{selectedProduct.stok}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Product ID</p>
                        <p className="text-white font-bold text-2xl">#{selectedProduct.ID_Product}</p>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            closeZoomModal();
                            openEditModal(selectedProduct);
                          }}
                          className="flex-1 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Product
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            closeZoomModal();
                            handleDelete(selectedProduct.ID_Product);
                          }}
                          className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Product
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;