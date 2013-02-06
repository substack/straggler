var secure = require('secure-peer');

var request = require('request');
var r = request.post('http://localhost:5000/read');

var JSONStream = require('JSONStream');
var through = require('through');

var parser = JSONStream.parse([ true ]);
var indexed;

parser.pipe(through(function (msg) {
    if (Array.isArray(msg)) {
        var r = indexed[msg[0]];
        var s = Buffer(msg[1], 'base64').toString().trim();
        console.log(r.name + ': ' + s);
    }
    else if (msg && typeof msg === 'object' && msg.keys) {
        indexed = Object.keys(msg.keys).reduce(function (acc, key) {
            var r = msg.keys[key];
            acc[r.index] = r;
            return acc;
        }, {});
    }
}));

var peer = secure(require('./viewer.json'));
var sec = peer(function (stream) { stream.pipe(parser) });
sec.pipe(r).pipe(sec);
