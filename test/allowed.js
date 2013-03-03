var test = require('tap').test;
var http = require('http');
var straggler = require('../');

var config = {
    hub: require('./config/hub.json'),
    viewer: require('./config/viewer.json'),
    writer: require('./config/writer.json'),
    authorized: require('./config/allowed.json')
};

var hub = straggler(config.hub).createHub(config.authorized);
var server = http.createServer(function (req, res) {
    hub.handle(req, res);
});

test('allowed streams', function (t) {
    t.plan(7);
    server.listen(0, function () { rw(t) });
    
    t.on('end', function () {
        server.close();
    });
});

function rw (t) {
    var port = server.address().port;
    
    var rst = straggler(config.viewer);
    var r1 = rst.createReadStream('http://localhost:' + port + '/one');
    var r2 = rst.createReadStream('http://localhost:' + port + '/two');
    var r3 = rst.createReadStream('http://localhost:' + port + '/three');
    
    r1.on('open', function () {
        t.pass('read from 1');
        var data = '';
        r1.on('data', function (buf) { data += buf });
        setTimeout(function () { t.equal(data, 'a') }, 500);
    });
    r2.on('open', function () { t.pass('read from 2') });
    r3.on('open', function () { t.pass('read from 3') });
    r2.on('data', function () { t.fail('should not get data from 2') });
    r3.on('data', function () { t.fail('read from 3 not allowed') });
    
    var wst = straggler(config.writer);
    var w1 = wst.createWriteStream('http://localhost:' + port + '/one');
    var w2 = wst.createWriteStream('http://localhost:' + port + '/two');
    var w3 = wst.createWriteStream('http://localhost:' + port + '/three');
    
    w1.on('open', function () { t.pass('write from 1') });
    w1.write('a');
    w2.on('open', function () { t.pass('write from 2 not allowed') });
    w2.write('b');
    w3.on('open', function () { t.pass('write from 3') });
    w3.write('c');
    
    t.on('end', function () {
        w1.end(); w2.end(); w3.end();
        r1.end(); r2.end(); r3.end();
    });
}
