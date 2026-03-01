// config/db.js
const mongoose = require('mongoose');


const connectDB = async () => {
  const mongoURI = process.env.mongo_url;
  if (!mongoURI) {
    console.error('mongo_url is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};


module.exports = connectDB;