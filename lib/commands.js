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
