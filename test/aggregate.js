var test = require('tap').test;
var http = require('http');
var straggler = require('../');

var config = {
    hub: require('./config/hub.json'),
    viewer: require('./config/viewer.json'),
    writer: require('./config/writer.json'),
    authorized: require('./config/aggregate.json')
};

var hub = straggler(config.hub).createHub(config.authorized);
var server = http.createServer(function (req, res) {
    hub.handle(req, res);
});

test('aggregate', function (t) {
    t.plan(1);
    
    server.listen(0, function () {
        viewer(t);
    });
    
    t.on('end', function () {
        server.close();
    });
});

function viewer (t) {
    var port = server.address().port;
    
    var st = straggler(require('./config/viewer.json'));
    var rs = st.createReadStream('http://localhost:' + port + '/s');
    rs.on('open', function () { writer(t) });
    
    setTimeout(function () {
        t.equal(data, 'beep boop\n');
    }, 200);
    
    var data = '';
    rs.on('data', function (buf) { data += buf });
    
    t.on('end', function () { rs.end() });
}

function writer (t) {
    var st = straggler(config.writer);
    var port = server.address().port;
    var ws = st.createWriteStream('http://localhost:' + port + '/s');
    
    ws.write('beep ');
    
    setTimeout(function () {
        ws.end('boop\n');
    }, 50);
}
