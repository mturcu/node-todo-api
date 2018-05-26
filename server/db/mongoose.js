const mongoose = require('mongoose');

const dbName = (process.env.NODE_ENV === 'test') ? 'TodoAppTest' : 'TodoApp';
const mongoUrl = process.env.MONGODB_URI || `mongodb://localhost:27017/${dbName}`;

mongoose.Promise = global.Promise;
mongoose.connect(mongoUrl)
.then(m => console.log('Connected to database', m.connections[0].name))
.catch(e => console.log(e.message));

module.exports = {mongoose};