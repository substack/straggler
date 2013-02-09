var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var createKeys = require('rsa-json');
var env = process.env;

module.exports = Config;

function Config (argv) {
    if (!(this instanceof Config)) return new Config(argv);
    this.argv = argv;
}

Config.prototype.load = function (cb) {
    var self = this;
    var configFile = self.getFile();
    
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
        self.save({ keys: pair, hubs: {} }, function (err) {
            if (err) return cb(err);
            loadFile(cb);
        });
    }
    
    function loadFile (cb) {
        self.loadFile(function (err, config) {
            if (err) return cb(err);
            
            var merged = Object.keys(self.argv)
                .reduce(function (acc, key) {
                    acc[key] = self.argv[key];
                    return acc;
                }, config)
            ;
            cb(null, merged);
        });
    }
};

Config.prototype.loadFile = function (cb) {
    var configFile = this.getFile();
    fs.readFile(configFile, function (err, src) {
        if (err) cb(err)
        else cb(null, JSON.parse(src))
    });
};

Config.prototype.getFile = function () {
    var configEnv = this.argv.env || env.STRAGGLER_ENV || 'default';
    return this.argv.config || env.STRAGGLER_CONFIG
        || path.join(env.HOME, '.config', 'straggler', configEnv + '.json')
    ;
};

Config.prototype.save = function (config, cb) {
    var src = JSON.stringify(config, null, 2);
    var configFile = this.getFile(this.argv);
    fs.writeFile(configFile, src, cb);
};
