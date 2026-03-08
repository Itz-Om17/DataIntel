const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || 'conversational_ai',
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

module.exports = pool;