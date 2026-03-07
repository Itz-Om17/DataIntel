const express = require('express');
const pool = require('../services/mysqlService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all projects for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, created_at FROM projects WHERE user_id = ? ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

// Create a new project
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Project name is required" });

        const [result] = await pool.query(
            "INSERT INTO projects (user_id, name) VALUES (?, ?)",
            [req.user.id, name]
        );

        res.json({ id: result.insertId, name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create project" });
    }
});

// Delete a project (will cascade delete datasets in MySQL)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM projects WHERE id = ? AND user_id = ?",
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Project not found or unauthorized" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete project" });
    }
});

module.exports = router;
