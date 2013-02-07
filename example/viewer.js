var lousy = require('../');
var ly = lousy(require('./viewer.json'));
var read = ly.read('http://localhost:5000');
read('writer').pipe(process.stdout);
