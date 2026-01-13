'use strict';
const { ApiKey, User, ApiLog } = require('../models');

const apiGuard = async (req, res, next) => {

  /* ============================================================
      PENCATATAN AKTIVITAS (LOGGING)
      Bagian ini berfungsi untuk mencatat setiap request yang masuk
      baik itu berhasil maupun gagal ke dalam database.
     ============================================================ */
  res.on('finish', async () => {
    try {
      const userId = req.apiUser ? req.apiUser.ID_User : null;

      await ApiLog.create({
        ID_User: userId,
        endpoint: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        created_at: new Date()
      });
    } catch (err) {
      console.error('❌ [Database Error] Gagal menyimpan log:', err.message);
    }
  });

  try {
    /* ============================================================
        VALIDASI IDENTITAS USER (API KEY CHECK)
        Memastikan request memiliki Key yang valid dan aktif.
       ============================================================ */
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: API Key is missing'
      });
    }

    const keyRecord = await ApiKey.findOne({
      where: { Key: apiKey },
      include: [{ model: User, as: 'user' }]
    });

    if (!keyRecord || !keyRecord.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid API Key'
      });
    }

    const now = new Date();
    const isExpired = keyRecord.expires_at && now > new Date(keyRecord.expires_at);

    if (isExpired || keyRecord.status === 'inactive') {
      
      // Jika sudah expired tapi status masih active, otomatis ubah ke inactive
      if (isExpired && keyRecord.status === 'active') {
        await keyRecord.update({ status: 'inactive' });
      }

      return res.status(403).json({
        success: false,
        message: isExpired ? 'API Key Expired' : 'API Key is Inactive. Please regenerate.'
      });
    }

    await keyRecord.update({
      last_used: new Date()
    });

    req.apiUser = keyRecord.user;

    next();
  } catch (err) {
    console.error('❌ [Guard Error]:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

module.exports = apiGuard;