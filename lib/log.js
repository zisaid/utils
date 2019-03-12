const fs = require('fs');
const date = require('./date');
const file = require('./file');
const ip = require('./ip');
const http = require('http');
const url = require('url');

let log = {};
let memLog = {};

// 改为独立的服务器文件，加上灵活的路由
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
            appid: appid,
            userid: userid,
            type: type,
            info: info
        };
        let path = file.makePath(basePath, appid, userid, type);
        let dateNow = date.Format('YYYYMMDD', logs.date);
        let strLog = JSON.stringify(logs);
        if (memLog[path]) {
            if(memLog[path][dateNow]){
                memLog[path][dateNow].push(strLog);
            } else {
                memLog[path][dateNow] = [strLog];
            }
        } else {
            memLog[path] = {};
            memLog[path][dateNow] = [strLog];
        }
        let count = 0;
        for(let dateKey in memLog[path]){
            count += memLog[path][dateKey].length;
        }
        if(count > 500) {
            for(let dateKey in memLog[path]) {
                fs.appendFile(path + dateKey + '.txt', memLog[path][dateKey].json('\n') + '\n', err => {
                    if (err) console.log(err);
                });
                delete memLog[path][dateKey];
            }
        }
        return (1);
    } else {
        return ('err: appid/userid/type/info is(are) none.');
    }
};

// TODO 改为以天为单位保存
log.readByNumber = function (appid, userid, type, start, number, basePath) {
    let path = file.makePath(basePath, appid, userid, type);
    let count = start + number;
    let logs =  (memLog[path]) ? [...memLog[path]] : [];
    //需要合并后排序
    //logs.reverse();
    if(logs.length < count) {
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

// TODO 改为以天为单位保存
log.readByDay = function(){

}

// TODO 改为以天为单位保存
log.saveMemLog = function(){
    let count = 0
    for(let path in memLog){
        fs.appendFileSync(path + date.Format('YYYYMMDD') + '.txt', memLog[path].join('\n') + '\n');
        delete memLog[path];
        count ++;
    }
    return('save ' + count.toString() + ' to file done.');
}

module.exports = log;
