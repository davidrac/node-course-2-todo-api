const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect((process.env.MONGODB_URI), { useNewUrlParser: true });

module.exports = { mongoose };