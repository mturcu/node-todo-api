const
  {ObjectID} = require('mongodb'),
  {mongoose} = require('./../server/db/mongoose'),
  {Todo} = require('./../server/models/todo'),
  {User} = require('./../server/models/user');

var id = '5b07ffd0901e0e4a41ebc6ef';
if (!ObjectID.isValid(id)) {
  console.log(`Document _id ${id} has an invalid format`);
} else {
  Todo.findByIdAndRemove(id)
  .then(todo => {
    if (!todo) {
      return console.log('Document _id not found:', id);
    }
    console.log('Document deleted:', JSON.stringify(todo, undefined, 2));
  })
  .catch(e => {
    console.log(e.message);
  });
}

//delete all documents:
// Todo.remove({})
// .then(res => {
//   console.log(res)
// })
// .catch(e => {
//   console.log(e.message);
// });

