/**
 * Created by thiagosilva on 15-08-24.
 */
var CryptoJS = require('crypto-js');
var crypto = require('crypto');
var config = require('../config/config');

exports.encrypt = function (callback, json) {
    json = JSON.stringify(json);
    var crypted = CryptoJS.AES.encrypt(json, config.passwordJson, { mode: CryptoJS.mode.CBC }).toString();
    callback(null, crypted);
};

exports.decrypt = function (callback, json) {
    var dec = CryptoJS.AES.decrypt(json, config.passwordJson, { mode: CryptoJS.mode.CBC }).toString(CryptoJS.enc.Utf8);
    
    dec = JSON.stringify(dec);
    dec = JSON.parse(dec);
    dec = (new Function('return ' + dec))();

    var jsonObject = dec;
    callback(null, jsonObject);
};

exports.encriptPassword = function (password) {
    var cipher = crypto.createCipher(config.algorithm, config.password);
    password = cipher.update(password, 'utf8', 'hex');
    password += cipher.final('hex');
    return password;
};