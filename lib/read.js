var secure = require('secure-peer');
var request = require('request');
var JSONStream = require('JSONStream');
var through = require('through');

module.exports = function (opts, cb) {
    var r = request.post(opts.hub + '/read');
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
            read.keys = msg.keys;
        }
    }));
    
    var peer = secure(opts.keys);
    var sec = peer(function (stream) { stream.pipe(parser) });
    sec.pipe(r).pipe(sec);
    
    var read = function (name) {
        var s = streams[name];
        if (!s) s = streams[name] = through();
        return s;
    };
    return read;
};
