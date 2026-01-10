const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, ApiKey } = require('../models'); 
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');


exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nama, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nama,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    const userData = {
      ID_User: newUser.ID_User,
      nama: newUser.nama,
      email: newUser.email,
      role: newUser.role
    };

    if (newUser.role === 'user') {
      const apiKey = process.env.API_KEY_PREFIX + crypto.randomBytes(16).toString('hex');

      await ApiKey.create({
        ID_User: newUser.ID_User,
        Key: apiKey
      });

      userData.api_key = apiKey;
    }

    const token = jwt.sign(
      { ID_User: newUser.ID_User, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { user: userData, token }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Email atau password salah' });
    }

    const userData = {
      ID_User: user.ID_User,
      nama: user.nama,
      email: user.email,
      role: user.role
    };

    if (user.role === 'user') {
      let keyRecord = await ApiKey.findOne({
        where: { ID_User: user.ID_User },
        order: [['updatedAt', 'DESC']] 
      });

      if (!keyRecord) {
        keyRecord = await ApiKey.create({
          ID_User: user.ID_User,
          Key: process.env.API_KEY_PREFIX + crypto.randomBytes(16).toString('hex')
        });
      }

      userData.api_key = keyRecord.Key;
    }

    const token = jwt.sign(
      { ID_User: user.ID_User, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      data: { user: userData, token }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.ID_User, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User tidak ditemukan' });
    }

    const keyRecord =
      user.role === 'user'
        ? await ApiKey.findOne({ 
            where: { ID_User: user.ID_User },
            order: [['updatedAt', 'DESC']]
          })
        : null;

    res.json({
      success: true,
      data: {
        ID_User: user.ID_User,
        nama: user.nama,
        email: user.email,
        role: user.role,
        api_key: keyRecord ? keyRecord.Key : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nama, email } = req.body;
    const userId = req.user.ID_User;

    if (email) {
      const existing = await User.findOne({
        where: { email, ID_User: { [Op.ne]: userId } }
      });

      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: 'Email sudah digunakan' });
      }
    }

    await User.update({ nama, email }, { where: { ID_User: userId } });

    res.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.ID_User);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User tidak ditemukan' });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: 'Password lama salah' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashed },
      { where: { ID_User: user.ID_User } }
    );

    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetApiKey = async (req, res) => {
  try {
    const userId = req.user.ID_User; 
    const user = await User.findByPk(userId);

    if (!user || user.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Hanya user yang bisa reset API Key'
      });
    }

    const newApiKey = process.env.API_KEY_PREFIX + crypto.randomBytes(16).toString('hex');

    const [updated] = await ApiKey.update(
      { Key: newApiKey },
      { where: { ID_User: userId } }
    );

    if (updated === 0) {
      await ApiKey.create({
        ID_User: userId,
        Key: newApiKey
      });
    }

    res.json({
      success: true,
      message: 'API Key berhasil diperbarui',
      api_key: newApiKey
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: ['ID_User', 'email', 'nama', 'role', 'createdAt'],
      order: [['ID_User', 'DESC']]
    });

    const usersWithKeys = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toJSON();
        
        if (user.role === 'user') {
          const keyRecord = await ApiKey.findOne({
            where: { ID_User: user.ID_User },
            order: [['updatedAt', 'DESC']]
          });
          userObj.api_key = keyRecord ? keyRecord.Key : null;
        } else {
          userObj.api_key = null;
        }
        
        return userObj;
      })
    );

    res.json({
      success: true,
      data: usersWithKeys
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data users'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.ID_User === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri'
      });
    }

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Tidak dapat menghapus user dengan role admin'
      });
    }
    await ApiKey.destroy({ where: { ID_User: id } });
    await user.destroy();

    res.json({
      success: true,
      message: 'User berhasil dihapus'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus user'
    });
  }
};