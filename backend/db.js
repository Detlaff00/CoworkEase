// backend/db.js
const { Pool } = require('pg');

// Параметры подключения; при желании вынесите их в .env
const pool = new Pool({
    user: 'samil',      // замените на вашего пользователя
    host: 'localhost',
    database: 'coworkease_db',
    // ваш пароль к БД
    port: 5432,
});

// Опционально: лог подключения
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL');
});

module.exports = pool;