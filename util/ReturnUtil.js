/**
 *
 * @author Thiago Bispo
 * @version v20150821
 */

var pjson = require('../package.json');


function getReturnString(statusNumber) {
    switch (statusNumber) {
        case 0:
            return 'Dbox Backend Server version ' + pjson.version;
            break;
        case 100:
            return 'Ok';
            break;
        case 101:
            return 'Not Found';
            break;
        case 200:
            return 'Error in database';
            break;
        case 300:
            return 'Autentication error';
            break;
        case 400:
            return 'Compress Error';
            break;
        case 500:
            return 'Error parsing field';
            break;
        case 600:
            return 'Json validator Error';
            break;
        case 999:
            return 'Error in the requisition';
    }
}

function getRenderString(render) {
    switch (render) {
        case 0:
            return 'menu';
            break;
        case 1:
            return 'live';
            break;
        case 2:
            return 'movie';
            break;
        case 3:
            return 'community';
            break;
        case 4:
            return 'tvseries';
            break;
        case 5:
            return 'sub-menu';
        case 6:
            return 'apps';
        case 7:
            return 'highlights';
        case 8:
            return 'homescreen';
        case 9:
            return 'banners';
        case 10:
            return 'sponsors';
        case 11:
            return 'widgets';
        case 12:
            return 'support';
        case 13:
            return 'homebackground';
        case 14:
            return 'youtuber';
        case 15:
            return 'parentalcontrol';
        case 999:
            return 'error';
    }
}

function ReturnClass(status, returnInformation, render) {
    
    var json  = { };
    var systemmessage = {
        status: status,
        render: getRenderString(render),
        message: getReturnString(status)
    };

    try {
        returnInformation = JSON.stringify(returnInformation);
        returnInformation = JSON.parse(returnInformation);
        returnInformation = (new Function('return ' + returnInformation))();

        json.informationReturn = returnInformation;

        json.systemmessage = systemmessage;
    }
    catch (e) {
        json = returnInformation;
        json.systemmessage = systemmessage;
    }

    return JSON.stringify( json );
}

exports.generateReturn = function (callback, status, returnInformation, render, requestjson , req, res) {
    var returnJson = ReturnClass(status, returnInformation, render);
    
    if (req && res && callback == null) {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(returnJson);
    } else if(callback) {
        callback(returnJson, null);
    }
    else if(res) {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(returnJson);
    }
    
};
