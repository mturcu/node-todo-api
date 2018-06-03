"use strict";

const  express = require('express'),
    bodyParser = require('body-parser'),
             _ = require('lodash'),
    {ObjectID} = require('mongodb'),

    {mongoose} = require('./db/mongoose'),
        {Todo} = require('./models/todo'),
        {User} = require('./models/user'),
{authenticate} = require('./middleware/authenticate'),
        config = require('./config/config');

var app = express();

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
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

app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id})
  .then(todos => {
    res.send({todos});
  })
  .catch(e => {
    res.status(400).send({error: e.message});
    console.log(e.message);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  let {id} = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({error: `_id '${id}' has an invalid format`});
  } else {
    Todo.findOne({_creator: req.user._id, _id: id})
    .then(todo => {
      res.status(todo ? 200 : 404).send(todo ? {todo} : {error: `_id '${id}' not found`});
    })
    .catch(e => {
      res.status(400).send({error: e.message});
      console.log(e.message);
    });
  }
});

app.delete('/todos/:id', authenticate, (req, res) => {
  let {id} = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({error: `_id '${id}' has an invalid format`});
  } else {
    Todo.findOneAndRemove({_creator: req.user._id, _id: id})
    .then(todo => {
      res.status(todo ? 200 : 404).send(todo ? {todo} : {error: `_id '${id}' not found`});
    })
    .catch(e => {
      res.status(400).send({error: e.message});
      console.log(e.message);
    });
  }
});

app.patch('/todos/:id', authenticate, (req, res) => {
  let {id} = req.params;
  let body = _.pick(req.body, ['text', 'completed']);
  if (!ObjectID.isValid(id)) {
    return res.status(400).send({error: `_id '${id}' has an invalid format`});
  }
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  }
  Todo.findOneAndUpdate({_creator: req.user._id, _id: id}, { $set:  body }, { new: true })
  .then(todo => {
    res.status(todo ? 200 : 404).send(todo ? {todo} : {error: `_id '${id}' not found`});
  })
  .catch(e => {
    res.status(400).send({error: e.message});
    console.log(e.message);
  });
});

app.post('/users', (req, res) => {
  // console.log(req.body);
  let body = _.pick(req.body, ['email', 'password']);
  let user = new User(body);
  user.save()
  .then(() => user.generateAuthToken())
  .then(token => {
    console.log(`Saved user ${user}`);
    res.header(config.authHeader, token).send(user);
  })
  .catch(e => {
    console.log(`Unable to save user: ${e.message}`);
    res.status(400).send({error: e.message});
  });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  return User.findByCredentials(body.email, body.password)
  .then(user => { 
    return user.generateAuthToken()
    .then(token => res.status(200).header(config.authHeader, token).send(user));
  })
  .catch(e => {
    console.log(`Unable to login user: ${e.message}`);
    res.status(401).send({error: e.message});
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  return req.user.removeToken(req.token)
  .then(() => res.status(200).send({message: `User ${req.user.email} logged out`}))
  .catch(e => {
    console.log(`Unable to logout user: ${e.message}`);
    res.status(401).send({error: e.message});
  });
});

app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});

module.exports = {app};