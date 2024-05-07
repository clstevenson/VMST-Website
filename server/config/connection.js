const mongoose = require('mongoose');
// comment out the next line if you want to work locally
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vmst');

module.exports = mongoose.connection;
