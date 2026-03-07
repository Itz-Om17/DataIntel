const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
    userId: {
        type: Number, // Since MySQL IDs are usually INT
        required: true,
        index: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ChatSession',
        index: true
    },
    datasetId: {
        type: Number,
        default: null
    },
    question: {
        type: String,
        required: true
    },
    sqlGenerated: {
        type: String
    },
    aiResponse: {
        type: String,
        required: true
    },
    queryData: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
