const
  express = require('express'),
  bodyParser = require('body-parser'),
  {ObjectID} = require('mongodb'),
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
    res.status(400).send({error: e.message});
  });
});

app.get('/todos', (req, res) => {
  Todo.find()
  .then(todos => {
    res.send({todos});
  })
  .catch(e => {
    res.status(400).send({error: e.message});
    console.log(e.message);
  });
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({error: `_id '${id}' has an invalid format`});
  } else {
    Todo.findById(id)
    .then(todo => {
      res.status(!todo ? 404 : 200).send(!todo ? {error: `_id '${id}' not found`} : {todo});
    })
    .catch(e => {
      res.status(400).send({error: e.message});
      console.log(e.message);
    });
  }
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
    res.status(400).send({error: e.message});
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = {app};

