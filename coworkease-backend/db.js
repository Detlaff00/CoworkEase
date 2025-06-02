require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool(); // конфиг подтянется из .env

module.exports = pool;