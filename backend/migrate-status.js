const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function migrateDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stitchnet_db'
    });

    try {
        console.log('Updating orders table status column...');

        // Modify the ENUM to include new work stages
        await connection.query(`
            ALTER TABLE orders 
            MODIFY COLUMN status ENUM('open', 'assigned', 'cutting', 'sewing', 'finishing', 'completed') 
            DEFAULT 'open'
        `);

        console.log('✅ Database migration completed successfully!');
        console.log('Orders table now supports: open, assigned, cutting, sewing, finishing, completed');
    } catch (err) {
        console.error('❌ Error during migration:', err);
    } finally {
        await connection.end();
    }
}

migrateDatabase();
