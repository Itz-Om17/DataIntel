const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../services/mysqlService');

const router = express.Router();
const JWT_SECRET = 'supersecret_dataintel_key'; // In prod, use environment variables

// 1. Register Route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const connection = await pool.getConnection();

        // Check if user exists
        const [existing] = await connection.query("SELECT id FROM users WHERE username = ?", [username]);
        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ error: "Username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert
        await connection.query(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword]
        );

        connection.release();
        res.status(201).json({ message: "User registered successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

// 2. Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const connection = await pool.getConnection();

        const [users] = await connection.query("SELECT * FROM users WHERE username = ?", [username]);
        connection.release();

        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during login" });
    }
});

module.exports = router;
