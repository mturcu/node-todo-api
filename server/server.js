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

const app = express();

app.use(bodyParser.json());

app.post('/todos', authenticate, async (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  try {
    const doc = await todo.save();
    console.log(`Saved todo ${doc}`);
    res.send(doc);
  } catch(e) {
    console.log(`Unable to save todo: ${e.message}`);
    res.status(400).send({error: e.message});
  }
});

app.get('/todos', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({_creator: req.user._id});
    res.send({todos});
  } catch(e) {
    res.status(400).send({error: e.message});
    console.log(e.message);
  }
});

app.get('/todos/:id', authenticate, async (req, res) => {
  const {id} = req.params;
  if (!ObjectID.isValid(id)) return res.status(400).send({error: `_id '${id}' has an invalid format`});
  try {
    const todo = await Todo.findOne({_creator: req.user._id, _id: id});
    res.status(todo ? 200 : 404).send(todo ? {todo} : {error: `_id '${id}' not found`});
  } catch(e) {
    res.status(400).send({error: e.message});
    console.log(e.message);
  }
});

app.delete('/todos/:id', authenticate, async (req, res) => {
  const {id} = req.params;
  if (!ObjectID.isValid(id)) return res.status(400).send({error: `_id '${id}' has an invalid format`});
  try {
    const todo = await Todo.findOneAndRemove({_creator: req.user._id, _id: id});
    res.status(todo ? 200 : 404).send(todo ? {todo} : {error: `_id '${id}' not found`});
  } catch(e) {
    res.status(400).send({error: e.message});
    console.log(e.message);
  }
});

app.patch('/todos/:id', authenticate, async (req, res) => {
  const {id} = req.params;
  const body = _.pick(req.body, ['text', 'completed']);
  if (!ObjectID.isValid(id)) return res.status(400).send({error: `_id '${id}' has an invalid format`});
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  try {
    const todo = await Todo.findOneAndUpdate({_creator: req.user._id, _id: id}, {$set: body}, {new: true});
    res.status(todo ? 200 : 404).send(todo ? {todo} : {error: `_id '${id}' not found`});
  } catch(e) {
    res.status(400).send({error: e.message});
    console.log(e.message);
  }
});

app.post('/users', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);
    user = await user.save();
    const token = await user.generateAuthToken();
    console.log(`Saved user ${user}`);
    res.header(config.authHeader, token).send(user);
  } catch(e) {
    console.log(`Unable to save user: ${e.message}`);
    res.status(400).send({error: e.message});
  }
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.status(200).header(config.authHeader, token).send(user);
  } catch(e) {
    console.log(`Unable to login user: ${e.message}`);
    res.status(401).send({error: e.message});
  }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send({message: `User ${req.user.email} logged out`});
  } catch(e) {
    console.log(`Unable to logout user: ${e.message}`);
    res.status(401).send({error: e.message});
  };
});

app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});

module.exports = {app};