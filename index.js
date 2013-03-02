var secure = require('secure-peer');
var through = require('through');

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
    
    if (opts.readable === undefined) opts.readable = true;
    if (opts.writable === undefined) opts.writable = true;
    
    var mode = (opts.readable ? 'r' : '') + (opts.writable ? 'w' : '');
    var type = { r: 'read', w: 'write', rw: 'duplex' }[mode];
    var req = post(uri + '/' + type);
    
    req.on('error', function (err) {
        if (cb) cb(err);
        else tr.emit('error', err)
        cb = null;
    });
    
    var peer = secure(this.keys);
    var sec = peer(function (stream) {
        if (cb) cb(null, tr);
        if (opts.readable) stream.pipe(tr);
        if (opts.writable) tr.pipe(stream);
        tr.resume();
    });
    sec.pipe(req).pipe(sec);
    
    var tr = through();
    tr.writable = opts.writable;
    tr.readable = opts.readable;
    tr.pause();
    return tr;
};
