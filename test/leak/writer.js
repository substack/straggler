var straggler = require('../../');
var st = straggler(require('../config/writer.json'));

var w = st.createWriteStream('http://localhost:5000/stream');
var iv = setInterval(function () {
    w.write('beep boop\n');
}, 100);

setInterval(function () {
    console.log(process.memoryUsage().heapUsed / 1024 / 1024);
}, 1000);
