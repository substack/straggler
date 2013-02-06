var net = require('net');
var secure = require('secure-peer');

var peer = secure(require('./client.json'));

var sec = peer(function (stream) {
    stream.write('beep boop\n');
});
sec.pipe(net.connect(5000)).pipe(sec);
