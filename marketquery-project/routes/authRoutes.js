const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const statsController = require('../Controllers/statsController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/stats', authenticateToken, statsController.getUserStats);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/password', authenticateToken, authController.changePassword);
router.put('/reset-apikey', authenticateToken, authController.resetApiKey);


router.get('/admin/users', authenticateToken, isAdmin, authController.getAllUsers);
router.delete('/admin/users/:id', authenticateToken, isAdmin, authController.deleteUser);

module.exports = router;