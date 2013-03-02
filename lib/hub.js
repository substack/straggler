var through = require('through');
var authorize = require('./auth');

module.exports = Hub;

function Hub (opts) {
    if (!(this instanceof Hub)) return new Hub(opts);
    
    this.auth = authorize(opts.keys, opts.authorized);
    this.streams = {};
};

Hub.prototype.getStream = function (name) {
    if (!this.streams[name]) {
        this.streams[name] = through();
    }
    return this.streams[name];
};

Hub.prototype.handle = function (req, res) {
    var m = this.test(req.url);
    if (!m) return false;
    req.connection.setTimeout(Math.pow(2,32) * 1000);
    var key = {
        read: 'handleRead',
        write: 'handleWrite',
        duplex: 'handleDuplex'
    }[m[2]];
    this[key](req, res);
    return true;
};

Hub.prototype.handleRead = function (req, res) {
    var self = this;
    var name = this.test(req.url)[1];
    req.pipe(self.auth('r', name, function (stream) {
        self.getStream(name).pipe(stream);
    })).pipe(res);
};

Hub.prototype.handleWrite = function (req, res) {
    var self = this;
    var name = this.test(req.url)[1];
    req.pipe(self.auth('w', name, function (stream) {
        stream.pipe(self.getStream(name));
    })).pipe(res);
};

Hub.prototype.handleDuplex = function (req, res) {
    var self = this;
    var name = this.test(req.url)[1];
    req.pipe(self.auth('rw', name, function (stream) {
        stream.pipe(self.getStream(name)).pipe(stream);
    })).pipe(res);
};

Hub.test = Hub.prototype.test = function (url) {
    var re = RegExp('^/(.+)/(read|write|duplex)$');
    return re.exec(url);
};
