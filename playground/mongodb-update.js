const {MongoClient, ObjectID} = require('mongodb');
const dbName = 'TodoApp';
const mongoUrl = `mongodb://localhost:27017/${dbName}`;

MongoClient.connect(mongoUrl, { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log(`Connected to database ${dbName} on MongoDB server`);
  const db = client.db(dbName);

  // db.collection('Todos').findOneAndUpdate(
  // {
  //   _id: new ObjectID('5afd78c666b5a7eaf4f04795')
  // },
  // {
  //   $set: { completed: true }
  // },
  // {
  //   returnOriginal: false
  // })
  // .then(res => {
  //   console.log(`Updated ${JSON.stringify(res.value, undefined, 2)}.`);
  // })
  // .catch(err => {
  //   console.log('Unable to update document: ', err);
  // });
  
  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5afc2876cbdce657f877ceb1')
  }, {
    $set: { name: 'Allie Becca Malone' },
    $inc: { age: +1 }
  }, {
    returnOriginal: false
  })
  .then(res => {
    console.log(`Updated ${JSON.stringify(res.value, undefined, 2)}.`);
  })
  .catch(err => {
    console.log('Unable to update document: ', err);
  });

  client.close();
});