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
};

text.stripBOM = function(content){
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    return content;
};

module.exports = text;
