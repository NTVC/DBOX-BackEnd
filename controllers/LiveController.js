require('./../models/Live');
var Live = GLOBAL.mongoose.model('Live');
var path = require('path');

exports.process = function (req, res) {

    // ---------------------------------------------
    // LIST LIVES
    if (req.query.list != undefined) {
        
        var params = {};
        
        params.filter = {
            search: req.query.search, 
            country: req.query.country, 
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
    // SAVE OR UPDATE LIVES
    else if (req.body.save != undefined) {
        saveByStep({step:1, req: req, res:res});
    }
    
    // ---------------------------------------------
    // DELETE LIVES BY ID
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

    var filter = 
    ({
        $and : [
            (params.filter.search == '' ? {} : ( {"name" : new RegExp(params.filter.search, 'i')})),
            (params.filter.country == '' ? {} : ({ "country" : new RegExp(params.filter.country, 'i') })),
            (params.filter.active == '' ? {} : ( {"active" : JSON.parse(params.filter.active)})),
        ]
    });
    return filter;
};

// ======================================= =======================================  
// GET QUANTITY OF LIVE STREAMS ON THE DATABASE
// ======================================= =======================================
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    Live.find(listAllFilter(params)).count(function (err, total) {
        
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
//  LIST ALL LIVE STREAMS ON THE DATABASE
// ======================================= =======================================
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    Live.find(listAllFilter(params))
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .exec(
        function (err, admin) {
            
            GLOBAL.db_close();
            
            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(admin));
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
    
    Live.find(({ _id: req.query.id }), function (err, live) {
        
        Live.remove({ _id: req.query.id }, function (err) {
            
            GLOBAL.db_close();
            
            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                
                GLOBAL.deleteFile(GLOBAL.path.SERVER_LIVE + path.basename(live[0].thumb));
                GLOBAL.deleteFile(GLOBAL.path.SERVER_LIVE_COVER + path.basename(live[0].cover));
                
                removeReferences(req.query.id);
                
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
            
        });

    });
}
var removeReferences = function(id){
    require('./../models/HomeHighlights');
    var HomeHighlights = GLOBAL.mongoose.model('HomeHighlights');
    
    GLOBAL.db_open();
    
    HomeHighlights.update(
        { source: 1 },
        { $pull: 
            { 'list': 
                { 
                    "type_content": 2, "id": id 
                } 
            } 
        },
        {multi: true}, 
        function(err, result) {
            if (err){
                console.log(err);
            }
        }
    );
    
    GLOBAL.db_close();
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

    _obj.name           = GLOBAL.getString(aux.name); 
    _obj.description    = GLOBAL.getString(aux.description); 
    _obj.country        = GLOBAL.getString(aux.country);
    _obj.url            = GLOBAL.getString(aux.url);
    _obj.thumb          = GLOBAL.getString(aux.thumb);
    _obj.cover          = GLOBAL.getString(aux.cover);
    _obj.active         = GLOBAL.getBoolean(aux.active);
    
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
            callParams.obj = new Live();
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
            
            GLOBAL.saveFile(thumb_file, thumbName, GLOBAL.path.SERVER_LIVE, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_LIVE + path.basename(callParams.old_obj.thumb));

                    callParams.obj.thumb = GLOBAL.path.WEB_LIVE + thumbName;
                }
                saveByStep(callParams);


            });
           
        }
        else {
            
            saveByStep(callParams);
        }

    }
    // CHECK COVER
    else if (callParams.step == 3) {
        
        callParams.step = 4;
        var cover_file = callParams.req.files.cover_file;
        
        // THUMBNAIL EXIST
        if (cover_file) {
            
            var thumbName = GLOBAL.imageName(cover_file);
            
            GLOBAL.saveFile(cover_file, thumbName, GLOBAL.path.SERVER_LIVE_COVER, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_LIVE_COVER + path.basename(callParams.old_obj.cover));

                    callParams.obj.cover = GLOBAL.path.WEB_LIVE_COVER + thumbName;
                }
                saveByStep(callParams);

            });
           
        }
        else {
            
            saveByStep(callParams);
        }

    }
    // SAVE / UPDATE
    else if (callParams.step == 4) {

        GLOBAL.db_open();
        
        // UPDATE
        if (callParams.req.body._id !== undefined) {

            Live.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
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
    Live.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        
        callParams.old_obj = item;
        callback(callParams);
    });
}