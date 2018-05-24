const
  expect = require('expect'),
  request = require('supertest');

const
  {app} = require('./../server'),
  {Todo} = require('./../models/todo'),
  {User} = require('./../models/user');

const todos = [{
  text: 'First test todo'
},{
  text: 'Second test todo'
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

  it('should fetch a todo with a specified _id', done => {
    Todo.findOne()
    .then(todo => {
      let id = todo._id.toString();
      console.log("ID:", id);
      request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end(done);
    });
  });

});