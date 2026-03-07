const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/dataintel_chat');
        console.log("Connected to MongoDB for Chat History");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
};

module.exports = connectMongo;
