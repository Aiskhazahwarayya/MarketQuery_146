import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UserAPIExplorer = ({ apiKey, onLoadSuccess }) => {
  const [testApiKey, setTestApiKey] = useState('');
  const [loadedProducts, setLoadedProducts] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState('');
  const [showJSON, setShowJSON] = useState(false);
  const [rawResponse, setRawResponse] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    if (apiKey) {
      setTestApiKey(apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (loadedProducts.length > 0) {
      const uniqueCategories = ['All', ...new Set(loadedProducts.map(p => p.kategori))];
      setCategories(uniqueCategories);
    }
  }, [loadedProducts]);

  const handleLoadData = async () => {
    if (!testApiKey) {
      setTestError('API Key belum tersedia.');
      return;
    }

    setTestLoading(true);
    setTestError('');
    setLoadedProducts([]);
    setRawResponse(null);
    setResponseStatus(null);

    try {
      const res = await fetch('http://localhost:3009/api/products/external/all', {
        method: 'GET',
        headers: { 'x-api-key': testApiKey }
      });

      const data = await res.json();
      setRawResponse(data);
      setResponseStatus(res.status);
      
      if (data.success && data.data) {
        setLoadedProducts(data.data);
        if (onLoadSuccess) {
          onLoadSuccess();
        }
      } else {
        setTestError('Gagal memuat data: ' + (data.message || 'Invalid API Key'));
      }
    } catch (err) {
      setTestError('Request gagal: ' + err.message);
    } finally {
      setTestLoading(false);
    }
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
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

  const filteredProducts = loadedProducts.filter(product => {
    const matchesSearch = product.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3009/uploads/${imagePath}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white text-2xl font-black">Simulator Aplikasi Produk</h3>
        <p className="text-gray-400 text-sm">Test your API integration here</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <input
              type="text"
              value={testApiKey}
              onChange={(e) => setTestApiKey(e.target.value)}
              placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none font-mono text-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoadData}
            disabled={testLoading}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-2xl text-white font-bold shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {testLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Loading...
              </>
            ) : (
              'Load Data'
            )}
          </motion.button>
        </div>

        {rawResponse && (
          <div className="text-center">
            <button
              onClick={() => setShowJSON(!showJSON)}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-2 mx-auto transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {showJSON ? 'Sembunyikan' : 'Lihat'} Data Mentah (JSON)
            </button>
          </div>
        )}

        <AnimatePresence>
          {showJSON && rawResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-bold text-lg">Hasil Response</h4>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  responseStatus === 200 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  responseStatus === 401 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  {responseStatus === 401 ? '401 Gagal' : responseStatus === 200 ? '200 Sukses' : `${responseStatus}`}
                </span>
              </div>
              
              <div className="bg-slate-950 rounded-xl p-4 border border-white/10 max-h-96 overflow-auto">
                <pre className="text-sm text-green-300 font-mono">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {testError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4">
          <div className="flex items-start gap-3 text-red-200">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">{testError}</div>
          </div>
        </div>
      )}

      {loadedProducts.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-purple-500/50 focus:bg-white/15 transition-all"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 hover:border-purple-500/50 rounded-xl pl-12 pr-10 py-3 text-white font-semibold outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer shadow-lg"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a78bfa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-800 text-white py-2 font-semibold">{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-300 text-base font-medium">
              Menampilkan <span className="text-white font-bold">{filteredProducts.length}</span> dari <span className="text-white font-bold">{loadedProducts.length}</span> produk
            </p>
          </div>
        </div>
      )}

      {loadedProducts.length > 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.ID_Product}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all cursor-pointer group"
                >
                  {product.gambar ? (
                    <div 
                      className="relative h-48 overflow-hidden cursor-zoom-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        openZoomModal(product);
                      }}
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
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        className="text-6xl"
                      >
                        📦
                      </motion.div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                      {product.nama_barang}
                    </h3>

                    {product.deskripsi && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {product.deskripsi}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-gray-400">{product.kategori}</span>
                      <span className="text-gray-400">Stok: {product.stok}</span>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDetailModal(product)}
                        className="w-full text-red-500 text-sm font-bold flex items-center justify-center gap-1 hover:text-red-400 transition-colors py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg"
                      >
                        Lihat Detail
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500">Tidak ada produk yang cocok dengan filter</p>
            </div>
          )}
        </div>
      ) : !testLoading && !testError && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg mb-2 font-bold">Belum ada data produk</p>
          <p className="text-gray-600 text-sm">Masukkan API Key dan klik "Load Data" untuk mulai</p>
        </div>
      )}

      <AnimatePresence>
        {showDetailModal && selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailModal}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
                {selectedProduct.gambar ? (
                  <div 
                    className="relative h-64 overflow-hidden cursor-zoom-in"
                    onClick={(e) => {
                      e.stopPropagation();
                      openZoomModal(selectedProduct);
                    }}
                  >
                    <img 
                      src={getImageUrl(selectedProduct.gambar)} 
                      alt={selectedProduct.nama_barang}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        closeDetailModal();
                      }}
                      className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-xl transition-all z-10"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                ) : (
                  <div className="relative h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                    <span className="text-8xl">📦</span>
                    
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closeDetailModal}
                      className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-xl transition-all"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                )}

                <div className="p-8">
                  <h2 className="text-3xl font-black text-white mb-4">
                    {selectedProduct.nama_barang}
                  </h2>

                  {selectedProduct.deskripsi && (
                    <p className="text-gray-400 text-base mb-6 leading-relaxed">
                      {selectedProduct.deskripsi}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-gray-500 text-sm mb-1">Kategori</p>
                      <p className="text-white font-bold text-lg">{selectedProduct.kategori}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-gray-500 text-sm mb-1">Stok Tersedia</p>
                      <p className="text-white font-bold text-lg">{selectedProduct.stok} Unit</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm mb-2">Harga</p>
                    <p className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Rp {Number(selectedProduct.harga).toLocaleString('id-ID')}
                    </p>
                  </div>
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

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Stock Available</p>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                          selectedProduct.stok > 10 ? 'bg-green-400' : selectedProduct.stok > 0 ? 'bg-yellow-400' : 'bg-red-400'
                        } animate-pulse`} />
                        <p className="text-white font-bold text-3xl">{selectedProduct.stok} <span className="text-xl text-gray-400">Units</span></p>
                      </div>
                    </div>
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

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalApiKeys: 0 });
  const [loading, setLoading] = useState(true);
  const [apiLogs, setApiLogs] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [activeKeys, setActiveKeys] = useState(0);
  const [generatingKey, setGeneratingKey] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nama_barang: '',
    harga: '',
    stok: '',
    kategori: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      loadDashboardData(JSON.parse(storedUser));
    }
  }, []);

  const loadDashboardData = async (currentUser) => {
    const token = localStorage.getItem('token');
    
    try {
      if (currentUser.role === 'user') {
        const statsRes = await fetch('http://localhost:3009/api/auth/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const statsData = await statsRes.json();

        if (statsData.success && statsData.data) {
          setTotalRequests(statsData.data.totalRequests || 0);
          setApiLogs(statsData.data.recentLogs || []);
        }
      }

      if (currentUser.role === 'user') {
        const profileRes = await fetch('http://localhost:3009/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileData.success && profileData.data.api_key) {
          setApiKey(profileData.data.api_key);
          setActiveKeys(1);
        } else {
          setActiveKeys(0);
        }
      }

      const productsRes = await fetch('http://localhost:3009/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productsData = await productsRes.json();
      setProducts(productsData.data || []);

      if (currentUser.role === 'admin') {
        const usersRes = await fetch('http://localhost:3009/api/auth/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        
        if (usersData.success) {
          const allUsers = usersData.data || [];
          const usersWithApiKeys = allUsers.filter(u => u.api_key && u.api_key.trim() !== '');
          
          setStats({
            totalProducts: productsData.data?.length || 0,
            totalUsers: allUsers.length,
            totalApiKeys: usersWithApiKeys.length
          });
        } else {
          setStats({
            totalProducts: productsData.data?.length || 0,
            totalUsers: 0,
            totalApiKeys: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      if (currentUser.role === 'admin') {
        setStats({
          totalProducts: 0,
          totalUsers: 0,
          totalApiKeys: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      nama_barang: product.nama_barang,
      harga: product.harga,
      stok: product.stok,
      kategori: product.kategori
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setFormData({ nama_barang: '', harga: '', stok: '', kategori: '' });
  };

  const handleUpdateProduct = async () => {
    if (!formData.nama_barang || !formData.harga || !formData.stok || !formData.kategori) {
      alert('Please fill all fields!');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3009/api/products/${editingProduct.ID_Product}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Product updated successfully!');
        loadDashboardData(user);
        closeEditModal();
      } else {
        alert(data.message || 'Failed to update product');
      }
    } catch (err) {
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    try {
      const res = await fetch(`http://localhost:3009/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Product deleted successfully!');
        loadDashboardData(user);
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert('API Key copied to clipboard!');
  };

  const handleGenerateApiKey = async () => {
    if (!window.confirm('Generate API Key baru?')) {
      return;
    }

    setGeneratingKey(true);

    try {
      const res = await fetch('http://localhost:3009/api/auth/reset-apikey', {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      
      const data = await res.json();

      if (data.success && data.api_key) {
        setApiKey(data.api_key);
        alert('API Key berhasil diperbarui!');
      } else {
        alert('Gagal membuat API Key');
      }
    } catch (err) {
      console.error('Error generating API key:', err);
      alert('Terjadi kesalahan');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleLoadSuccess = () => {
    setTotalRequests(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
          className="mb-10"
        >
          <div className="relative bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 border border-white/10 rounded-3xl p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="text-4xl"
                >
                  {user.role === 'admin' ? '👨‍💼' : '👤'}
                </motion.div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{user.nama || user.email}</span>
                  </h1>
                  <p className="text-gray-400 text-base mt-2">
                    {user.role === 'admin' 
                      ? 'Kelola sistem, pantau aktivitas, dan atur data produk'
                      : 'Kelola API Key dan eksplorasi data produk'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          
          {user.role === 'admin' && (
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
              
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-6 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg">System Overview</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-white/80 text-sm">Total Products</span>
                      <span className="text-2xl font-black text-white">{stats.totalProducts}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-white/80 text-sm">Total Users</span>
                      <span className="text-2xl font-black text-white">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-white/80 text-sm">API Keys</span>
                      <span className="text-2xl font-black text-white">{stats.totalApiKeys}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/products'}
                    className="w-full text-left px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-300 text-sm font-medium transition-all"
                  >
                    + Add New Product
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/admin/users'}
                    className="w-full text-left px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-300 text-sm font-medium transition-all"
                  >
                    View All Users
                  </motion.button>
                </div>
              </div>

            </motion.div>
          )}

          {user.role === 'user' && (
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
              
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-6 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg">Statistics</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-white/80 text-sm">Total Requests</span>
                      <span className="text-2xl font-black text-white">{totalRequests}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-white/80 text-sm">API Connect</span>
                      <span className="text-2xl font-black text-white">{activeKeys}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-white/80 text-sm">Account Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-lg font-black text-green-400">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg">Your Credentials</h3>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-white/70 text-xs uppercase tracking-wide mb-2 block">Client ID</label>
                      <div className="bg-black/30 p-3 rounded-xl border border-white/20">
                        <code className="text-white text-xs break-all font-mono">
                          {apiKey ? apiKey.substring(0, 20) + '...' : 'Loading...'}
                        </code>
                      </div>
                    </div>
                    <div>
                      <label className="text-white/70 text-xs uppercase tracking-wide mb-2 block">Client Secret</label>
                      <div className="bg-black/30 p-3 rounded-xl border border-white/20">
                        <code className="text-white text-xs break-all font-mono">
                          {apiKey ? '•'.repeat(32) : 'Loading...'}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyApiKey}
                      disabled={!apiKey}
                      className="py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGenerateApiKey}
                      disabled={generatingKey}
                      className="py-2 bg-green-500/30 hover:bg-green-500/40 border border-green-500/50 rounded-xl text-green-200 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generatingKey ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-green-200/30 border-t-green-200 rounded-full"
                          />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Generate
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className="lg:col-span-2"
          >
            {user.role === 'admin' ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-white text-2xl font-black">Product Catalog</h3>
                    <p className="text-gray-400 text-sm">Browse available products</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/products'}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-green-500/30 transition-all"
                  >
                    + Add Product
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <AnimatePresence>
                    {products.length > 0 ? (
                      products.slice(0, 6).map((product, index) => (
                        <motion.div
                          key={product.ID_Product}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="text-white font-bold">{product.nama_barang}</p>
                              <p className="text-purple-400 text-sm font-semibold">
                                Rp {Number(product.harga).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded-lg text-gray-400 uppercase tracking-wider">
                              {product.kategori}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button 
                              onClick={() => openEditModal(product)}
                              className="flex-1 text-xs py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.ID_Product, product.nama_barang)}
                              className="flex-1 text-xs py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-2 text-center py-12"
                      >
                        <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-500">No products available</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/products'}
                  className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-all"
                >
                  View All Products →
                </motion.button>
              </div>
            ) : (
              <UserAPIExplorer apiKey={apiKey} onLoadSuccess={handleLoadSuccess} />
            )}
          </motion.div>

        </motion.div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black text-white">Edit Product</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeEditModal}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.nama_barang}
                      onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Price (Rp)</label>
                    <input
                      type="number"
                      value={formData.harga}
                      onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all"
                      placeholder="Enter price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Stock</label>
                    <input
                      type="number"
                      value={formData.stok}
                      onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all"
                      placeholder="Enter stock quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
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
                    onClick={closeEditModal}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-bold transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateProduct}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-bold shadow-lg shadow-purple-500/30 transition-all"
                  >
                    Update Product
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;