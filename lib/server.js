const router = require('./router');
const http = require('http');

let server = {};

let getRequest = {}

server.router = function(){
    return new router();
}
server.use = function (path, router) {
    for(let routerPath in router.getRequest){
        getRequest[path + routerPath] = router.getRequest[routerPath];
    }
};


server.start = function(port){
    for(let path in getRequest){
        console.log(path);
        getRequest[path]();
    }
    console.log(getRequest);
    // http.createServer(function (request, response) {
    //     console.time(request.url);
    //     let req = url.parse(request.url, true);
    //     let pathname = req.pathname;
    //     if (pathname === '/favicon.ico') {
    //         response.writeHead(404, {'Content-Type': 'text/html'});
    //     } else {
    //         response.writeHead(200, {'Content-Type': 'text/html'});
    //         if (request.method !== 'GET') {
    //             response.write('err: please use get method.');
    //         } else {
    //             let lastPathName = pathname.substr(pathname.lastIndexOf('/') + 1);
    //             if (lastPathName === 'savemem') {
    //                 response.write(log.saveMemLog());
    //             } else {
    //                 let query = req.query;
    //                 if (!query.appid) {
    //                     response.write('err: must have "appid".');
    //                 } else if (!query.userid) {
    //                     response.write('err: must have "userid".');
    //                 } else if (!query.type) {
    //                     response.write('err: must have log "type".');
    //                 } else {
    //                     switch (lastPathName) {
    //                         case 'put':
    //                             if (!query.info) {
    //                                 response.write('err: must have "info".');
    //                             } else {
    //                                 response.write('put done.');
    //                                 log.save(query.appid, query.userid, query.type, query.info, basePath, request);
    //                             }
    //                             break;
    //                         case 'get':
    //                             if (!query.start || !query.number) {
    //                                 response.write('err: "start" and "number" are must have.');
    //                             } else {
    //                                 response.write(JSON.stringify(log.readByNumber(query.appid,
    //                                     query.userid,
    //                                     query.type,
    //                                     query.start,
    //                                     query.number,
    //                                     basePath)));
    //                             }
    //                             break;
    //                         default:
    //                             response.write('err: I don\'t know what you want.');
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     response.end();
    //     console.timeEnd(request.url);
    // }).listen(port, '0.0.0.0');
    console.log('Log Server running at http://127.0.0.1:' + port + '/');
}

module.exports = server;
