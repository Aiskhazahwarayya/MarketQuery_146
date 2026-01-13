import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  // Menyimpan ringkasan statistik untuk ditampilkan di kartu atas
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApiKeys: 0,
    activeKeys: 0,
    inactiveKeys: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsersData();
  }, []);

  // --- API FUNCTION: LOAD USERS ---
  const loadUsersData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Fetch semua user dari endpoint admin
      const response = await fetch('http://localhost:3009/api/auth/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
        
        // --- LOGIKA PERHITUNGAN STATISTIK ---
        const total = data.data.length;
        const withKeys = data.data.filter(u => u.api_key).length;
        
        // Menghitung status berdasarkan kolom 'status' dari database ('active' atau 'inactive')
        const activeKeysCount = data.data.filter(u => u.api_key && u.status === 'active').length;
        const inactiveKeysCount = data.data.filter(u => u.api_key && u.status === 'inactive').length;
        
        setStats({
          totalUsers: total,
          totalApiKeys: withKeys,
          activeKeys: activeKeysCount,
          inactiveKeys: inactiveKeysCount
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- API FUNCTION: DELETE USER ---
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3009/api/auth/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('User berhasil dihapus!');
        loadUsersData();// Refresh data setelah menghapus
      } else {
        alert(data.message || 'Gagal menghapus user!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus user!');
    }
  };

  // --- UTILITY FUNCTION ---
  const copyApiKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey);
    alert('API Key copied!');
  };

  // --- LOADING STATE VIEW ---
  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-28 px-4 md:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        
         {/* HEADER JUDUL */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-black text-white">User Management</h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              👥
            </motion.div>
          </div>
          <p className="text-gray-400 text-lg">
            Kelola <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">Users & API Keys</span>
          </p>
        </motion.div>

        {/* KARTU STATISTIK (4 GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Total User */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-6 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-5xl font-black text-white mb-2">{stats.totalUsers}</p>
              <p className="text-white/80 text-sm font-medium">Total Users</p>
            </div>
          </motion.div>

           {/* Card 2: Total API Keys */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-5xl font-black text-white mb-2">{stats.totalApiKeys}</p>
              <p className="text-white/80 text-sm font-medium">Total API Keys</p>
            </div>
          </motion.div>

          {/* Card 3: Active Keys */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-gradient-to-br from-green-600 to-emerald-600 p-6 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-5xl font-black text-white mb-2">{stats.activeKeys}</p>
              <p className="text-white/80 text-sm font-medium">Keys Aktif</p>
            </div>
          </motion.div>

          {/* Card 4: Inactive Keys */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-gradient-to-br from-red-600 to-rose-600 p-6 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-5xl font-black text-white mb-2">{stats.inactiveKeys}</p>
              <p className="text-white/80 text-sm font-medium">Keys Non-Aktif</p>
            </div>
          </motion.div>

        </div>

        {/* TABEL LIST USER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-white text-2xl font-black">Daftar Users & API Keys</h3>
          </div>

          {/* Header Tabel (Desktop Only) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl mb-3">
            <div className="col-span-1 text-purple-300 text-xs uppercase tracking-wider font-bold">ID</div>
            <div className="col-span-2 text-purple-300 text-xs uppercase tracking-wider font-bold">Nama</div>
            <div className="col-span-3 text-purple-300 text-xs uppercase tracking-wider font-bold">Email</div>
            <div className="col-span-3 text-purple-300 text-xs uppercase tracking-wider font-bold">API Key</div>
            <div className="col-span-1 text-center text-purple-300 text-xs uppercase tracking-wider font-bold">Status</div>
            <div className="col-span-2 text-center text-purple-300 text-xs uppercase tracking-wider font-bold">Aksi</div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <motion.div
                    key={user.ID_User}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                  >
                     {/* ID User */}
                    <div className="md:col-span-1 flex md:block items-center gap-2">
                      <span className="md:hidden text-gray-400 text-xs font-semibold">ID:</span>
                      <span className="text-white font-bold">{user.ID_User}</span>
                    </div>

                     {/* Nama User */}
                    <div className="md:col-span-2 flex md:block items-center gap-2">
                      <span className="md:hidden text-gray-400 text-xs font-semibold">Nama:</span>
                      <span className="text-white font-medium">{user.nama || 'N/A'}</span>
                    </div>

                    {/* Email User */}
                    <div className="md:col-span-3 flex md:block items-center gap-2">
                      <span className="md:hidden text-gray-400 text-xs font-semibold">Email:</span>
                      <span className="text-gray-300 text-sm">{user.email}</span>
                    </div>

                    {/* API Key (Sensor + Copy) */}
                    <div className="md:col-span-3 flex md:block items-center gap-2">
                      <span className="md:hidden text-gray-400 text-xs font-semibold">API Key:</span>
                      {user.api_key ? (
                        <div className="flex items-center gap-2">
                          <code className="text-green-400 text-xs font-mono bg-black/30 px-2 py-1 rounded border border-green-500/30">
                            {user.api_key.substring(0, 20)}...
                          </code>
                          <button
                            onClick={() => copyApiKey(user.api_key)}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">No API Key</span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="md:col-span-1 flex md:justify-center items-center gap-2">
                      <span className="md:hidden text-gray-400 text-xs font-semibold">Status:</span>
                      {user.api_key ? (
                        // PERBAIKAN: Membaca status asli dari database (active/inactive)
                        user.status === 'active' ? (
                          <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-xs font-bold">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold">
                            Inactive
                          </span>
                        )
                      ) : (
                        <span className="inline-block px-3 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded-lg text-xs font-bold">
                          No Key
                        </span>
                      )}
                    </div>

                    {/* Action Button (Delete) */}
                    <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteUser(user.ID_User)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-xs font-bold transition-all"
                      >
                        🗑️ Hapus
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-gray-500">Tidak ada data user</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default UserManagementPage;