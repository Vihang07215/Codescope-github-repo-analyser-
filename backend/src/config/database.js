const mongoose = require('mongoose');
require('dotenv').config()
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI;

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
