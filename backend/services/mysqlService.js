const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || 'test',
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    connectTimeout: 20000,
});

module.exports = pool;