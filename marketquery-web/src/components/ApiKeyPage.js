import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ApiKeyPage = () => {
  // Mengelola data API key, status loading, notifikasi copy, visibilitas key, dan tanggal kadaluarsa
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);

  // Menjalankan fetchApiKey satu kali saat halaman pertama kali dibuka
  useEffect(() => {
    fetchApiKey();
  }, []);

   // --- FUNGSI UTAMA: GET DATA ---
  // Mengambil profile user dari backend untuk mendapatkan API Key yang sedang aktif
  const fetchApiKey = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3009/api/auth/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && data.data.api_key) {
        setApiKey(data.data.api_key);
        setExpiresAt(data.data.expires_at);
      }
    } catch (err) {
      console.error("Gagal mengambil API Key:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI UTAMA: RESET/GENERATE KEY ---
  // Meminta backend untuk membuat API Key baru. Key lama akan otomatis hangus.
  const handleGenerateKey = async () => {
    if (!window.confirm("Apakah kamu yakin ingin membuat API Key baru? Key lama tidak akan bisa digunakan lagi.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3009/api/auth/reset-apikey', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();

      if (data.success && data.api_key) {
        setApiKey(data.api_key);
        setExpiresAt(data.expires_at);
        alert("API Key berhasil diperbarui!");
      } else {
        alert("Gagal membuat API Key: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error generating key:", err);
      alert("Terjadi kesalahan saat generate key.");
    } finally {
      setLoading(false);
    }
  };

  // Menyalin teks API Key ke clipboard pengguna dan memberikan feedback visual 
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Menyensor bagian tengah API Key agar tidak terlihat penuh (contoh: abc12•••xyz9)
  const maskApiKey = (key) => {
    if (!key || key.length < 8) return key;
    return `${key.substring(0, 8)}${'•'.repeat(key.length - 12)}${key.substring(key.length - 4)}`;
  };

   // Setting varian animasi untuk Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // --- RENDER TAMPILAN ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-28 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block text-6xl mb-4"
          >
            🔑
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            API Key Saya
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Gunakan API Key ini untuk mengakses data MarketQuery dari aplikasi luar.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          
           {/* KARTU UTAMA: MENAMPILKAN KEY & TOMBOL AKSI */}
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-8 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-black">API Key Anda</h2>
                    {expiresAt ? (
                      <p className="text-green-300 text-xs font-medium bg-green-500/20 px-2 py-0.5 rounded-md inline-block mt-1">
                        Berlaku hingga: {new Date(expiresAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    ) : (
                      <p className="text-white/70 text-sm">Rahasiakan kunci ini!</p>
                    )}
                  </div>
                </div>
                
                {/* Tombol Toggle Show/Hide Key */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                >
                  {showKey ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </motion.button>
              </div>
              
               {/* Box Tampilan Key Code */}
              <div className="bg-black/40 rounded-2xl p-6 mb-4 border border-white/20">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full"
                    />
                  </div>
                ) : (
                  <code className="text-white font-mono text-sm md:text-base break-all block">
                    {apiKey ? (showKey ? apiKey : maskApiKey(apiKey)) : 'Belum ada API Key'}
                  </code>
                )}
              </div>

                {/* Tombol Copy & Generate */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyToClipboard}
                  disabled={!apiKey || loading}
                  className="py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Disalin!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Salin Key
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateKey}
                  disabled={loading}
                  className="py-3 bg-green-500/30 hover:bg-green-500/40 border border-green-500/50 rounded-xl text-green-100 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generate Baru
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* BAGIAN DOKUMENTASI API */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
          >
            <h3 className="text-white text-3xl font-black mb-3">
              Dokumentasi Resmi
            </h3>
            <p className="text-gray-400 text-base mb-8">
              Panduan lengkap untuk mengintegrasikan data MarketQuery ke dalam aplikasi Anda.
            </p>

            <div className="mb-10">
              <h4 className="text-white text-2xl font-bold mb-4">1. Autentikasi</h4>
              <p className="text-gray-300 mb-4">
                Setiap permintaan ke API harus menyertakan API Key yang valid melalui Header.
              </p>
              
              <div className="bg-slate-950 rounded-xl p-6 border border-white/10">
                <pre className="text-sm text-gray-300 font-mono">
                  <code>
                    <span className="text-gray-500">// Header Request</span>{'\n'}
                    <span className="text-blue-400">x-api-key</span>: <span className="text-yellow-300">{apiKey || 'wm_live_xxxxxxxxxxxxxxxxxxxx'}</span>
                  </code>
                </pre>
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-white text-2xl font-bold mb-4">2. Endpoint Products</h4>
              
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-sm font-bold">
                      GET
                    </span>
                    <code className="text-pink-400 font-mono text-base">
                      /api/products/external/all
                    </code>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    Mengambil daftar semua produk yang tersedia.
                  </p>
                  
                  <div className="mt-4">
                    <p className="text-gray-400 text-xs font-semibold mb-2">Contoh Response:</p>
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/10 overflow-x-auto">
                      <pre className="text-xs text-gray-300 font-mono">
{`[
  {
    "id": 1,
    "nama": "Laptop Gaming",
    "deskripsi": "Laptop performa tinggi untuk gaming...",
    "harga": 15000000,
    "stok": 10,
    "kategori": "Elektronik"
  },
  ...
]`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-sm font-bold">
                      GET
                    </span>
                    <code className="text-pink-400 font-mono text-base">
                      /api/products/external/:id
                    </code>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    Mengambil detail produk berdasarkan ID.
                  </p>
                  
                  <div className="mt-4">
                    <p className="text-gray-400 text-xs font-semibold mb-2">Contoh Request:</p>
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/10 mb-3">
                      <code className="text-xs text-pink-400 font-mono">
                        GET /api/products/external/1
                      </code>
                    </div>

                    <p className="text-gray-400 text-xs font-semibold mb-2">Contoh Response:</p>
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/10 overflow-x-auto">
                      <pre className="text-xs text-gray-300 font-mono">
{`{
  "id": 1,
  "nama": "Laptop Gaming",
  "deskripsi": "Laptop performa tinggi untuk gaming...",
  "harga": 15000000,
  "stok": 10,
  "kategori": "Elektronik"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-white text-2xl font-bold mb-4">3. Base URL</h4>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-2xl">🌐</span>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">URL Dasar API:</p>
                    <code className="text-white font-mono text-base break-all">
                      http://localhost:3009/api/products/external
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* BAGIAN DAFTAR RESPONSE CODE */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
          >
            <h3 className="text-white text-2xl font-black mb-6">Response Codes</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <span className="text-gray-300">Success</span>
                <span className="px-4 py-1.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-sm font-bold">
                  200 OK
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <span className="text-gray-300">Unauthorized (Invalid API Key)</span>
                <span className="px-4 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm font-bold">
                  401 Unauthorized
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <span className="text-gray-300">Not Found</span>
                <span className="px-4 py-1.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-lg text-sm font-bold">
                  404 Not Found
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <span className="text-gray-300">Internal Server Error</span>
                <span className="px-4 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm font-bold">
                  500 Server Error
                </span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default ApiKeyPage;