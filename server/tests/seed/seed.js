"use strict";

const {ObjectID} = require('mongodb'),
             jwt = require('jsonwebtoken'),

          {Todo} = require('../../models/todo'),
          {User} = require('../../models/user'),
{access, secret} = require('../../config/config');

const userOneId = new ObjectID(),
      userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'john@doe.org',
  password: 'userOnePass',
  tokens: [{
    access: access,
    token: jwt.sign({_id: userOneId, access}, secret).toString()
  }]
}, {
  _id: userTwoId,
  email: 'tom@fun.com',
  password: 'userTwoPass',
  tokens: [{
    access: access,
    token: jwt.sign({_id: userTwoId, access}, secret).toString()
  }]
}];

const todos = [{
  _id: new ObjectID(),               
  text: 'First test todo',
  _creator: userOneId
},{
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
},{
  _id: new ObjectID(),
  text: 'Third test todo',
  completed: true,
  completedAt: 777,
  _creator: userTwoId
}];

const populateTodos = done => {
  Todo.remove({})
  .then(() => {
    return Todo.insertMany(todos);
  })
  .then(() => done())
  .catch(e => done(e))
};

const populateUsers = done => {
  User.remove({})
  .then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo])
  })
  .then(() => done())
  .catch(e => done(e))
};

module.exports = {todos, populateTodos, users, populateUsers};