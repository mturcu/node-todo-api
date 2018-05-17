const {MongoClient, ObjectID} = require('mongodb');
const dbName = 'TodoApp';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;

// var obj = new ObjectID(); // generate new _id
// console.log(`New object _id = ${obj}`);

MongoClient.connect(mongoUrl, { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log(`Connected to database ${dbName} on MongoDB server`);
  const db = client.db(dbName);

  // db.collection('Todos').insertOne({
  //   text: 'Eat lunch',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert todo: ', err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });

  db.collection('Users').insertOne({
    name: 'Andrew',
    age: 25,
    location: 'Philadelphia'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert user: ', err);
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
    console.log(`Time stamp: ${result.ops[0]._id.getTimestamp()}`);
  });

  client.close(); //.then(console.log('MongoDB connection closed'));
});