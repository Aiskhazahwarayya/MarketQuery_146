const multer = require('multer');
const path = require('path');

/* ============================================================
    KONFIGURASI PENYIMPANAN (STORAGE)
    Menentukan ke mana file disimpan dan apa nama filenya.
   ============================================================ */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

/* ============================================================
    PENYARING FILE (FILE FILTER)
    Memastikan hanya file tertentu yang boleh diunggah.
   ============================================================ */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batasan ukuran: Maksimal 5MB
  fileFilter: fileFilter
});

module.exports = upload;