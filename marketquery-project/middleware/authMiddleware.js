const jwt = require('jsonwebtoken');

/* ============================================================
    AUTENTIKASI TOKEN (VERIFIKASI LOGIN)
    Mengecek apakah user sudah login dan memiliki token valid.
   ============================================================ */
exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan, silakan login'
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluarsa'
    });
  }
};

/* ============================================================
    OTORISASI ADMIN (LEVEL AKSES)
    Memastikan user yang sudah login memiliki hak akses Admin.
   ============================================================ */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Akses ditolak: hanya untuk admin'
  });
};
