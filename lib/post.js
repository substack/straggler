var url = require('url');
var http = require('http');
var through = require('through');
var duplexer = require('duplexer');

module.exports = function (uri) {
    var u = url.parse(uri);
    var req = http.request({
        method: 'POST',
        host: u.hostname,
        port: Number(u.port),
        path: u.path,
        agent: false
    });
    req.setTimeout(Math.pow(2, 32) * 1000);
    
    var rs = through();
    var dup = duplexer(req, rs);
    
    dup.request = req;
    
    req.on('response', function (res) {
        dup.response = res;
        res.pipe(rs);
    });
    
    return dup;
};
