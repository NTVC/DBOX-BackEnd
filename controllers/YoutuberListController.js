require('./../models/Youtuber.list');
require('./../util/generic');

var YoutuberList = GLOBAL.mongoose.model('YoutuberList');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST ALL BY YOUTUBER ID
    if (GLOBAL.getBoolean(req.query.getList) && req.query.youtuber_id != undefined) {
        
        var params = {};
        
        params.filter = {
            search: GLOBAL.getString(req.query.search), 
            youtuber_id: GLOBAL.getString(req.query.youtuber_id), 
            status: GLOBAL.getString(req.query.status),
            pg: {
                index: GLOBAL.getNumber(req.query.pg_index), 
                limit: GLOBAL.getNumber(req.query.pg_limit)
            }
        };
        
        // COUNT ONLY
        if (req.query.count != undefined) {
            getArrayListCount(res, params);
        }

        // ALL DATA
        else {
            getArrayList(res, params);
        }
    }
    // ---------------------------------------------
    // SAVE OR UPDATE LIST OF YOUTUBER
    else if (GLOBAL.getBoolean(req.body.save)) {
        saveByStep({step:1, req: req, res:res});
    }
    // ---------------------------------------------
    // DELETE YOUTUBER BY ID
    else if (GLOBAL.getBoolean(req.body.delete) && req.body._id != undefined) {
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
    
    var filter = 
    ({
        $and: [
            (params.filter.search == '' ? {} : ({ "title": new RegExp(params.filter.search, 'i') })),
            {"youtuber_id" : params.filter.youtuber_id},
            { "status" : JSON.parse(params.filter.status)}
        ]
    });
    return filter;
};

// ======================================= =======================================  
//  LIST ALL OBJECTS ON THE DATABASE
// ======================================= =======================================
var getArrayList = function (res, params) {
    GLOBAL.db_open();
    
    YoutuberList.find(listAllFilter(params))
    .sort({registration: -1})
    .skip(params.filter.pg.index * params.filter.pg.limit)
    .limit(params.filter.pg.limit)
    .exec(
    function (err, arrayList) {
        GLOBAL.db_close();

        if (!err) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(arrayList));
        }
        else {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(App_Message.ERROR_IN_PROCESS);
        }
    });
};

// ======================================= =======================================  
// GET QUANTITY OF OBJECTS ON THE DATABASE
// ======================================= =======================================
var getArrayListCount = function (res, params) {
    GLOBAL.db_open();
    
    YoutuberList.find(listAllFilter(params)).count(function (err, total) {
        
        GLOBAL.db_close();
        res.writeHead(200, { "Content-Type": "text/plain" });
        if (err) {
            res.end(App_Message.ERROR_IN_PROCESS);
        }
        else {
            res.end(String(total));
        }
    });
        
};

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

    _obj.youtuber_id        = aux.youtuber_id; 
    _obj.title              = GLOBAL.getString(aux.title); 
    _obj.description        = GLOBAL.getString(aux.description); 
    _obj.thumb              = GLOBAL.getString(aux.thumb);
    _obj.status             = GLOBAL.getBoolean(aux.status);
    _obj.registration       = GLOBAL.getString(aux.registration);
    
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
            findOneCB(callParams.req.body._id, saveByStep, callParams);
        }
        else {
            callParams.obj = new YoutuberList();
            callParams.obj = getParamsList(callParams.req, callParams.obj);
            
            saveByStep(callParams);
        }
    }
    // CHECK THUMBNAIL
    else if (callParams.step == 2) {
        
        callParams.step = 3;
        var thumb_file = callParams.req.files.thumb_file;
        
        // THUMBNAIL EXIST
        if (thumb_file) {
            
            var thumbName = GLOBAL.imageName(thumb_file);
            
            GLOBAL.saveFile(thumb_file, thumbName, GLOBAL.path.SERVER_YOUTUBER_LIST, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_YOUTUBER_LIST + path.basename(callParams.old_obj.thumb));

                    callParams.obj.thumb = GLOBAL.path.WEB_YOUTUBER_LIST+ thumbName;
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

            YoutuberList.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
                callParams.res.writeHead(200, { "Content-Type": "text/plain" });
                if (err) {
                    callParams.res.end(App_Message.ERROR_IN_PROCESS);
                }
                else {
                    callParams.res.end(App_Message.SUCESS_IN_PROCESS);
                }
                GLOBAL.db_close();
            });
        }
        // SAVE NEW OBJ
        else {
            
            callParams.obj.registration = new Date().toISOString();
            callParams.obj.save(function (err) {
                
                callParams.res.writeHead(200, { "Content-Type": "text/plain" });
                if (err) {
                    callParams.res.end(App_Message.ERROR_IN_PROCESS);
                } else {
                    callParams.res.end(App_Message.SUCESS_IN_PROCESS);
                }
                
                GLOBAL.db_close();
            });
        }
    }
}

// ======================================= =======================================  
// FIND THE OBJ AND ADD callParams LIKE A OLD OBJECT
// ======================================= =======================================
var findOneCB = function (id, callback, callParams) {
    
    GLOBAL.db_open();
    YoutuberList.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        callParams.old_obj = item;
        
        callback(callParams);
    });
}

// ======================================= =======================================  
// REMOVE OBJECT FROM THE DATABASE
// ======================================= =======================================
var remove = function (req, res) {
    
    GLOBAL.db_open();
    
    YoutuberList.findOne(({ _id: req.body._id }), function (err, list) {
        
        YoutuberList.remove({ _id: req.body._id }, function (err) {
            
            GLOBAL.db_close();

            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                
                // DELETE LIST THUMBNAIL
                if (list.thumb) {
                    GLOBAL.deleteFile(GLOBAL.path.SERVER_YOUTUBER_LIST + path.basename(list.thumb));

                }
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
            
        });
    });
}


// --------------------------------------------- END YOUTUBER ---------------------------------------------