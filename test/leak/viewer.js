var straggler = require('../../');
var st = straggler(require('../config/viewer.json'));
var rs = st.createReadStream('http://localhost:5000/stream');
rs.pipe(process.stdout);

setInterval(function () {
    console.log(process.memoryUsage().heapUsed / 1024 / 1024);
}, 1000);
