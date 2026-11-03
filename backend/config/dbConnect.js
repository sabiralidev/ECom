const mongoose = require('mongoose');
const logger = require("../utils/logger");

const dotenv = require('dotenv');
dotenv.config();

const dbConnect = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is required");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("database connected");
        return mongoose.connection;
    } catch (error) {
        logger.error({ err: error }, "database connection failed");
        throw error;
    }
};
module.exports = dbConnect;