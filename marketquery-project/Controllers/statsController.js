'use strict';
const { ApiLog, ApiKey, User, Product } = require('../models');

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id || req.user.ID_User; 
        const userRole = req.user.role;

        /* ==================================
           LOGIKA UNTUK ROLE ADMIN
           MENGAMBIL SEMUA STATISTIK GLOBAL
        ===================================== */
        if (userRole === 'admin') {
            const [totalProducts, totalUsers, totalApiKeys, recentActivities] = await Promise.all([
                Product.count(),// Menghitung semua produk yang terdaftar
                User.count({ where: { role: 'user' } }),// Menghitung total pengguna dengan role 'user'
                ApiKey.count(),// Menghitung total seluruh API Key yang telah dibuat

                /* ==============================
                      AMBIL SEMUA DATA (GET ALL)
                      LOG AKTIVITAS SELURUH USER
                ================================== */
                ApiLog.findAll({
                    order: [['created_at', 'DESC']],
                    include: [{ 
                        model: User, 
                        as: 'user', 
                        attributes: ['nama', 'email']
                    }]
                })
            ]);

            return res.status(200).json({
                success: true,
                role: 'admin',
                data: {
                    totalProducts,
                    totalUsers,
                    totalApiKeys,
                    recentLogs: recentActivities 
                }
            });
        }

        /* ==================================
           LOGIKA UNTUK ROLE USER BIASA
           MENGAMBIL STATISTIK PRIBADI USER
        ===================================== */
        const [totalRequests, recentLogs, apiKeyRecord] = await Promise.all([
            ApiLog.count({ where: { ID_User: userId } }),// Menghitung total request yang dilakukan user
            
            /* ==============================
                  AMBIL SEMUA DATA (GET ALL)
                  LOG AKTIVITAS MILIK USER INI
            ================================== */
            ApiLog.findAll({
                where: { ID_User: userId },
                order: [['ID_Log', 'DESC']]
            }),
            ApiKey.findOne({ where: { ID_User: userId } })// Mencari informasi API Key milik user
        ]);

        return res.status(200).json({
            success: true,
            role: 'user',
            data: {
                totalRequests: totalRequests || 0,
                apiKey: apiKeyRecord ? apiKeyRecord.Key : "Belum ada Key",
                systemStatus: apiKeyRecord && apiKeyRecord.status === 'active' ? 'ACTIVE' : 'INACTIVE',
                recentLogs: recentLogs || []
            }
        });

    } catch (error) {
        console.error('ERROR STATS:', error);
        res.status(500).json({ success: false, message: 'Gagal sinkron data statistik' });
    }
};