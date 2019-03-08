let data = {};

data.timestamp = function(){
    return (new Date()).valueOf();
};

/**
 * 月(M)、日(D)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 * 年(Y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 */
data.Format = function(str) {
    let dateNow = new Date();
    let o = {
        'M+': dateNow.getMonth() + 1, //月份
        'D+': dateNow.getDate(), //日
        'h+': dateNow.getHours(), //小时
        'm+': dateNow.getMinutes(), //分
        's+': dateNow.getSeconds(), //秒
        'S': dateNow.getMilliseconds() //毫秒
    };
    if (/(Y+)/.test(str)) str = str.replace(RegExp.$1, (dateNow.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp('(' + k + ')').test(str)) str = str.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    return str;
};

module.exports = data;

