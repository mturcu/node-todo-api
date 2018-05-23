var newUser = new User({
  email: 'john@doe.org'
});

newUser.save()
.then(doc => {
  console.log(`Saved user ${doc}`);
  mongoose.connection.close();
})
.catch(e => {
  console.log(`Unable to save user: ${e}`);
  mongoose.connection.close();
});

var newTodo = new Todo({
  text: ' Drink beer ',
  // completed: true,
  // completedAt: new Date().valueOf()
});

newTodo.save()
.then(doc => {
  console.log(`Saved todo ${doc}`);
  mongoose.connection.close();
})
.catch(e => {
  console.log(`Unable to save todo: ${e}`);
  mongoose.connection.close();
});