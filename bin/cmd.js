#!/usr/bin/env node
var straggler = require('../');
var argv = require('optimist').argv;
var loadConfig = require('../lib/config');

var cmd = argv._.shift();
if (cmd === 'hub') {
    console.error('not yet implemented');
    return;
}

loadConfig(argv, function (err, config) {
    if (err) {
        console.error(err);
        return process.exit(1);
    }
    var st = straggler(config.keys);
    if (!config.hubs) config.hubs = {};
    
    var hub = /:/.test(config.hub)
        ? config.hub
        : config.hubs && config.hubs[config.hub]
    ;
    if (!hub) hub = process.env.STRAGGLER_HUB || config.hubs.default;
    if (!hub) {
        console.error('--hub not specified and no default hub configured.');
        return process.exit(1);
    }
    
    if (cmd === 'list') {
        var read = st.read(config.hub, function (err, keys) {
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
        st.read(config.hub, function (err, keys) {
            var names = Object.keys(keys).map(function (key) {
                return keys[key].name;
            });
            console.log(names.join('\n'));
        });
    }
    else if (cmd === 'read') {
        var name = argv._[0];
        var read = st.read(config.hub);
        read(name).pipe(process.stdout);
    }
});
