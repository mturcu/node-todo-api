const
  expect = require('expect'),
  request = require('supertest'),
  {ObjectID} = require('mongodb');

const
  {app} = require('./../server'),
  {Todo} = require('./../models/todo'),
  {User} = require('./../models/user');

const todos = [{
  text: 'First test todo'
},{
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];

beforeEach(done => {
  Todo.remove({})
  .then(() => {
    return Todo.insertMany(todos);
  })
  .then(() => done())
  .catch(e => done(e))
});

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
    .end((err, res) => {
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