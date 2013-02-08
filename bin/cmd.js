#!/usr/bin/env node
var straggler = require('../');
var argv = require('optimist').argv;

var keys = require('../example/config/viewer.json')
var st = straggler(keys);

var cmd = argv._.shift();
if (!cmd) {
}
else if (cmd === 'list') {
    var read = st.read('http://localhost:5000', function (err, keys) {
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
}
else if (cmd === 'show') {
    st.read('http://localhost:5000', function (err, keys) {
        var names = Object.keys(keys).map(function (key) {
            return keys[key].name;
        });
        console.log(names.join('\n'));
    });
}
else if (cmd === 'read') {
    var read = st.read('http://localhost:5000');
    read('writer').pipe(process.stdout);
}
