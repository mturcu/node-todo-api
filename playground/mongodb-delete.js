const {MongoClient, ObjectID} = require('mongodb');
const dbName = 'TodoApp';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;

MongoClient.connect(mongoUrl, { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log(`Connected to database ${dbName} on MongoDB server`);
  const db = client.db(dbName);

  db.collection('Users').deleteMany({
    name: 'Andrew'
  })
  .then(res => {
    console.log(`Deleted ${res.deletedCount} user(s).`);
  })
  .catch(err => {
    console.log('Unable to delete users: ', err);
  });
  
  // db.collection('Todos').deleteOne({
  //   _id: new ObjectID('5afd70c14c368ee61c234bfe')
  // })
  // .then(res => {
  //   console.log(`Deleted ${res.result.n} document(s)`);
  // })
  // .catch(err => {
  //   console.log('Unable to delete todos: ', err);
  // });

//   db.collection('Users').findOneAndDelete({
//     _id: new ObjectID('5afc0a752d124e2000ef36b2')
//   })
//   .then(res => {
//     console.log(res.ok === 1 ? `Deleted:\r${JSON.stringify(res.value,undefined,2)}` : 'Document not found, unable to delete.');
//   })
//   .catch(err => {
//     console.log('Unable to delete user: ', err);
//   });

  client.close();
});