const
  {ObjectID} = require('mongodb'),
  {mongoose} = require('./../server/db/mongoose'),
  {Todo} = require('./../server/models/todo'),
  {User} = require('./../server/models/user');

var id = '5b069de08b2a101e687a4a2b';

if (!ObjectID.isValid(id)) {
  console.log(`Document _id ${id} has an invalid format`);
} else {
  User.findById(id)
  .then(user => {
    if (!user) {
      return console.log('User _id not found:', id);
    }
    console.log('User by _id:', JSON.stringify(user, undefined, 2));
  })
  .catch(e => {
    console.log(e.message);
  });
}

// Todo.find({_id: id})
// .then(todos => {
//   if (todos.length === 0) {
//     return console.log('Invalid document _id:', id);
//   }
//   console.log('Todos', todos);
// })
// .catch(e => {
//   console.log(e.message);
// });

// Todo.findOne({
//   _id: id
// })
// .then(todo => {
//   if (!todo) {
//     return console.log('Invalid document _id:', id);
//   }
//   console.log('Todo', todo);
// })
// .catch(e => {
//   console.log(e.message);
// });


