var returnUtil = require('../util/ReturnUtil');

exports.validateDboxTag = function (callback, json) {
    if (!json.hasOwnProperty('DBox') ||
        !json.DBox.hasOwnProperty('Device') ||
        !json.DBox.hasOwnProperty('Query')) {
            returnUtil.generateReturn(callback, 600);
    } else {
        callback();
    }
};
