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
    console.log(`Unable to save todo: ${e}`);
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = {app};

