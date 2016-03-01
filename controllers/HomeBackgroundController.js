require('./../models/HomeBackground');
var Background = GLOBAL.mongoose.model('HomeBackground');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST BACKGROUNDS
    if (req.query.list != undefined) {
        
        var params = {};
        
        params.filter = {
            country: req.query.country, 
            status: req.query.status, 
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
    // SAVE OR UPDATE BACKGROUNDS
    else if (req.body.save != undefined) {
        saveByStep({step:1, req: req, res:res});
    }
    
    // ---------------------------------------------
    // DELETE BACKGROUNDS BY ID
    else if (req.query.delete != undefined && req.query.id != undefined) {
        remove(req, res);
    }
    
    // ---------------------------------------------
    // CHECK IF COUNTRY CONTAINS BACKGROUND
    else if (req.query.country != undefined && GLOBAL.getBoolean(req.query.check)) {

        var country = req.query.country;
        containsBackground(country, res);
    }
    
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.ERROR_IN_PROCESS);
    }

};

// CHECK IF COUNTRY CONTAINS BACKGROUND
var containsBackground = function (country, res){
    GLOBAL.db_open();
    
    Background.find({ "country": country })
    .limit(1)
    .exec(
        function (err, background) {
            
            GLOBAL.db_close();

            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(background));
            }
            else {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(App_Message.ERROR_IN_PROCESS);
            }
        }
    );
}

// BUILD FILTER LIST ALL
var listAllFilter = function (params) {

    var filter = 
    ({
        $and : [
            (params.filter.country == '' ? {} : ({ "country" : new RegExp(params.filter.country, 'i') })),
            (params.filter.status == '' ? {} : ( {"status" : JSON.parse(params.filter.status)})),
        ]
    });
    return filter;
};

// LIST ALL BACKGROUNDS ON THE DATABASE
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    Background.find(listAllFilter(params)).count(function (err, total) {
        
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

// LIST ALL BACKGROUNDS ON THE DATABASE
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    Background.find(
        (
          listAllFilter(params))
    )
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .exec(
        function (err, background) {
            GLOBAL.db_close();
            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(background));
            }
            else {
                GLOBAL.log(err, null);
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(App_Message.ERROR_IN_PROCESS);
            }
        }
    );
};

// REMOVE BACKGROUND FROM DATABASE
var remove = function (req, res) {
    
    GLOBAL.db_open();
    
    Background.findOne(({ _id: req.query.id }), function (err, background) {
        
        Background.remove({ _id: req.query.id }, function (err) {
            
            GLOBAL.db_close();
            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                
                GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_HOME + path.basename(background.home));
                GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_LIVE + path.basename(background.live));
                GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_COMMUNITY + path.basename(background.community));
                GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_TVSERIES + path.basename(background.tvseries));
                GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_YOUTUBER + path.basename(background.youtuber));
                
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
            
        });

    });
}

// GET PARAMS FROM POST AND BIND AN OBJECT
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

    _obj.home = GLOBAL.getString(aux.home); 
    _obj.live = GLOBAL.getString(aux.live); 
    _obj.community = GLOBAL.getString(aux.community); 
    _obj.tvseries = GLOBAL.getString(aux.tvseries);
    _obj.youtuber = GLOBAL.getString(aux.youtuber);
    _obj.country = GLOBAL.getString(aux.country);
    _obj.status = GLOBAL.getBoolean(aux.status);
    _obj.registration = aux.registration == undefined ? new Date().toISOString() : aux.registration;
    
    return _obj;
}

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
            callParams.obj = new Background();
            callParams.obj = getParamsList(callParams.req, callParams.obj);
            
            saveByStep(callParams);
        }
    }
   // CHECK BACKGROUND HOME
    else if (callParams.step == 2) {
        
        callParams.step = 3;
        var home_file = callParams.req.files.home_file;
        
        // BACKGROUND HOME EXIST
        if (home_file) {
            
            var thumbName = GLOBAL.imageName(home_file);
            
            GLOBAL.saveFile(home_file, thumbName, GLOBAL.path.SERVER_BACKGROUND_HOME, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_HOME + path.basename(callParams.old_obj.home));

                    callParams.obj.home = GLOBAL.path.WEB_BACKGROUND_HOME + thumbName;
                }
                saveByStep(callParams);
            });
           
        }
        else {
            
            saveByStep(callParams);
        }

    }
    // CHECK BACKGROUND LIVE
    else if (callParams.step == 3) {
        
        callParams.step = 4;
        var live_file = callParams.req.files.live_file;
        
        // BACKGROUND LIVE EXIST
        if (live_file) {
            
            var thumbName = GLOBAL.imageName(live_file);
            
            GLOBAL.saveFile(live_file, thumbName, GLOBAL.path.SERVER_BACKGROUND_LIVE, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_LIVE + path.basename(callParams.old_obj.live));

                    callParams.obj.live = GLOBAL.path.WEB_BACKGROUND_LIVE + thumbName;
                }
                saveByStep(callParams);

            });
           
        }
        else {
            
            saveByStep(callParams);
        }
    }
    // CHECK BACKGROUND COMMUNITY
    else if (callParams.step == 4) {
        
        callParams.step = 5;
        var community_file = callParams.req.files.community_file;
        
        // BACKGROUND COMMUNITY EXIST
        if (community_file) {
            
            var thumbName = GLOBAL.imageName(community_file);
            
            GLOBAL.saveFile(community_file, thumbName, GLOBAL.path.SERVER_BACKGROUND_COMMUNITY, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_COMMUNITY + path.basename(callParams.old_obj.community));

                    callParams.obj.community = GLOBAL.path.WEB_BACKGROUND_COMMUNITY + thumbName;
                }
                saveByStep(callParams);

            });
           
        }
        else {
            
            saveByStep(callParams);
        }
    }
    // CHECK BACKGROUND TV SERIES
    else if (callParams.step == 5) {
        
        callParams.step = 6;
        var tvseries_file = callParams.req.files.tvseries_file;
        
        // BACKGROUND COMMUNITY EXIST
        if (tvseries_file) {
            
            var thumbName = GLOBAL.imageName(tvseries_file);
            
            GLOBAL.saveFile(tvseries_file, thumbName, GLOBAL.path.SERVER_BACKGROUND_TVSERIES, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_TVSERIES + path.basename(callParams.old_obj.tvseries));

                    callParams.obj.tvseries = GLOBAL.path.WEB_BACKGROUND_TVSERIES + thumbName;
                }
                saveByStep(callParams);

            });
           
        }
        else {
            
            saveByStep(callParams);
        }
    }
    // CHECK BACKGROUND YOUTUBER
    else if (callParams.step == 6) {
        
        callParams.step = 7;
        var youtuber_file = callParams.req.files.youtuber_file;
        
        // BACKGROUND COMMUNITY EXIST
        if (youtuber_file) {
            
            var thumbName = GLOBAL.imageName(youtuber_file);
            
            GLOBAL.saveFile(youtuber_file, thumbName, GLOBAL.path.SERVER_BACKGROUND_YOUTUBER, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_BACKGROUND_YOUTUBER + path.basename(callParams.old_obj.youtuber));

                    callParams.obj.youtuber = GLOBAL.path.WEB_BACKGROUND_YOUTUBER + thumbName;
                }
                saveByStep(callParams);

            });
           
        }
        else {
            
            saveByStep(callParams);
        }
    }
    // SAVE / UPDATE
    else if (callParams.step == 7) {

        GLOBAL.db_open();
        
        // UPDATE
        if (callParams.req.body._id !== undefined) {

            Background.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
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

// FIND THE OBJ AND ADD callParams LIKE A OLD OBJECT
var findOneCB = function (id, callback, callParams) {
    
    GLOBAL.db_open();
    Background.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        callParams.old_obj = item;
        
        callback(callParams);
    });
}