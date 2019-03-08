let ip = {};

ip.remote = function (req) {
    let remoteIp = '';
    try {
        remoteIp = req.headers['x-forwarded-for']
            || req.connection.remoteAddress
            || req.socket.remoteAddress
            || req.connection.socket.remoteAddress
            || req.headers['remote_addr']
            || req.headers['client_ip']
            || req.ip;
    }catch (e) {}
    return remoteIp;
};

module.exports = ip;
