var through = require('through');
var JSONStream = require('JSONStream');
var authorize = require('./auth');

module.exports = Hub;

var re = {
    handleRead: RegExp('^/read($|[\/?])'),
    handleWrite: RegExp('^/write($|[\/?])'),
};

function Hub (opts) {
    if (!(this instanceof Hub)) return new Hub(opts);
    
    this.auth = authorize(opts.keys, opts.authorized);
    this.feed = through();
};

Hub.prototype.handle = function (req, res) {
    var key = this.test(req.url);
    if (!key) return false;
    req.connection.setTimeout(Math.pow(2,32) * 1000);
    this[key](req, res);
    return true;
};

Hub.prototype.handleRead = function (req, res) {
    var self = this;
    req.pipe(self.auth('r', function (stream) {
        var stringify = JSONStream.stringify();
        stringify.pipe(stream);
        stringify.write({ keys: self.auth.keys });
        self.feed.pipe(stringify);
    })).pipe(res);
};

Hub.prototype.handleWrite = function (req, res) {
    var self = this;
    req.pipe(self.auth('w', function (stream) {
        stream.pipe(through(write)).pipe(self.feed, { end: false });
        
        function write (msg) {
            var r = self.auth.keys[stream.key];
            this.emit('data', [ r.index, msg.toString('base64') ]);
        }
    })).pipe(res);
};

Hub.test = Hub.prototype.test = function (url) {
    var keys = Object.keys(re);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (re[key].test(url)) return key;
    }
};
