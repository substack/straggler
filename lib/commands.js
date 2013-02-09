var config = require('./config');
var http = require('http');
var fs = require('fs');
var VERSION = require('../package.json').version;

exports.list = function (st, hub) {
    var read = st.read(hub);
    st.on('keys', function (keys) {
        var names = Object.keys(keys)
            .map(function (key) { return keys[key] })
            .filter(function (r) {
                return r.connections > 0 && r.write;
            })
            .map(function (r) { return r.name })
        ;
        if (names.length) console.log(names.join('\n'));
        read.end();
    });
};

exports.names = function (st, hub) {
    var read = st.read(hub, function (err, keys) {
        if (err) return showError(err);
        
        var names = Object.keys(keys).reduce(function (acc, key) {
            acc[keys[key].name] = true;
            return acc;
        }, {});
        names = Object.keys(names);
        
        if (names.length) console.log(names.join('\n'));
        read.end();
    });
};

exports.read = function (st, hub, argv) {
    var name = argv._[0];
    var read = st.read(hub);
    read(name).pipe(process.stdout);
};

exports.config = function (st, hub, argv) {
    var c = config(argv);
    
    if (argv._[0] === 'get') {
        return;
    }
    else if (argv._[0] === 'set') {
        c.set('', '');
        return;
    }
    
    c.loadFile(function (err, cfg) {
        if (err) return showError(err);
        
        console.log('{\n' + Object.keys(cfg).map(function (key) {
            if (key === 'keys') return '  "keys": [ ... ]';
            var value = JSON.stringify(cfg[key]);
            return '  ' + JSON.stringify(key) + ': ' + value;
        }).join(',\n') + '\n}');
    });
};

exports.hub = function (st, hub, argv) {
    var file = argv.authorized || argv._[0];
    if (!file) return showError('usage: straggler hub authorized.json');
    
    var src = fs.readFileSync(file);
    var authorized = JSON.parse(src);
    
    var port = argv.port === undefined ? 9600 : argv.port;
    var hub = st.createHub(authorized);
    var server = http.createServer(function (req, res) {
        if (hub.test(req.url)) return hub.handle(req, res);
        res.end('straggler version ' + VERSION);
    });
    server.listen(port);
    
    server.on('listening', function () {
        if (!argv.silent) {
            console.log('straggler listening on port ' + port);
        }
    });
};

function showError (err) {
    console.error(String(err));
    process.exit(1);
}
