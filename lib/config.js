var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var createKeys = require('rsa-json');
var env = process.env;

module.exports = function (argv, cb) {
    var configEnv = argv.env || env.STRAGGLER_ENV || 'default';
    var configFile = argv.config || env.STRAGGLER_CONFIG
        || path.join(env.HOME, '.config', 'straggler', configEnv + '.json')
    ;
    mkdirp(path.dirname(configFile), function (err) {
        if (err) return cb(err);
        fs.exists(configFile, function (ex) {
            if (ex) return loadFile(cb);
            
            createKeys(function (err, pair) {
                if (err) cb(err)
                else savePair(pair, cb)
            });
        });
    });
    
    function savePair (pair, cb) {
        var src = JSON.stringify({ keys: pair, hubs: {} }, null, 2);
        fs.writeFile(configFile, src, function (err) {
            if (err) return cb(err);
            loadFile(cb);
        });
    }
    
    function loadFile (cb) {
        fs.readFile(configFile, function (err, src) {
            if (err) return cb(err);
            var config = Object.keys(argv).reduce(function (acc, key) {
                acc[key] = argv[key];
                return acc;
            }, JSON.parse(src));
            cb(null, config);
        });
    }
};
