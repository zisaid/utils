const cryptoSrc = require('crypto');
let crypto = {};

crypto.md5 = function (key) {
    return cryptoSrc.createHash('md5').update(key, 'utf-8').digest('hex');
};

crypto.unicode = function (key) {
    const keys = key + (new Date()).valueOf().toString();
    return crypto.md5(keys);
}

module.exports = crypto;
