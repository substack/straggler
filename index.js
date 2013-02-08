var secure = require('secure-peer');
var request = require('request');
var JSONStream = require('JSONStream');
var through = require('through');
var pause = require('pause-stream');

var createHub = require('./lib/hub');

module.exports = Straggler;

function Straggler (keys) {
    if (!(this instanceof Straggler)) return new Straggler(keys);
    this.keys = keys;
}

Straggler.prototype.createHub = function (authorized) {
    return createHub({
        keys: this.keys,
        authorized: authorized
    });
};

Straggler.prototype.read = function (uri, cb) {
    var r = request.post(uri + '/read');
    r.on('error', function (err) {
        if (cb) cb(err);
        cb = function () {};
    });
    
    var parser = JSONStream.parse([ true ]);
    var indexed;
    var streams = {};
    
    parser.pipe(through(function (msg) {
        if (Array.isArray(msg)) {
            var r = indexed[msg[0]];
            var buf = Buffer(msg[1], 'base64');
            
            var s = streams[r.name]
            if (!s) s = streams[r.name] = through();
            s.write(buf);
        }
        else if (msg && typeof msg === 'object' && msg.keys) {
            indexed = Object.keys(msg.keys).reduce(function (acc, key) {
                var r = msg.keys[key];
                acc[r.index] = r;
                return acc;
            }, {});
            reader.keys = msg.keys;
            if (cb) cb(null, msg.keys);
        }
    }));
    
    var peer = secure(this.keys);
    var sec = peer(function (stream) { stream.pipe(parser) });
    sec.pipe(r).pipe(sec);
    
    var reader = function (name) {
        var s = streams[name];
        if (!s) s = streams[name] = through();
        return s;
    };
    return reader;
};

Straggler.prototype.write = function (uri) {
    var peer = secure(this.keys);
    var sec = peer(function (stream) {
        p.pipe(stream);
        p.resume();
    });
    
    var r = request.post(uri + '/write');
    sec.pipe(r).pipe(sec);
    
    var p = pause();
    return p.pause();
};