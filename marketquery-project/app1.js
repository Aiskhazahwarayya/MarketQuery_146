require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); 
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const app = express();

app.set('etag', false);
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('📁 Folder uploads tidak ditemukan, berhasil dibuat otomatis!');
}

app.use('/uploads', express.static(uploadDir));


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di MarketQuery API!',
    auth_methods: {
      dashboard: 'JWT (Bearer Token)',
      external: 'API Key (Header: x-api-key)'
    }
  });
});

app.use('/api/auth', authRoutes);       
app.use('/api/products', productRoutes); 

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server internal',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully to MarketQuery');

    app.listen(PORT, () => {
      console.log(`🚀 MarketQuery Server running at http://localhost:${PORT}`);
      console.log(`📁 Static files available at http://localhost:${PORT}/uploads/`);
      console.log('📡 Mode: JWT & API Key ACTIVE');
    });
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;