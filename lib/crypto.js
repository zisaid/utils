const cryptoSrc = require('crypto');
let crypto = {};

crypto.md5 = function (key) {
    return cryptoSrc.createHash('md5').update(key, "utf-8").digest('hex');
};


module.exports = crypto;
