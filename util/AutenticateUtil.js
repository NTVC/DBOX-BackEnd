require('./../models/Device');

var returnUtil = require('../util/ReturnUtil');

// ======================================= =======================================  
// AUTHENTICATE BOX BY MODEL NUMBER, UUID, ETHMAC, WMAC AND STATUS
// ======================================= ======================================= 
exports.autenticateBox = function (callback, query, req, res) {
    
    var Device = GLOBAL.mongoose.model('Device');
    var params = [];
    
    if (query.Device) {
        try {
            params = query.Device.validate.split("||");

            for (var i = 0; i < params.length; i++) {
                params[i] = params[i].replace('\n', '');
            }
        }
        catch (ex) {
            params = [];
            /*
             *  UUID    - INDEX 0
             *  MODEL   - INDEX 1
             *  MAC     - INDEX 2
             *  WMAC    - INDEX 3
             */
        }
    }

    // VALIDATE IF THE FIELDS ARE EMPTY AND NULL
    if (params.length == 0) {
        returnUtil.generateReturn(callback, 300, null, null, null, req, res);
    }
    else {
        
        var filter = 
        ({
            $and: [
                { "uid" : params[0] },
                { "model_number" : params[1] },
                { "status" : true }
            ],
            $or : [
                { "ethMac" : params[2] },
                { "wMac" : params[3] }
            ]
        });

        GLOBAL.db_open();
        Device.findOne(filter, function (err, device) {
            if (err) {
                returnUtil.generateReturn(null, 300, null, null, null, req, res);
            } else {
                if (device === null) {
                    returnUtil.generateReturn(null, 300, null, null, null, req, res);
                }
                else {
                    callback(device);
                }
            }
            GLOBAL.db_close();
        });
    }
};

// ======================================= =======================================  
// GENERATE TOKEN TO AKAMAI 
// ======================================= ======================================= 
exports.getAkamaiOaramsToken = function (req) {
    
    var config = require('../config/config');
    var crypto = require("crypto");
    
    var AkamaiTokenConfig =
    {
        ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress),
        secret_key: config.passwordAkamai,
        startTime: 1, 
        endTime: 1800, 
        acl: "/*", 
        hmac : null,
    };
    
    AkamaiTokenConfig.hmac = crypto.createHmac("sha256", AkamaiTokenConfig.secret_key).digest("hex");
    
    return getAkamaiUrl(AkamaiTokenConfig);
};

// ======================================= =======================================  
// GENERATE URL PARAMETERS TO AKAMAI
// ======================================= =======================================
function getAkamaiUrl(tokenConfig) {
    
    var url = "",
        suffix = "~";
    
    if (tokenConfig.ip)
        url += "ip=" + tokenConfig.ip + suffix;
    if (tokenConfig.startTime)
        url += "st=" + tokenConfig.startTime + suffix;
    if (tokenConfig.endTime)
        url += "exp=" + tokenConfig.endTime + suffix;
    if (tokenConfig.acl)
        url += "acl=" + tokenConfig.acl + suffix;
    if (tokenConfig.acl)
        url += "hmac=" + tokenConfig.hmac;
    
    return url;
}