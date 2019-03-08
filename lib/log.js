const data = require('./data');
const file = require('./file');

let log = {};

log.save = function (info, basePath, func) {
    info.data = data.timestamp();
    let appid = info.appid;
    let userid = info.userid;
    let path = file.makePath(basePath, appid, userid);


}

module.exports = log;
