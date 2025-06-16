
const { Pool } = require('pg');


const pool = new Pool({
    user: 'samil',      
    host: 'localhost',
    database: 'coworkease_db',
    port: 5432,
});

// Опционально: лог подключения
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL');
});

module.exports = pool;