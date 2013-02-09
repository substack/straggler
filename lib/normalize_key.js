module.exports = function (key) {
    return key
        .split('\n')
        .filter(function (line) { return !/^-----/.test(line) })
        .map(function (line) { return line.replace(/\s+/g, '') })
        .join('')
    ;
}
