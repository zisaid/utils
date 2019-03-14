const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');

let memLog = {};
let basePath = '/data/appdata/userinfo';
let port = 3109;

let mkDirs = function (dirpath) {
    if (!fs.existsSync(dirpath)) {
        mkDirs(path.dirname(dirpath));
        fs.mkdirSync(dirpath);
    }
};

let makePath = function (prePath, appid, userid, type) {
    userid = userid.toString();
    let temp = '0000' + userid;
    let result = path.normalize(`${prePath}/${appid}/`
        + temp.substr(temp.length - 3, 3) + '/'
        + userid + '/'
        + type + '/');
    mkDirs(result);
    return result;
};

let getAllFiles = function(dirpath, files = []){
    let dir = fs.readdirSync(dirpath);
    dir.forEach(value => {
        let p = path.format({root: dirpath, base: value});
        let stat = fs.statSync(p);
        if (!stat.isDirectory()) files.push(p);
    });
    return files;
};

let save = function (appid, userid, type, info, basePath, req) {
    let ip = '';
    try {
        ip = req.headers['x-forwarded-for']
            || req.connection.remoteAddress
            || req.socket.remoteAddress
            || req.connection.socket.remoteAddress
            || req.headers['remote_addr']
            || req.headers['client_ip'];
    } catch (e) {
    }
    let date = new Date();
    let logs = {
        date: date.valueOf(),
        ip: ip,
        ver: 1,
        appid: appid,
        userid: userid,
        type: type,
        info: info
    };
    let path = makePath(basePath, appid, userid, type);
    let month = '0' + (date.getMonth() + 1);
    let day = '0' + date.getDate();

    let dateNow = date.getFullYear()
        + month.substr(month.length - 2, 2)
        + day.substr(day.length - 2, 2);
    let strLog = JSON.stringify(logs);
    if (memLog[path]) {
        if (memLog[path].date !== dateNow) {
            fs.appendFile(path + memLog[path].date + '.txt', memLog[path].value.json('\n') + '\n', err => {
                if (err) console.log(err);
            });
            memLog[path] = {date: dateNow, value: [strLog]};
        } else {
            memLog[path].value.push(strLog);
        }
    } else {
        memLog[path] = {date: dateNow, value: [strLog]};
    }
};

let readByNumber = function (appid, userid, type, start, number, basePath) {
    let path = makePath(basePath, appid, userid, type);
    let count = start + number;
    let logs = (memLog[path]) ? [...memLog[path].value] : [];
    logs.reverse();
    if (logs.length < count) {
        let files = getAllFiles(path);
        for (let i = files.length - 1; i >= 0; i--) {
            let content = fs.readFileSync(files[i], 'utf8').split('\n');
            content.pop();
            content.reverse();
            logs = logs.concat(content);
            if (logs.length >= count) break;
        }
    }
    logs = logs.slice(start, count);
    return (logs);
};

let readByDay = function (appid, userid, type, day, basePath) {
    let path = makePath(basePath, appid, userid, type);
    let logs = [];
    if (memLog[path] && memLog[path].date === day) {
        logs = [...memLog[path].value];
        logs.reverse();
    }
    if (fs.existsSync(path + day + '.txt')) {
        let content = fs.readFileSync(path + day + '.txt', 'utf8').split('\n');
        content.pop();
        content.reverse();
        logs = logs.concat(content);
    }
    return (logs);
};

let saveMemLog = function () {
    let count = 0;
    for (let path in memLog) {
        fs.appendFileSync(path + memLog[path].date + '.txt', memLog[path].value.join('\n') + '\n');
        delete memLog[path];
        count++;
    }
    return ('save ' + count.toString() + ' to file done.');
};

http.createServer(function (request, response) {
    console.time(request.url);
    let req = url.parse(request.url, true);
    let pathname = req.pathname;
    let result = '';
    if (request.method !== 'GET') {
        result = 'err: please use get method.';
    } else {
        let lastPathName = pathname.substr(pathname.lastIndexOf('/') + 1);
        if (lastPathName === 'savemem') {
            result = saveMemLog();
        } else {
            let query = req.query;
            if (!query.appid || !query.userid || !query.type) {
                result = 'err: must have "appid", "userid", "type".';
            } else {
                switch (lastPathName) {
                    case 'put':
                        if (!query.info) {
                            result = 'err: must have "info".';
                        } else {
                            result = 'put done.';
                            save(query.appid, query.userid, query.type, query.info, basePath, request);
                        }
                        break;
                    case 'get':
                        if (!query.start || !query.number) {
                            result = 'err: "start" and "number" are must have.';
                        } else {
                            result = JSON.stringify(readByNumber(query.appid,
                                query.userid,
                                query.type,
                                query.start,
                                query.number,
                                basePath));
                        }
                        break;
                    case 'day':
                        if (!query.day) {
                            result = 'err: "day" is must have.';
                        } else {
                            result = JSON.stringify(readByDay(query.appid,
                                query.userid,
                                query.type,
                                query.day,
                                basePath));
                        }
                        break;
                    default:
                        result = 'err: I don\'t know what you want.';
                }
            }
        }
    }
    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    response.write(result);
    response.end();
    console.timeEnd(request.url);
}).listen(port, '0.0.0.0');
console.log('Log Server running at http://127.0.0.1:' + port + '/');
