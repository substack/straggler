var straggler = require('../');
var through = require('through');

var st = straggler(require('./config/duplex.json'));
var w = st.createDuplexStream('http://localhost:5000/beep');
w.pipe(through(function (buf) {
    this.queue(String(buf).toUpperCase());
})).pipe(w);
