require('./../models/HomeWidgets');
var HomeWidgets = GLOBAL.mongoose.model('HomeWidgets');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST WIDGETS
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
    // SAVE OR UPDATE WIDGETS
    else if (req.body.save != undefined) {
        saveByStep({step:1, req: req, res:res});
    }
    
    // ---------------------------------------------
    // DELETE WIDGETS BY ID
    else if (req.query.delete != undefined && req.query.id != undefined) {
        remove(req, res);
    }
    
    // ---------------------------------------------
    // UPDATE ORDER WIDGETS
    else if (req.query.order_widgets != undefined && req.query.array != undefined) {
        var array = GLOBAL.getArray(req.query, "array");
        updateOrderWidgets(0, array, res);
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
    
    HomeWidgets.find(listAllFilter(params)).count(function (err, total) {
        
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

// LIST ALL WIDGETS ON THE DATABASE
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    HomeWidgets.find(
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
                res.writeHead(200, { "Content-Type": "application/json" });
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
    HomeWidgets.find(({ _id: req.query.id }), function (err, sponsor) {
        
        HomeWidgets.remove({ _id: req.query.id }, function (err) {
            
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
    _obj.html = GLOBAL.getString(aux.html);
    _obj.order = GLOBAL.getNumber(aux.order);
    _obj.country = GLOBAL.getString(aux.country);
    _obj.status = GLOBAL.getString(aux.status);
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
            callParams.obj = new HomeWidgets();
            callParams.obj = getParamsList(callParams.req, callParams.obj);
        }

        saveByStep(callParams);
    }
    // SAVE / UPDATE
    else if (callParams.step == 2) {

        GLOBAL.db_open();
        
        // UPDATE
        if (callParams.req.body._id !== undefined) {

            HomeWidgets.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
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

var findOneCB = function (id, callback, callParams) {
    
    GLOBAL.db_open();
    HomeWidgets.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        callParams.old_obj = item;
        
        callback(callParams);
    });
}

var updateOrderWidgets = function (index, array, res) {
    
    if (index < array.length) {
        
        // VALIDATE IF CONTAINS ID
        if (GLOBAL.getString(array[index]) == "") {
            
            index += 1;
            updateOrderWidgets(index, array, res);
        }
        else {
            
            GLOBAL.db_open();
            HomeWidgets.update({ _id: array[index] } , { $set: { order : index } } , function (err, item) {
                
                GLOBAL.db_close();
                
                if (err) {
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end(App_Message.ERROR_IN_PROCESS);
                }
                else {
                    index += 1;
                    updateOrderWidgets(index, array, res);
                }
            });
        }
        
    }
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.SUCESS_IN_PROCESS);
    }

}