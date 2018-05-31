"use strict";

const
  expect = require('expect'),
  request = require('supertest'),
  {ObjectID} = require('mongodb'),

  {app} = require('./../server'),
  {Todo} = require('./../models/todo'),
  {User} = require('./../models/user'),
  {authHeader} = require('../config/config'),
  {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

  it('should create a new todo', done => {
    var text = 'Test todo text';
    request(app)
    .post('/todos')
    .send({text})
    .expect(200)
    .expect(res => {
      expect(res.body.text).toBe(text);
    })
    .end(err => {
      if (err) return done(err);
      Todo.find({text})
      .then(todos => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should not create todo with invalid body data', done => {
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, res) => {
      if (err) return done(err);
      Todo.find()
      .then(todos => {
        expect(todos.length).toBe(2);
        done();
      })
      .catch(e => done(e));
    });
  });

});

describe('GET /todos', () => {
  it('should fetch all todos', done => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect(res => {
      expect(res.body.todos.length).toBe(2);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {

  it('should return 200 and fetch a todo with an existing _id', done => {
    Todo.findOne()
    .then(todo => {
      let id = todo._id.toString();
      // console.log("ID:", id);
      request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end(done);
    });
  });

  it('should return 400 for an invalid _id', done => {
    let id = 'xxxxxxx';
    request(app)
    .get(`/todos/${id}`)
    .expect(400)
    .end(done);
  });

  it('should return 404 for a valid but non-existant _id', done => {
    let id = new ObjectID().toString();
    request(app)
    .get(`/todos/${id}`)
    .expect(404)
    .end(done);
  });

});

describe('DELETE /todos/:id', () => {

  it('should return 200 and delete a todo with an existing _id', done => {
    Todo.findOne()
    .then(todo => {
      let id = todo._id.toString();
      // console.log("ID:", id);
      request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) return done(err);
        Todo.findById(id)
        .then(td => {
          // console.log(td);}
          expect(td).toNotExist();
          done();
        })
        .catch(e => {
          console.log(e.message);
          done(e);
        });
      });
    })
    .catch(e => {
      console.log(e.message);
      done(e);
    });
  });

  it('should return 400 for an invalid _id', done => {
    let id = 'xxxxxxx';
    request(app)
    .delete(`/todos/${id}`)
    .expect(400)
    .end(done);
  });

  it('should return 404 for a valid but non-existant _id', done => {
    let id = new ObjectID().toString();
    request(app)
    .delete(`/todos/${id}`)
    .expect(404)
    .end(done);
  });

});

describe('PATCH /todos/:id', () => {

  it('should return 200 and UPDATE a todo to completed', done => {
    Todo.findOne({completed: false})
    .then(todo => {
      let id = todo._id.toString();
      let text = 'Test 01';
      request(app)
      .patch(`/todos/${id}`)
      .send({text, completed: true})
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
    })
    .catch(e => {
      console.log(e.message);
      done(e);
    });
  });

  it('should return 200 and UPDATE a todo to not completed', done => {
    Todo.findOne({completed: true})
    .then(todo => {
      let id = todo._id.toString();
      let text = 'Test 01';
      request(app)
      .patch(`/todos/${id}`)
      .send({text, completed: false})
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
    })
    .catch(e => {
      console.log(e.message);
      done(e);
    });
  });

  it('should return 400 for an invalid _id', done => {
    let id = 'xxxxxxx';
    request(app)
    .patch(`/todos/${id}`)
    .expect(400)
    .end(done);
  });

  it('should return 404 for a valid but non-existant _id', done => {
    let id = new ObjectID().toString();
    request(app)
    .patch(`/todos/${id}`)
    .expect(404)
    .end(done);
  });

});

describe('GET /users/me', () => {

  it('should return user if authenticated', done => {
    request(app)
    .get('/users/me')
    .set(authHeader, users[0].tokens[0].token)
    .expect(200)
    .expect(res => {
      expect(res.body._id).toBe(users[0]._id.toHexString());
      expect(res.body.email).toBe(users[0].email);
    })
    .end(done);
  });

  it('should return 401 if not authenticated', done => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect(res => {
      expect(res.body.error).toExist();
    })
    .end(done);
  });

});

describe('POST /users', () => {

  it('should create a user', done => {
    var newUser = {
      "email": "admin@infura.io",
      "password": "pwd0pwd1"
    };
    request(app)
    .post('/users')
    .send(newUser)
    .expect(200)
    .expect(res => {
      expect(res.headers[authHeader]).toExist();
      expect(res.body._id).toExist();
      expect(res.body.email).toBe(newUser.email);
    })
    .end(err => {
      if (err) return done(err);
      User.findOne({email: newUser.email})
      .then(user => {
        expect(user).toExist();
        expect(user.email).toBe(newUser.email);
        expect(user.password).toNotBe(newUser.password);
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should return validation errors if request invalid', done => {
    var newUser = {
      "email": "ad@in",
      "password": "p1"
    };
    request(app)
    .post('/users')
    .send(newUser)
    .expect(400)
    .expect(res => {
      expect(res.body.error).toExist();
    })
    .end(err => {
      if (err) return done(err);
      User.findOne({email: newUser.email})
      .then(user => {
        expect(user).toBe(null);
        done();
      })
      .catch(e => done(e));
    });
  });
  
  it('should not create user if email is in use', done => {
    var newUser = {
      "email": "john@doe.org",
      "password": "p1frsdSDA7"
    };
    request(app)
    .post('/users')
    .send(newUser)
    .expect(400)
    .expect(res => {
      expect(res.body.error).toExist();
    })
    .end(err => {
      if (err) return done(err);
      User.findOne({email: newUser.email})
      .then(user => {
        expect(user).toExist();
        done();
      })
      .catch(e => done(e));
    });
  });

});

describe('POST /users/login', () => {

  it('should login a user with valid email and password', done => {
    var myUser = {
      email: 'john@doe.org',
      password: 'userOnePass'
    };
    request(app)
    .post('/users/login')
    .send(myUser)
    .expect(200)
    .expect(res => {
      expect(res.headers[authHeader]).toExist();
      expect(res.body._id).toExist();
      expect(res.body.email).toBe(myUser.email);
    })
    .end(err => {
      if (err) return done(err);
      User.findOne({email: myUser.email})
      .then(user => {
        expect(user).toExist();
        expect(user.email).toBe(myUser.email);
        expect(user.tokens[0].token).toExist();
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should fail login for unknown email', done => {
    var myUser = {
      email: 'user@notme.org',
      password: 'userPass'
    };
    request(app)
    .post('/users/login')
    .send(myUser)
    .expect(401)
    .expect(res => {
      expect(res.headers[authHeader]).toNotExist();
      expect(res.body._id).toNotExist();
      expect(res.body.error).toExist();
    })
    .end(err => {
      if (err) return done(err);
      User.findOne({email: myUser.email})
      .then(user => {
        expect(user).toNotExist();
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should fail login for bad password', done => {
    var myUser = {
      email: 'john@doe.org',
      password: 'userPass'
    };
    request(app)
    .post('/users/login')
    .send(myUser)
    .expect(401)
    .expect(res => {
      expect(res.headers[authHeader]).toNotExist();
      expect(res.body._id).toNotExist();
      expect(res.body.error).toExist();
    })
    .end(err => {
      if (err) return done(err);
      done();
    });
  });

});