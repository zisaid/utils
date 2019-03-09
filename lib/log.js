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
                        response.write('you want get.');
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
    let logs = {
        data: data.timestamp(),
        ip: ip.remote(req),
        appid: appid,
        userid: userid,
        info: info
    };
    let path = file.makePath(basePath, appid, userid, type);
    fs.appendFile(path + data.Format('YYYYMMDD') + '.txt', JSON.stringify(logs) + '\n', err => {
        if (err) console.log(err);
    });
    return 1;
};

module.exports = log;
