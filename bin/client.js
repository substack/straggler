var secure = require('secure-peer');
var peer = secure(require('./client.json'));

var request = require('request');
var r = request.post('http://localhost:5000/write');

var sec = peer(function (stream) {
    stream.write('beep boop\n');
});
sec.pipe(r).pipe(sec);
