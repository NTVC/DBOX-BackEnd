require('./../models/HomeSupport');
var Support = GLOBAL.mongoose.model('HomeSupport');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST SUPPORTS
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
    // SAVE OR UPDATE SUPPORTS
    else if (req.body.save != undefined) {
        saveByStep({step:1, req: req, res:res});
    }
    
    // ---------------------------------------------
    // DELETE SUPPORTS BY ID
    else if (req.query.delete != undefined && req.query.id != undefined) {
        remove(req, res);
    }
    
    // ---------------------------------------------
    // CHECK IF COUNTRY CONTAINS SUPPORT
    else if (req.query.country != undefined && GLOBAL.getBoolean(req.query.check)) {

        var country = req.query.country;
        containsSupport(country, res);
    }
    
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.ERROR_IN_PROCESS);
    }

};

// CHECK IF COUNTRY CONTAINS SUPPORT
var containsSupport = function (country, res){
    GLOBAL.db_open();
    
    Support.find({ "country": country })
    .limit(1)
    .exec(
        function (err, support) {
            
            GLOBAL.db_close();

            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(support));
            }
            else {
                GLOBAL.log(err, null);
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

// LIST ALL ADMINS ON THE DATABASE
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    Support.find(listAllFilter(params)).count(function (err, total) {
        
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

// LIST ALL ADMINS ON THE DATABASE
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    Support.find(
        (
          listAllFilter(params))
    )
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

// REMOVE SUPPORT FROM DATABASE
var remove = function (req, res) {
    
    GLOBAL.db_open();
    
   
    Support.remove({ _id: req.query.id }, function (err) {
        
        GLOBAL.db_close();
        res.writeHead(200, { "Content-Type": "text/plain" });
        if (err) {
            GLOBAL.log(err, null);
            res.end(App_Message.ERROR_IN_PROCESS);
        }
        else {
            res.end(App_Message.SUCESS_IN_PROCESS);
        }
        
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

    _obj.title = GLOBAL.getString(aux.title); 
    _obj.message = GLOBAL.getString(aux.message); 
    _obj.country = GLOBAL.getString(aux.country); 
    _obj.phone = GLOBAL.getString(aux.phone); 
    _obj.email = GLOBAL.getString(aux.email);
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
            callParams.obj = new Support();
            callParams.obj = getParamsList(callParams.req, callParams.obj);
            
            saveByStep(callParams);
        }
    }
   
    // SAVE / UPDATE
    else if (callParams.step == 2) {

        GLOBAL.db_open();
        
        // UPDATE
        if (callParams.req.body._id !== undefined) {

            Support.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
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
    Support.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        callParams.old_obj = item;
        
        callback(callParams);
    });
}