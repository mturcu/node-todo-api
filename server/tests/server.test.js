"use strict";

const
  expect = require('expect'),
  test = require('supertest'),
  {ObjectID} = require('mongodb'),

  {app} = require('./../server'),
  {Todo} = require('./../models/todo'),
  {User} = require('./../models/user'),
  {authHeader, access} = require('../config/config'),
  {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

  it('should create a new todo', done => {
    let text = 'Test todo text';
    test(app)
    .post('/todos')
    .set(authHeader, users[0].tokens[0].token)
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
    test(app)
    .post('/todos')
    .set(authHeader, users[0].tokens[0].token)
    .send({})
    .expect(400)
    .end((err, res) => {
      if (err) return done(err);
      Todo.find()
      .then(todos => {
        expect(todos.length).toBe(3);
        done();
      })
      .catch(e => done(e));
    });
  });

});

describe('GET /todos', () => {
  it('should fetch all todos created by the authenticated user', done => {
    test(app)
    .get('/todos')
    .set(authHeader, users[0].tokens[0].token)
    .expect(200)
    .expect(res => {
      expect(res.body.todos.length).toBe(1);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {

  it('should return 200 and fetch a todo with an existing _id', done => {
    Todo.findOne({_creator: users[0]._id})
    .then(todo => {
      let id = todo._id.toString();
      // console.log("ID:", id);
      test(app)
      .get(`/todos/${id}`)
      .set(authHeader, users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end(done);
    });
  });

  it('should return 404 and not fetch a todo created by another user', done => {
    Todo.findOne({_creator: users[0]._id})
    .then(todo => {
      let id = todo._id.toString();
      // console.log("ID:", id);
      test(app)
      .get(`/todos/${id}`)
      .set(authHeader, users[1].tokens[0].token)
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBeTruthy();
      })
      .end(done);
    });
  });

  it('should return 400 for an invalid _id', done => {
    let id = 'xxxxxxx';
    test(app)
    .get(`/todos/${id}`)
    .set(authHeader, users[0].tokens[0].token)
    .expect(400)
    .end(done);
  });

  it('should return 404 for a valid but non-existant _id', done => {
    let id = new ObjectID().toString();
    test(app)
    .get(`/todos/${id}`)
    .set(authHeader, users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

});

describe('PATCH /todos/:id', () => {

  it('should return 200 and UPDATE a todo to completed', done => {
    Todo.findOne({_creator: users[0]._id, completed: false})
    .then(todo => {
      let id = todo._id.toString();
      let text = 'Test 01';
      test(app)
      .patch(`/todos/${id}`)
      .set(authHeader, users[0].tokens[0].token)
      .send({text, completed: true})
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
    })
    .catch(e => {
      console.log(e.message);
      done(e);
    });
  });

  it('should return 200 and UPDATE a todo to not completed, clearing "completedAt"', done => {
    Todo.findOne({_creator: users[1]._id, completed: true})
    .then(todo => { console.log(todo);
      let id = todo._id.toString();
      let text = 'Test 01';
      test(app)
      .patch(`/todos/${id}`)
      .set(authHeader, users[1].tokens[0].token)
      .send({text, completed: false})
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
    })
    .catch(e => {
      console.log(e.message);
      done(e);
    });
  });

  it('should return 404 and not UPDATE a todo created by another user', done => {
    Todo.findOne({_creator: users[0]._id, completed: false})
    .then(todo => {
      let id = todo._id.toString();
      let text = 'Test 01';
      test(app)
      .patch(`/todos/${id}`)
      .set(authHeader, users[1].tokens[0].token)
      .send({text, completed: true})
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBeTruthy();
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
    test(app)
    .patch(`/todos/${id}`)
    .set(authHeader, users[0].tokens[0].token)
    .expect(400)
    .end(done);
  });

  it('should return 404 for a valid but non-existant _id', done => {
    let id = new ObjectID().toString();
    test(app)
    .patch(`/todos/${id}`)
    .set(authHeader, users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

});

describe('DELETE /todos/:id', () => {

  it('should return 200 and delete a todo with an existing _id', done => {
    Todo.findOne({_creator: users[1]._id})
    .then(todo => {
      let id = todo._id.toHexString();
      // console.log("ID:", id);
      test(app)
      .delete(`/todos/${id}`)
      .set(authHeader, users[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end(err => {
        if (err) return done(err);
        return Todo.findById(id)
        .then(td => {
          // console.log(td);}
          expect(td).toBeFalsy();
          done();
        });
      });
    })
    .catch(e => {
      console.log(e.message);
      done(e);
    });
  });

  it('should return 404 and not delete a todo created by another user', done => {
    Todo.findOne({_creator: users[1]._id})
    .then(todo => {
      let id = todo._id.toHexString();
      // console.log("ID:", id);
      test(app)
      .delete(`/todos/${id}`)
      .set(authHeader, users[0].tokens[0].token)
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBeTruthy();
      })
      .end(err => {
        if (err) return done(err);
        return Todo.findById(id)
        .then(td => {
          // console.log(td);}
          expect(td).toBeTruthy();
          done();
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
    test(app)
    .delete(`/todos/${id}`)
    .set(authHeader, users[0].tokens[0].token)
    .expect(400)
    .end(done);
  });

  it('should return 404 for a valid but non-existant _id', done => {
    let id = new ObjectID().toString();
    test(app)
    .delete(`/todos/${id}`)
    .set(authHeader, users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

});

describe('GET /users/me', () => {

  it('should return user if authenticated', done => {
    test(app)
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
    test(app)
    .get('/users/me')
    .expect(401)
    .expect(res => {
      expect(res.body.error).toBeTruthy();
    })
    .end(done);
  });

});

describe('POST /users', () => {

  it('should create a user', done => {
    let newUser = {
      "email": "admin@infura.io",
      "password": "pwd0pwd1"
    };
    test(app)
    .post('/users')
    .send(newUser)
    .expect(200)
    .expect(res => {
      expect(res.headers[authHeader]).toBeTruthy();
      expect(res.body._id).toBeTruthy();
      expect(res.body.email).toBe(newUser.email);
    })
    .end(err => {
      if (err) return done(err);
      User.findOne({email: newUser.email})
      .then(user => {
        expect(user).toBeTruthy();
        expect(user.email).toBe(newUser.email);
        expect(user.password).not.toBe(newUser.password);
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should return validation errors if test invalid', done => {
    let newUser = {
      "email": "ad@in",
      "password": "p1"
    };
    test(app)
    .post('/users')
    .send(newUser)
    .expect(400)
    .expect(res => {
      expect(res.body.error).toBeTruthy();
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
    let newUser = {
      "email": "john@doe.org",
      "password": "p1frsdSDA7"
    };
    test(app)
    .post('/users')
    .send(newUser)
    .expect(400)
    .expect(res => {
      expect(res.body.error).toBeTruthy();
    })
    .end(err => {
      if (err) return done(err);
      User.findOne({email: newUser.email})
      .then(user => {
        expect(user).toBeTruthy();
        done();
      })
      .catch(e => done(e));
    });
  });

});

describe('POST /users/login', () => {

  it('should login a user with valid email and password and return auth token', done => {
    let myUser = {
      email: users[1].email,
      password: users[1].password
    };
    test(app)
    .post('/users/login')
    .send(myUser)
    .expect(200)
    .expect(res => {
      expect(res.headers[authHeader]).toBeTruthy();
      expect(res.body._id).toBeTruthy();
      expect(res.body.email).toBe(myUser.email);
    })
    .end((err, res) => {
      if (err) return done(err);
      User.findById(users[1]._id)
      .then(user => {
        expect(user).toBeTruthy();
        expect(user.email).toBe(myUser.email);
        expect(user.toObject().tokens[1]).toMatchObject({
          access,
          token: res.headers[authHeader]
        });
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should fail login for unknown email', done => {
    let myUser = {
      email: 'user@notme.org',
      password: 'somePass'
    };
    test(app)
    .post('/users/login')
    .send(myUser)
    .expect(401)
    .expect(res => {
      expect(res.headers[authHeader]).toBeFalsy();
      expect(res.body._id).toBeFalsy();
      expect(res.body.error).toBeTruthy();
    })
    .end(err => {
      if (err) return done(err);
      User.findOne({email: myUser.email})
      .then(user => {
        expect(user).toBeFalsy();
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should fail login for bad password', done => {
    let myUser = {
      email: users[1].email,
      password: users[1].password + 'x'
    };
    test(app)
    .post('/users/login')
    .send(myUser)
    .expect(401)
    .expect(res => {
      expect(res.headers[authHeader]).toBeFalsy();
      expect(res.body._id).toBeFalsy();
      expect(res.body.error).toBeTruthy();
    })
    .end(err => {
      if (err) return done(err);
      User.findById(users[1]._id)
      .then(user => {
        expect(user.tokens.length).toBe(1);
        done();
      })
      .catch(e => done(e));
    });
  });

});

describe('DELETE /users/me/token', () => {

  it('should log out a user with a valid token', done => {
    let token = users[0].tokens[0].token;
    test(app)
    .delete('/users/me/token')
    .set(authHeader, token)
    .expect(200)
    .expect(res => {
      expect(res.headers[authHeader]).toBeFalsy();
      expect(res.body.message).toBeTruthy();
    })
    .end(err => {
      if (err) return done(err);
      User.findById(users[0]._id)
      .then(user => {
        expect(user).toBeTruthy();
        expect(user.tokens.length).toBe(0);
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should fail logout for unknown token', done => {
    let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjBmYWVmY2M1ODIyYTFmYjg4NzM1N2MiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTI3NzU0NDkyfQ.t-ctT4T7SLTAKVhFRDc4WwXgpOSRT5XXEHrAgAuYw30';
    test(app)
    .delete('/users/me/token')
    .set(authHeader, token)
    .expect(401)
    .expect(res => {
      expect(res.headers[authHeader]).toBeFalsy();
      expect(res.body._id).toBeFalsy();
      expect(res.body.error).toBeTruthy();
    })
    .end(err => {
      if (err) return done(err);
      User.findOne({ tokens: {token} })
      .then(user => {
        expect(user).toBeFalsy();
        done();
      })
      .catch(e => done(e));
    });
  });

});