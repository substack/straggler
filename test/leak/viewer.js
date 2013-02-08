var straggler = require('../../');
var st = straggler(require('../config/viewer.json'));
var read = st.read('http://localhost:5000');
read('writer').pipe(process.stdout);

setInterval(function () {
    console.log(process.memoryUsage().heapUsed / 1024 / 1024);
}, 1000);
