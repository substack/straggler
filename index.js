var secure = require('secure-peer');
var through = require('through');
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

Straggler.prototype.createReadStream = function (uri, cb) {
    var opts = { readable: true, writable: false };
    return this.createStream(uri, opts, cb);
};

Straggler.prototype.createWriteStream = function (uri, cb) {
    var opts = { readable: false, writable: true };
    return this.createStream(uri, opts, cb);
};

Straggler.prototype.createStream = function (uri, opts, cb) {
    var self = this;
    if (!/^https?:/.test(uri)) uri = 'http://' + uri;
    if (typeof opts === 'function') { cb = opts; opts = {} }
    if (!opts) opts = {};
    
    var input = (opts.writable || opts.writable === undefined) && through();
    var output = (opts.readable || opts.readable === undefined) && through();
    
    var mode = (output ? 'r' : '') + (input ? 'w' : '');
    var type = { r: 'read', w: 'write', rw: 'duplex' }[mode];
    var req = post(uri + '/' + type);
    
    req.on('error', function (err) {
        if (cb) cb(err);
        else dup.emit('error', err)
        cb = null;
    });
    
    var peer = secure(this.keys);
    var sec = peer(function (stream) {
        if (cb) cb(null, dup);
        if (output) stream.pipe(output);
        if (input) input.pipe(stream);
        dup.on('close', stream.end.bind(stream));
        
        dup.emit('open');
        if (input) input.resume();
    });
    sec.pipe(req).pipe(sec);
    
    if (input) input.pause();
    var dup = input && output
        ? duplexer(input, output)
        : input || output
    ;
    return dup;
};
