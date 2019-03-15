const nlp = require('../nlp/index');
const crypto = require('./lib/crypto');
const date = require('./lib/date');
const file = require('./lib/file');
const ip = require('./lib/ip');
const text = require('./lib/text');

module.exports = {
    nlp: nlp,
    crypto: crypto,
    date: date,
    file: file,
    ip: ip,
    text: text
};
