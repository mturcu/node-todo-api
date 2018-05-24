const
  express = require('express'),
  bodyParser = require('body-parser'),

  {mongoose} = require('./db/mongoose'),
  {Todo} = require('./models/todo'),
  {User} = require('./models/user');

const port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  // console.log(req.body);
  var todo = new Todo({
    text: req.body.text
  });
  todo.save()
  .then(doc => {
    console.log(`Saved todo ${doc}`);
    res.send(doc);
  })
  .catch(e => {
    console.log(`Unable to save todo: ${e.message}`);
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find()
  .then(todos => {
    res.send({todos});
  })
  .catch(e => {
    res.status(400).send(e);
  });
});

app.post('/users', (req, res) => {
  // console.log(req.body);
  var user = new User({
    email: req.body.email
  });
  user.save()
  .then(doc => {
    console.log(`Saved user ${doc}`);
    res.send(doc);
  })
  .catch(e => {
    console.log(`Unable to save user: ${e.message}`);
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = {app};

