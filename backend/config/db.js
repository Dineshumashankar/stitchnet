const dotenv = require('dotenv');
const path = require('path');

// Load .env from the root stitchnet directory or backend directory
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

let db;

if (process.env.DATABASE_URL) {
    // PostgreSQL (Supabase) configuration
    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false
    });
    db = {
        query: (text, params) => pool.query(text, params),
        execute: (text, params) => pool.query(text, params)
    };
    console.log('Connected using PostgreSQL (DATABASE_URL)');
} else {
    // MySQL (Local) configuration shim
    const mysql = require('mysql2/promise');
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stitchnet_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Helper to convert PostgreSQL $1, $2 placeholders to MySQL ?
    const transformQuery = (text) => {
        // Strip PostgreSQL specific "RETURNING id" clause for MySQL
        const stripped = text.replace(/RETURNING id/gi, '').trim();
        return stripped.replace(/\$\d+/g, '?');
    };

    db = {
        query: async (text, params) => {
            const isInsert = text.trim().toUpperCase().startsWith('INSERT');
            const [result] = await pool.execute(transformQuery(text), params);

            // If it's an INSERT and we have an insertId, pack it into rows to mimic Postgres RETURNING id
            const rows = Array.isArray(result) ? result : [];
            if (isInsert && result.insertId) {
                return { rows: [{ id: result.insertId }] };
            }
            return { rows };
        },
        execute: async (text, params) => {
            const isInsert = text.trim().toUpperCase().startsWith('INSERT');
            const [result] = await pool.execute(transformQuery(text), params);

            const rows = Array.isArray(result) ? result : [];
            if (isInsert && result.insertId) {
                return { rows: [{ id: result.insertId }] };
            }
            return { rows };
        }
    };
    console.log('Connected using MySQL Shim (Local with Postgres Query Support)');
}

module.exports = db;
