const fs = require('fs');
const date = require('./date');
const file = require('./file');
const ip = require('./ip');
const http = require('http');
const url = require('url');

let log = {};
let memLog = {};

log.CreateNomalLogServer = function (basePath, port) {
    http.createServer(function (request, response) {
        console.time(request.url);
        let req = url.parse(request.url, true);
        let pathname = req.pathname;
        if (pathname === '/favicon.ico') {
            response.writeHead(404, {'Content-Type': 'text/html'});
        } else {
            response.writeHead(200, {'Content-Type': 'text/html'});
            if (request.method !== 'GET') {
                response.write('err: please use get method.');
            } else {
                let lastPathName = pathname.substr(pathname.lastIndexOf('/') + 1);
                if (lastPathName === 'savemem') {
                    response.write(log.saveMemLog());
                } else {
                    let query = req.query;
                    if (!query.appid) {
                        response.write('err: must have "appid".');
                    } else if (!query.userid) {
                        response.write('err: must have "userid".');
                    } else if (!query.type) {
                        response.write('err: must have log "type".');
                    } else {
                        switch (lastPathName) {
                            case 'put':
                                if (!query.info) {
                                    response.write('err: must have "info".');
                                } else {
                                    response.write('put done.');
                                    log.save(query.appid, query.userid, query.type, query.info, basePath, request);
                                }
                                break;
                            case 'get':
                                if (!query.start || !query.number) {
                                    response.write('err: "start" and "number" are must have.');
                                } else {
                                    response.write(JSON.stringify(log.readByNumber(query.appid,
                                        query.userid,
                                        query.type,
                                        query.start,
                                        query.number,
                                        basePath)));
                                }
                                break;
                            default:
                                response.write('err: I don\'t know what you want.');
                        }
                    }
                }
            }
        }
        response.end();
        console.timeEnd(request.url);
    }).listen(port, '0.0.0.0');
    console.log('Log Server running at http://127.0.0.1:' + port + '/');
};

log.save = function (appid, userid, type, info, basePath, req) {
    if (appid && userid && type && info) {
        let logs = {
            date: date.timestamp(),
            ip: ip.remote(req),
            ver: 1,
            appid: appid,
            userid: userid,
            type: type,
            info: info
        };
        let path = file.makePath(basePath, appid, userid, type);
        let dateNow = date.Format('YYYYMMDD', logs.date);
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
        return (1);
    } else {
        return ('err: appid/userid/type/info is(are) none.');
    }
};

log.readByNumber = function (appid, userid, type, start, number, basePath) {
    let path = file.makePath(basePath, appid, userid, type);
    let count = start + number;
    let logs = (memLog[path]) ? [...memLog[path].value] : [];
    logs.reverse();
    if (logs.length < count) {
        let files = file.getAllFiles(path);
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

log.readByDay = function (appid, userid, type, dateUse, basePath) {
    let path = file.makePath(basePath, appid, userid, type);
    let logs = [];
    if (memLog[path] && memLog[path].date === dateUse) {
        logs = [...memLog[path].value];
        logs.reverse();
    }
    if (fs.existsSync(path + dateUse + '.txt')) {
        let content = fs.readFileSync(path + dateUse + '.txt', 'utf8').split('\n');
        content.pop();
        content.reverse();
        logs = logs.concat(content);
    }
    return (logs);
}

log.saveMemLog = function () {
    let count = 0
    for (let path in memLog) {
        fs.appendFileSync(path + memLog[path].date + '.txt', memLog[path].value.join('\n') + '\n');
        delete memLog[path];
        count++;
    }
    return ('save ' + count.toString() + ' to file done.');
}

module.exports = log;
