let text = {};

text.trim = function (str) {
    try {
        str = str.toString();
    } catch (e) {
        str = '';
    }
    if (str) {
        return str.replace(/(^\s*)|(\s*$)/g, '').replace(/\s+/g, ' ');
    } else return '';
}

module.exports = text;
