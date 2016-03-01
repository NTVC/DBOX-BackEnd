require('./../models/DeviceVersion');
require('./../util/generic');

var DeviceVersion = GLOBAL.mongoose.model('DeviceVersion');
var path = require('path');

exports.process = function (req, res) {
    // ---------------------------------------------
    // LIST DEVICES
    if (req.query.list != undefined) {
        
        var params = {};
        
        params.filter = {
            search: req.query.search, 
            active: req.query.active, 
            pg: {
                index: req.query.pg_index, 
                limit: req.query.pg_limit
            }
        };
        
        // COUNT ONLY
        if (req.query.count != undefined) {
            listAllCount(res, params)
        }
        // ALL DATA
        else {
            listAll(res, params)
        }
       
    }

    // ---------------------------------------------
    // SAVE OR UPDATE DEVICES
    else if (req.body.save != undefined) {
        saveByStep({ step: 1, req: req, res: res });
    }
    
    // ---------------------------------------------
    // DELETE DEVICES BY ID
    else if (req.query.delete != undefined && req.query.id != undefined) {
        remove(req, res);
    }
    
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.ERROR_IN_PROCESS);
    }

};

// ======================================= =======================================  
// BUILD FILTER LIST ALL
// ======================================= ======================================= 
var listAllFilter = function (params) {
    
    var filter = ({});
    return filter;
};

// ======================================= =======================================  
// GET QUANTITY OF OBJECTS
// ======================================= =======================================
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    DeviceVersion.find(listAllFilter(params)).count(function (err, total) {
        
        GLOBAL.db_close();
        res.writeHead(200, { "Content-Type": "text/plain" });
        if (err) {
            GLOBAL.log(err, null);
            res.end(App_Message.ERROR_IN_PROCESS);
        }
        else {
            res.end(String(total));
        }
    });
        
};

// ======================================= =======================================  
//  LIST ALL OBJECTS ON THE DATABASE
// ======================================= =======================================
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    DeviceVersion.find(listAllFilter(params))
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .exec(
        function (err, device) {
            
            GLOBAL.db_close();
            
            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(device));
            }
            else {
                GLOBAL.log(err, null);
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(App_Message.ERROR_IN_PROCESS);
            }
        }
    );
};

// ======================================= =======================================  
// REMOVE OBJECT FROM THE DATABASE
// ======================================= =======================================
var remove = function (req, res) {
    
    GLOBAL.db_open();
    DeviceVersion.findOne(({ _id: req.query.id }), function (err, device) {
        
        DeviceVersion.remove({ _id: req.query.id }, function (err) {

            GLOBAL.db_close();
            
            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                
                var thumbName = path.basename(device.thumb);
                GLOBAL.deleteFile(GLOBAL.path.SERVER_DEVICE_VERSION + thumbName);

                res.end(App_Message.SUCESS_IN_PROCESS);
            }
        
        });
    });
}

// ======================================= =======================================  
// GET PARAMS FROM POST AND BIND AN OBJECT
// ======================================= =======================================
var getParamsDeviceVersion = function (req, obj) {
    
    var aux = JSON.parse(JSON.stringify(req.body));
    var _obj;
    
    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    
    if (req.body._id != undefined) {
        _obj._id = req.body._id;
    }

    _obj.title = GLOBAL.getString(aux.title); 
    _obj.description = GLOBAL.getString(aux.description);
    _obj.thumb = GLOBAL.getString(aux.thumb);
    _obj.registration = GLOBAL.getString(aux.registration);
    
    return _obj;
}

// ======================================= =======================================  
// SAVE BY STEP
// ======================================= =======================================
var saveByStep = function (callParams) {
    
    // GET OBJ
    if (callParams.step == 1) {
        
        callParams.step = 2;
        callParams.obj = null;
        
        // UPDATE
        if (callParams.req.query._id !== undefined) {
            callParams.obj = getParamsDeviceVersion(callParams.req, null);
        }
        else {
            callParams.obj = new DeviceVersion();
            callParams.obj = getParamsDeviceVersion(callParams.req, callParams.obj);
        }
        
        saveByStep(callParams);
    }
     // CHECK THUMBNAIL
    else if (callParams.step == 2) {
        
        callParams.step = 3;
        var thumb_file = callParams.req.files.thumb_file;
        
        // THUMBNAIL EXIST
        if (thumb_file) {
            
            var thumbName = GLOBAL.imageName(thumb_file);
            
            GLOBAL.saveFile(thumb_file, thumbName, GLOBAL.path.SERVER_DEVICE_VERSION, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    GLOBAL.deleteFile(GLOBAL.path.SERVER_DEVICE_VERSION + path.basename(callParams.obj.thumb));
                    callParams.obj.thumb = GLOBAL.path.WEB_DEVICE_VERSION + thumbName;
                }
                saveByStep(callParams);


            });
           
        }
        else {
            
            saveByStep(callParams);
        }

    }
    // SAVE / UPDATE
    else if (callParams.step == 3) {
        
        GLOBAL.db_open();
        
        // UPDATE
        if (callParams.req.body._id !== undefined) {
            
            DeviceVersion.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
                GLOBAL.db_close();
                callParams.res.writeHead(200, { "Content-Type": "text/plain" });
                if (err) {
                    GLOBAL.log(err, null);
                    callParams.res.end(App_Message.ERROR_IN_PROCESS);
                }
                else {
                    callParams.res.end(App_Message.SUCESS_IN_PROCESS);
                }
            });
        }
        // SAVE NEW OBJ
        else {
            callParams.obj.registration = new Date().toISOString();
            callParams.obj.save(function (err) {
                
                GLOBAL.db_close();
                callParams.res.writeHead(200, { "Content-Type": "text/plain" });
                if (err) {
                    GLOBAL.log(err, null);
                    callParams.res.end(App_Message.ERROR_IN_PROCESS);
                } else {
                    callParams.res.end(App_Message.SUCESS_IN_PROCESS);
                }
                
            });
        }
    }
}
