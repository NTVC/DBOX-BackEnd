require('./../models/HomeSponsors');
var HomeSponsors = GLOBAL.mongoose.model('HomeSponsors');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST SPONSORS
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
    // SAVE OR UPDATE SPONSORS
    else if (req.body.save != undefined) {
        saveByStep({step:1, req: req, res:res});
    }
    
    // ---------------------------------------------
    // DELETE SPONSORS BY ID
    else if (req.query.delete != undefined && req.query.id != undefined) {
        remove(req, res);
    }
    
    // ---------------------------------------------
    // UPDATE ORDER SPONSORS
    else if (req.query.order_sponsors != undefined && req.query.array != undefined) {
        var array = GLOBAL.getArray(req.query, "array");
        updateOrderSponsors(0, array, res);
    }
    
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.ERROR_IN_PROCESS);
    }

};

// BUILD FILTER LIST ALL
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

// LIST ALL ADMINS ON THE DATABASE
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    HomeSponsors.find(listAllFilter(params)).count(function (err, total) {
        
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

// LIST ALL SPONSORS ON THE DATABASE
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    HomeSponsors.find(
        (
          listAllFilter(params))
    )
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .sort({ order: 1 })
        .exec(
        function (err, sponsors) {
            GLOBAL.db_close();
            if (!err) {
                res.writeHead(200, { "Content-Type": "sponsorlication/json" });
                res.end(JSON.stringify(sponsors));
            }
            else {
                GLOBAL.log(err, null);
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(App_Message.ERROR_IN_PROCESS);
            }
        }
    );
};

// REMOVE APP FROM DATABASE
var remove = function (req, res) {
    
    GLOBAL.db_open();
    
    GLOBAL.db_open();
    HomeSponsors.find(({ _id: req.query.id }), function (err, sponsor) {
        
        HomeSponsors.remove({ _id: req.query.id }, function (err) {
            
            GLOBAL.db_close();
            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                
                var thumbName = path.basename(sponsor[0].poster);
                GLOBAL.deleteFile(GLOBAL.path.SERVER_HOME_SPONSOR_VERSION + thumbName);
                
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
    
    _obj.name = GLOBAL.getString(aux.name);
    _obj.poster = GLOBAL.getString(aux.poster);
    _obj.url = GLOBAL.getString(aux.url);
    _obj.order = GLOBAL.getNumber(aux.order);
    _obj.country = GLOBAL.getString(aux.country);
    _obj.status = GLOBAL.getString(aux.status);
    _obj.description = GLOBAL.getString(aux.description); 
    _obj.registration = GLOBAL.getString(aux.registration);
    
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
        }
        else {
            callParams.obj = new HomeSponsors();
            callParams.obj = getParamsList(callParams.req, callParams.obj);
        }

        saveByStep(callParams);
    }
    // CHECK POSTER
    else if (callParams.step == 2) {
        
        callParams.step = 3;
        var poster_file = callParams.req.files.poster_file;
        
        // POSTER EXIST
        if (poster_file) {
            
            var thumbName = GLOBAL.imageName(poster_file);
            
            GLOBAL.saveFile(poster_file, thumbName, GLOBAL.path.SERVER_HOME_SPONSOR_VERSION, function (r, thumbName) {
                
                if (r) {
                    
                    if (callParams.req.body._id !== undefined) {

                        findOneCB(callParams.req.body._id, function (callParams) { 
                            
                            // DELETE OLD FILE
                            GLOBAL.deleteFile(GLOBAL.path.SERVER_HOME_SPONSOR_VERSION + path.basename(callParams.old_obj.poster));
                        
                        }, callParams);

                    }
                    
                    // SET THUMBNAIL
                    callParams.obj.poster = GLOBAL.path.WEB_HOME_SPONSOR_VERSION + thumbName;
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

            HomeSponsors.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
                GLOBAL.db_close();
                callParams.res.writeHead(200, { "Content-Type": "text/plain" });
                if (err) {
                    GLOBAL.log(err, null);
                    // DELETE THUMBNAIL FILE
                    GLOBAL.deleteFile(GLOBAL.path.SERVER_HOME_SPONSOR_VERSION + path.basename(callParams.obj.poster));
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

var findOneCB = function (id, callback, callParams) {
    
    GLOBAL.db_open();
    HomeSponsors.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        callParams.old_obj = item;
        
        callback(callParams);
    });
}

var updateOrderSponsors = function (index, array, res) {
    
    if (index < array.length) {
        
        // VALIDATE IF CONTAINS ID
        if (GLOBAL.getString(array[index]) == "") {
            
            index += 1;
            updateOrderSponsors(index, array, res);
        }
        else {
            
            GLOBAL.db_open();
            HomeSponsors.update({ _id: array[index] } , { $set: { order : index } } , function (err, item) {
                
                GLOBAL.db_close();
                
                if (err) {
                    GLOBAL.log(err, null);
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end(App_Message.ERROR_IN_PROCESS);
                }
                else {
                    index += 1;
                    updateOrderSponsors(index, array, res);
                }
            });
        }
        
    }
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.SUCESS_IN_PROCESS);
    }

}