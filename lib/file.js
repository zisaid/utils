const fs = require('fs');
const path = require('path');

let file = {};

file.makePath = function (prePath, appid, userid) {
    userid = userid.toString();
    let temp = '0000' + userid;
    let result = path.normalize(`/${prePath}/${appid}/` + temp.substr(temp.length - 3, 3) + '/' + userid);
    file.mkDirs(result);
    return result;
}

file.mkDirs = function (dirpath) {
    if (!fs.existsSync(dirpath)) {
        file.mkDirs(path.dirname(dirpath));
        fs.mkdirSync(dirpath);
    }
};

module.exports = file;
