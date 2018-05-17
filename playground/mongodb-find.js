const {MongoClient, ObjectID} = require('mongodb');
const dbName = 'TodoApp';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;

MongoClient.connect(mongoUrl, { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log(`Connected to database ${dbName} on MongoDB server`);
  const db = client.db(dbName);

  // db.collection('Todos').find({
  //   _id: new ObjectID('5afc073ea7e4ae1d6f11ea85')
  // }).toArray()
  // .then(docs => {
  //   console.log('Todos:\r' + JSON.stringify(docs, undefined, 2));
  // })
  // .catch(err => {
  //   console.log('Unable to fetch todos: ', err);
  // });

  db.collection('Todos').find().count()
  .then(count => {
    console.log(`Todos count: ${count}`);
  })
  .catch(err => {
    console.log('Unable to fetch todos: ', err);
  });

  db.collection('Users').find({ name: /Becca/ }).toArray()
  .then(users => {
    console.log(`Users found:\r${JSON.stringify(users, undefined, 2)}`);
  })
  .catch(err => {
    console.log('Unable to fetch users: ', err);
  });

  client.close();
});