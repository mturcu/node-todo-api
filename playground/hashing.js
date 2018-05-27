// const {SHA3} = require('crypto-js');
const jwt = require('jsonwebtoken');
const secret = 'S3KR3T';

var data = {
  id: 10
}

var token = jwt.sign(data, secret);
console.log(token);
var decoded = jwt.verify(token, secret);
console.log(decoded);


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