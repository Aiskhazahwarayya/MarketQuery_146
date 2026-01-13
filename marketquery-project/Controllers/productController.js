const { Product } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const fs = require('fs');   
const path = require('path'); 

/* ==============================
      AMBIL SEMUA DATA (GET ALL)
================================== */
exports.getAllProducts = async (req, res) => {
  try {
    const { search, sortBy = 'nama_barang', order = 'ASC' } = req.query;
    let whereClause = {};

    //Fitur Pencarian
    if (search) {
      whereClause[Op.or] = [
        { nama_barang: { [Op.like]: `%${search}%` } },
        { kategori: { [Op.like]: `%${search}%` } }
      ];
    }

    const validSortColumns = ['nama_barang', 'harga', 'stok', 'kategori'];
    const actualSortBy = validSortColumns.includes(sortBy) ? sortBy : 'nama_barang';

    const products = await Product.findAll({
      where: whereClause,
      order: [[actualSortBy, order]]
    });

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil produk',
      data: products
    });

  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

/* ==========================
AMBIL DETAIL (GET BY ID)
============================ */

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id); 
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produk tidak ditemukan' 
      });
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail produk',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};


/* ==========================================
   BUAT PRODUK BARU (CREATE)
   Menyimpan data teks & file gambar ke MySQL
========================================== */
exports.createProduct = async (req, res) => {
  try {
    // Validasi input dari Express Validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nama_barang, harga, kategori, deskripsi, stok } = req.body;
    // Mengambil nama file yang diupload 
    const gambar = req.file ? req.file.filename : null; 
    const product = await Product.create({ 
      nama_barang, 
      harga, 
      kategori,
      deskripsi,
      gambar,
      stok
    });

    res.status(201).json({
      success: true,
      message: 'Produk berhasil dibuat',
      data: product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat produk',
      error: error.message
    });
  }
};

/* ==========================================
   UPDATE DATA (UPDATE)
   Mengubah data & mengelola pembersihan gambar
========================================== */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, harga, kategori, deskripsi, stok, delete_image } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    let gambarData = product.gambar;

    //Jika upload baru, hapus gambar lama agar tidak menumpuk di server
    if (req.file) {
      if (product.gambar) {
        const oldPath = path.join(__dirname, '../uploads', product.gambar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      gambarData = req.file.filename;
    } 

    //Jika admin memilih hapus gambar tanpa ganti yang baru
    else if (delete_image === 'true') {
      if (product.gambar) {
        const oldPath = path.join(__dirname, '../uploads', product.gambar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      gambarData = null;
    }

    await product.update({ 
      nama_barang, 
      harga, 
      kategori, 
      deskripsi, 
      gambar: gambarData, 
      stok 
    });

    res.status(200).json({
      success: true,
      message: 'Produk berhasil diupdate',
      data: product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Gagal update produk',
      error: error.message
    });
  }
};


/* ==========================================
   HAPUS PRODUK (DELETE)
   Hapus baris database & hapus file fisiknya
========================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    if (product.gambar) {
      const filePath = path.join(__dirname, '../uploads', product.gambar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus produk',
      error: error.message
    });
  }
};