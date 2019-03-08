const log = require('../index').log;
const http = require('http');
const url = require('url');

http.createServer(function (request, response) {
    console.time(request.url);
    let req = url.parse(request.url, true);
    if(req.pathname === '/favicon.ico'){
        response.writeHead(404, {'Content-Type': 'text/html'});
    } else {
        response.writeHead(200, {'Content-Type': 'text/html'});
        if(request.method !== 'GET'){
            response.write('err: please use get method.');
        } else {
            let query = req.query;
            if(!query.appid){
                response.write('err: must have appid.');
            } else if(!query.userid){
                response.write('err: must have userid.');
            } else if(!query.info){
                response.write('err: must have info.');
            } else {
                try {
                    JSON.parse(query.info);
                    response.write('done.');
                    log.save(query.appid, query.userid, 'log', query.info, '/data/test', request);
                } catch (e) {
                    response.write('err: info must be a JSON.');
                }
            }
        }
    }
    response.end();
    console.timeEnd(request.url);
}).listen(3300, '0.0.0.0');

// 控制台会输出以下信息
console.log('Server running at http://127.0.0.1:3300/');
