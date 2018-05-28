const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'S3KR3T';

var password = 'pass123';

bcrypt.hash(password, 10)
.then(hash => console.log(hash));

var hashPwd = '$2a$10$ZeXvu0oIq07OpdkYHEhPbeNS9IaPtyi0NO4Ob4ptU9nUG/qXhTkAC';

bcrypt.compare(password, hashPwd)
.then(res => {
  console.log(res);
})
.catch(e => {
  console.log(e.message);
});

// var data = {
//   id: 10
// }

// var token = jwt.sign(data, secret);
// console.log(token);
// var decoded = jwt.verify(token, secret);
// console.log(decoded);


// const message = 'I am user number 3';
// var hash = SHA3(message).toString();
// console.log(message, '=>', hash, hash.length*4);

// var data = {
//   id: 4
// }

// var token = {
//   data,
//   hash: SHA3(JSON.stringify(data,undefined,2)+salt).toString()
// }

// // token.data.id = 5;
// // token.hash = SHA3(JSON.stringify(token.data,undefined,2)).toString();

// var resultHash = SHA3(JSON.stringify(token.data,undefined,2)+salt).toString();

// if (token.hash === resultHash) {
//   console.log('Data was not tampered with')
// } else {
//   console.log('Data was tampered with!')
// }