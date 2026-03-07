const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const ChatSession = require('../models/ChatSession');
const ChatHistory = require('../models/ChatHistory');

const router = express.Router();

// Get all sessions for a specific project
router.get('/project/:projectId', authMiddleware, async (req, res) => {
    try {
        const sessions = await ChatSession.find({
            userId: req.user.id,
            projectId: req.params.projectId
        }).sort({ createdAt: -1 });

        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch sessions" });
    }
});

// Create a new session
router.post('/project/:projectId', authMiddleware, async (req, res) => {
    try {
        const session = new ChatSession({
            userId: req.user.id,
            projectId: req.params.projectId,
            title: "New Chat" // This will be updated later when they ask the first question
        });
        await session.save();

        res.json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create session" });
    }
});

// Delete a session
router.delete('/:sessionId', authMiddleware, async (req, res) => {
    try {
        const session = await ChatSession.findOneAndDelete({
            _id: req.params.sessionId,
            userId: req.user.id
        });

        if (!session) return res.status(404).json({ error: "Session not found" });

        // Clean up all history for this session
        await ChatHistory.deleteMany({ sessionId: req.params.sessionId });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete session" });
    }
});

module.exports = router;
