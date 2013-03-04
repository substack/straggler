var straggler = require('../../');
var through = require('through');

var st = straggler(require('./config/duplex.json'));
var dv = st.divert('http://localhost:5000/beep');
dv.pipe(through(function (buf) {
    this.queue(String(buf).toUpperCase());
})).pipe(dv);
