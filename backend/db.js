
const { Pool } = require('pg');


const pool = new Pool({
    user: 'samil',      
    host: 'localhost',
    database: 'coworkease_db',
    port: 5432,
});



module.exports = pool;