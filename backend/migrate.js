const db = require('./config/db');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function migrate() {
    console.log('--- Starting Database Migration ---');

    const isPostgres = !!process.env.DATABASE_URL;
    const sqlFile = isPostgres ? 'database_pg.sql' : 'database.sql';
    const sqlPath = path.join(__dirname, sqlFile);

    if (!fs.existsSync(sqlPath)) {
        console.error(`Error: ${sqlFile} not found at ${sqlPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    // For PostgreSQL, we might need to split the file by EOF/Blocks or just run it if the driver supports multiple statements.
    // The 'pg' driver doesn't support multiple statements in a single query() call unless it's a simple string.
    // However, for initialization, it's often easier to split by semicolon if there are no complex triggers/functions.

    try {
        console.log(`Running migration for ${isPostgres ? 'PostgreSQL' : 'MySQL'}...`);

        if (isPostgres) {
            // Simple split for Postgres. Note: This is naive but works for standard schemas.
            // A better way is to run the whole block if the driver supports it.
            await db.query(sql);
        } else {
            // MySQL shim handles its own thing, but we need to ensure the connection supports multiple statements
            // Actually, my db.js shim uses execute() which doesn't support multiple statements.
            // Let's run queries one by one or use a specialized connection.
            const lines = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
            for (const line of lines) {
                await db.query(line);
            }
        }

        console.log('--- Migration Completed Successfully! ---');
        process.exit(0);
    } catch (err) {
        console.error('--- Migration Failed! ---');
        console.error(err);
        process.exit(1);
    }
}

migrate();
