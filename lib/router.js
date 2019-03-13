module.exports = function() {
    this.getRequest = {}
    this.get = function (path, callback) {
        this.getRequest[path] = callback;
    }
}
