require('./generic');

var CryptoJS = require('crypto-js');
var config = require('../config/config');

exports.register = function(json){
    
    try{
        // IF WSDASH IS NULL, IT DOESN`T MAKE ANY LOG
        if(GLOBAL.getString(config.wsDash) != ''){
        
            var crypted = CryptoJS.AES.encrypt(JSON.stringify(json), config.passwordDash, { mode: CryptoJS.mode.CBC }).toString();
            
            var requestify = require('requestify');

            requestify.post(config.wsDash, {json : crypted})
            .then(function(response) {
                //console.log(  response.getBody());
            });
        }
        
    }catch(ex){
        console.log(ex);
    }
};