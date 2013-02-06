var net = require('net');
var secure = require('secure-peer');

var request = require('request');
var r = request.post('http://localhost:5000/read');

var peer = secure(require('./viewer.json'));

var sec = peer(function (stream) {
    stream.pipe(process.stdout);
});
sec.pipe(r).pipe(sec);
