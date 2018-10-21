const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} =  require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5bcc2581b67636d0c801f577';
var userId = '5bc89831d3b319be8db2f247';

// if (!ObjectID.isValid(id)) {
//     return console.log('ID not valid');
// }
// Todo.find({
//     _id: id
// }).then(todos => {
//     console.log('Todos', todos);
// });

// Todo.findOne({
//     _id: id
// }).then(todo => {
//     console.log('Todo', todo);
// });

// Todo.findById(id).then(todo => {
//     if (!todo) {
//         return console.log('Id not found');
//     }
//     console.log('Todo by Id', todo);
// }).catch(console.log);

User.findById(userId).then(user => {
    if (!user) {
        return console.log('User not found');
    }
    console.log('User by Id', user);
}).catch(console.log);