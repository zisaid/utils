const fs = require('fs');
const data = require('./data');
const file = require('./file');
const ip = require('./ip');

let log = {};

log.save = function (appid, userid, type, info, basePath, req) {
    let logs = {data: data.timestamp(),
        ip: ip.remote(req),
        appid: appid,
        userid: userid,
        info: info};
    let path = file.makePath(basePath, appid, userid);
    fs.appendFile(path + type + '.txt', JSON.stringify(logs) + '\n', err => {
        if (err) console.log(err);
    });
    return 1;
};

module.exports = log;
