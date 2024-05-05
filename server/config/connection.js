const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vmst_website');
/*
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://chrislstevenson:9lhGj0TLUzqLrodO@cluster0.no76ok1.mongodb.net/vmst_website');
 */

module.exports = mongoose.connection;
