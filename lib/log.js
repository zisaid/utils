const fs = require('fs');
const data = require('./data');
const file = require('./file');
const ip = require('./ip');
const http = require('http');
const url = require('url');

let log = {};

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
                        if(!query.start || !query.number) {
                            response.write('err: "start" and "number" are must have.');
                        } else {
                            response.write(JSON.stringify(log.read(query.appid,
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
        response.end();
        console.timeEnd(request.url);
    }).listen(port, '0.0.0.0');
    console.log('Log Server running at http://127.0.0.1:' + port + '/');
};

log.save = function (appid, userid, type, info, basePath, req) {
    if (appid && userid && type && info) {
        let logs = {
            data: data.timestamp(),
            ip: ip.remote(req),
            appid: appid,
            userid: userid,
            type: type,
            info: info
        };
        let path = file.makePath(basePath, appid, userid, type);
        fs.appendFile(path + data.Format('YYYYMMDD') + '.txt', JSON.stringify(logs) + '\n', err => {
            if (err) console.log(err);
        });
        return (1);
    } else {
        return ('err: appid/userid/type/info is(are) none.');
    }
};

log.read = function (appid, userid, type, start, number, basePath) {
    let path = file.makePath(basePath, appid, userid, type);
    let files = file.getAllFiles(path);
    let logs = [];
    for(let i = files.length - 1; i >= 0 ; i--){
        let content = fs.readFileSync(files[i], 'utf8').split('\n');
        content.pop();
        content.reverse();
        logs = logs.concat(content);
        if(logs.length > start + number) break;
    }
    logs = logs.slice(start, start + number);
    return(logs);
};

module.exports = log;
