var read = require('./lib/read');

exports = module.exports = function (keys) {
    return {
        read: function (uri) {
            var opts = { keys: keys, hub: uri };
            return read(opts);
        },
        createHub: function (opts) {
            opts.keys = keys;
            return exports.createHub(opts);
        }
    };
};

exports.createHub = require('./lib/hub');
