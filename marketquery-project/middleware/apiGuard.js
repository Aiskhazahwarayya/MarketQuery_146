'use strict';
const { ApiKey, User, ApiLog } = require('../models');

const apiGuard = async (req, res, next) => {
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
            console.error("❌ [Database Error] Gagal menyimpan log:", err.message);
        }
    });

    try {
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
        req.apiUser = keyRecord.user;
        next();

    } catch (err) {
        console.error("❌ [Guard Error]:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = apiGuard;