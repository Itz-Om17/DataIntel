const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
    userId: {
        type: Number, // Aligning with MySQL
        required: true,
        index: true
    },
    projectId: {
        type: Number,
        required: true,
        index: true
    },
    title: {
        type: String,
        default: "New Chat"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
