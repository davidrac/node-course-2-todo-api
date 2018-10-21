const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} =  require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then(result => {
//     console.log(result);
// });

Todo.findByIdAndRemove('5bcc51dcdd226505692e0925').then(console.log);
Todo.findOneAndRemove({_id: '5bcc51dcdd226505692e0925'}).then(console.log);