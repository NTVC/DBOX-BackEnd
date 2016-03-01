require('./../models/HomeApps');
var HomeApps = GLOBAL.mongoose.model('HomeApps');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST APPS
    if (req.query.list != undefined) {
        
        var params = {};
        
        params.filter = {
            search: GLOBAL.getString(req.query.search), 
            status: GLOBAL.getBoolean(req.query.status), 
            country: GLOBAL.getString(req.query.country), 
            pg: {
                index: GLOBAL.getString(req.query.pg_index), 
                limit: GLOBAL.getString(req.query.pg_limit)
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
    // SAVE OR UPDATE APPS
    else if (req.body.save != undefined) {
        saveByStep({step:1, req: req, res:res});
    }
    
    // ---------------------------------------------
    // DELETE APPS BY ID
    else if (req.query.delete != undefined && req.query.id != undefined) {
        remove(req, res);
    }
    
    // ---------------------------------------------
    // UPDATE ORDER APPS
    else if (req.query.order_apps != undefined && req.query.array != undefined) {
        var array = GLOBAL.getArray(req.query, "array");
        updateOrderApps(0, array, res);
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

    var filter = 
    ({
        $and : [
            (params.filter.search == '' ? {} : ({"name" : new RegExp(params.filter.search, 'i')})),
            {"status" : params.filter.status},
            (params.filter.country == '' ? {} : ({ "country" : params.filter.country }))
        ]
    });
    return filter;
};

// ======================================= =======================================  
// GET QUANTITY OF APPS ON THE DATABASE
// ======================================= =======================================
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    HomeApps.find(listAllFilter(params)).count(function (err, total) {
        
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
//  LIST ALL APPS ON THE DATABASE
// ======================================= =======================================
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    HomeApps.find(listAllFilter(params))
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .sort({ order: 1 })
        .exec(
        function (err, apps) {
            
            GLOBAL.db_close();
            
            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(apps));
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
    
    HomeApps.findOne(({ _id: req.query.id }), function (err, app) {
        
        HomeApps.remove({ _id: req.query.id }, function (err) {
            
            GLOBAL.db_close();
            
            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                
                var thumbName = path.basename(app.thumb);
                GLOBAL.deleteFile(GLOBAL.path.SERVER_HOME_APP_VERSION + thumbName);
                
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
            
        });

    });
}

// ======================================= =======================================  
// GET PARAMS FROM POST AND BIND AN OBJECT
// ======================================= =======================================
var getParamsList = function (req, obj) {
    
    var aux = JSON.parse(JSON.stringify(req.body));
    var _obj;
    
    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    if (req.body._id != undefined) {
        _obj._id = req.body._id;
    }
    
    _obj.intent         = GLOBAL.getArray(aux, "intent");
    _obj.key            = GLOBAL.getString(aux.key);
    _obj.name           = GLOBAL.getString(aux.name);
    _obj.country        = GLOBAL.getString(aux.country); 
    _obj.description    = GLOBAL.getString(aux.description); 
    _obj.thumb          = GLOBAL.getString(aux.thumb);
    _obj.registration   = GLOBAL.getString(aux.registration);
    _obj.order          = GLOBAL.getNumber(aux.order);
    _obj.status         = GLOBAL.getBoolean(aux.status);
    
    return _obj;
}

// ======================================= =======================================  
// SAVE BY STEP
// ======================================= =======================================
var saveByStep = function (callParams){
    
    // GET OBJ
    if (callParams.step == 1) {
        
        callParams.step = 2;
        callParams.obj = null;

        // UPDATE
        if (callParams.req.body._id !== undefined) {
            callParams.obj = getParamsList(callParams.req, null);
        }
        else {
            callParams.obj = new HomeApps();
            callParams.obj = getParamsList(callParams.req, callParams.obj);
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
            
            GLOBAL.saveFile(thumb_file, thumbName, GLOBAL.path.SERVER_HOME_APP_VERSION, function (r, thumbName) {
                
                if (r) {
                    
                    if (callParams.req.body._id !== undefined) {

                        findOneCB(callParams.req.body._id, function (callParams) { 
                            
                            // DELETE OLD FILE
                            GLOBAL.deleteFile(GLOBAL.path.SERVER_HOME_APP_VERSION + path.basename(callParams.old_obj.thumb));
                        
                        }, callParams);

                    }
                    
                    // SET THUMBNAIL
                    callParams.obj.thumb = GLOBAL.path.WEB_HOME_APP_VERSION + thumbName;
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

            HomeApps.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
                GLOBAL.db_close();
                callParams.res.writeHead(200, { "Content-Type": "text/plain" });
                if (err) {
                    GLOBAL.log(err, null);
                    // DELETE THUMBNAIL FILE
                    GLOBAL.deleteFile(GLOBAL.path.SERVER_HOME_APP_VERSION + path.basename(callParams.obj.thumb));
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

// ======================================= =======================================  
// FIND THE OBJ AND ADD callParams LIKE A OLD OBJECT
// ======================================= =======================================
var findOneCB = function (id, callback, callParams) {
    
    GLOBAL.db_open();
    HomeApps.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        callParams.old_obj = item;
        
        callback(callParams);
    });
}

var updateOrderApps = function (index, array, res) {
    
    if (index < array.length) {
        
        // VALIDATE IF CONTAINS ID
        if (GLOBAL.getString(array[index]) == "") {
            
            index += 1;
            updateOrderApps(index, array, res);
        }
        else {
            
            GLOBAL.db_open();
            HomeApps.update({ _id: array[index] } , { $set: { order : index } } , function (err, item) {
                
                GLOBAL.db_close();
                
                if (err) {
                    GLOBAL.log(err, null);
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end(App_Message.ERROR_IN_PROCESS);
                }
                else {
                    index += 1;
                    updateOrderApps(index, array, res);
                }
            });
        }
        
    }
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.SUCESS_IN_PROCESS);
    }

}