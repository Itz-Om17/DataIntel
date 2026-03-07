const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const ChatHistory = require('../models/ChatHistory');

const router = express.Router();

// GET all chat history for a specific session for the logged-in user
router.get('/:sessionId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.sessionId;

        // Fetch histories sorted by oldest first
        const histories = await ChatHistory.find({ userId, sessionId }).sort({ timestamp: 1 });

        res.json(histories);
    } catch (err) {
        console.error("Failed to fetch history", err);
        res.status(500).json({ error: "Server Error fetching history" });
    }
});

module.exports = router;
