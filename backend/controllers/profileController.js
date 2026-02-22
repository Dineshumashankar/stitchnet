const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getProfile = async (req, res) => {
    try {
        const { rows: users } = await db.execute(
            'SELECT id, name, email, role, location, phone, profile_photo, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, location, phone } = req.body;

    try {
        await db.execute(
            'UPDATE users SET name = $1, location = $2, phone = $3 WHERE id = $4',
            [name, location, phone, req.user.id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.uploadProfilePhoto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const photoPath = `/uploads/${req.file.filename}`;

        await db.execute(
            'UPDATE users SET profile_photo = $1 WHERE id = $2',
            [photoPath, req.user.id]
        );

        res.json({ message: 'Profile photo updated', profile_photo: photoPath });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
