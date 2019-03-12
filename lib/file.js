const fs = require('fs');
const path = require('path');

let file = {};

file.makePath = function (prePath, appid, userid, type) {
    userid = userid.toString();
    let temp = '0000' + userid;
    let result = path.normalize(`${prePath}/${appid}/`
        + temp.substr(temp.length - 3, 3) + '/'
        + userid + '/'
        + type + '/');
    file.mkDirs(result);
    return result;
};

file.mkDirs = function (dirpath) {
    if (!fs.existsSync(dirpath)) {
        file.mkDirs(path.dirname(dirpath));
        fs.mkdirSync(dirpath);
    }
};

file.getAllFiles = function(dirpath, files = []){
    let dir = fs.readdirSync(dirpath);
    dir.forEach(value => {
        let p = path.format({root: dirpath, base: value});
        let stat = fs.statSync(p);
        if (stat.isDirectory()) file.getAllFiles(p , files); else files.push(p);
    });
    return files;
};

module.exports = file;
