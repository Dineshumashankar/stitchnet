const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function migrateProfileFields() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stitchnet_db'
    });

    try {
        console.log('Adding profile fields to users table...');

        // Add location and profile_photo columns
        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN location VARCHAR(255) DEFAULT NULL,
            ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL,
            ADD COLUMN phone VARCHAR(20) DEFAULT NULL
        `);

        console.log('✅ User profile fields added successfully!');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('⚠️ Columns already exist, skipping...');
        } else {
            console.error('❌ Error during migration:', err);
        }
    } finally {
        await connection.end();
    }
}

migrateProfileFields();
