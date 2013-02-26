var secure = require('secure-peer');
var JSONStream = require('JSONStream');
var through = require('through');
var pause = require('pause-stream');
var duplexer = require('duplexer');

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var createHub = require('./lib/hub');
var post = require('./lib/post');

exports = module.exports = Straggler;
inherits(Straggler, EventEmitter);

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
    var self = this;
    if (!/^https?:/.test(uri)) uri = 'http://' + uri;
    
    var req = post(uri + '/read');
    req.on('error', function (err) {
        if (cb) cb(err);
        else self.emit('error', err)
        cb = function () {};
    });
    
    var parser = JSONStream.parse([ true ]);
    var indexed;
    var streams = {};
    
    function createStream (name) {
        return streams[name] = through();
    }
    
    parser.pipe(through(function (msg) {
        if (Array.isArray(msg)) {
            var r = indexed[msg[0]];
            var buf = Buffer(msg[1], 'base64');
            
            var s = streams[r.name]
            if (!s) s = createStream(r.name);
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
            self.emit('keys', msg.keys);
        }
    }));
    
    var peer = secure(this.keys);
    var sec = peer(function (stream) { stream.pipe(parser) });
    sec.pipe(req).pipe(sec);
    
    var reader = function (name) {
        return streams[name] || createStream(name);
    };
    reader.secure = sec;
    reader.end = sec.end.bind(sec);
    return reader;
};

Straggler.prototype.write = function (uri) {
    if (!/^https?:/.test(uri)) uri = 'http://' + uri;
    
    var peer = secure(this.keys);
    var sec = peer(function (stream) {
        p.pipe(stream);
        p.resume();
    });
    
    var r = post(uri + '/write');
    sec.pipe(r).pipe(sec);
    
    var p = pause();
    return p.pause();
};

Straggler.prototype.duplex = function (uri, cb) {
    var self = this;
    var read = self.read(uri, cb);
    return function (name) {
        return duplexer(self.write(uri), read(name));
    };
};
