require('./../models/Device');
require('./../util/generic');

var Device = GLOBAL.mongoose.model('Device');
var path = require('path');

exports.process = function (req, res) {
    // ---------------------------------------------
    // LIST DEVICES
    if (req.query.list != undefined) {
        
        var params = {};
        
        params.filter = {
            search: GLOBAL.getString(req.query.search), 
            status: GLOBAL.getString(req.query.status), 
            ref: GLOBAL.getString(req.query.ref), 
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
    else if (req.query.save != undefined) {
        saveByStep({ step: 1, req: req, res: res });
    }
    
    // ---------------------------------------------
    // DELETE DEVICES BY ID
    else if (req.query.delete != undefined && req.query.id != undefined) {
        remove(req, res);
    }
    // ---------------------------------------------
    // CHECK IS MAC REGISTER ON THE DATABASE
    else if (req.query.ethMac != undefined && req.query.check != undefined) {
        isMacRegister(req.query.ethMac, res);
    }
    // ---------------------------------------------
    // CHECK IS MAC REGISTER ON THE DATABASE
    else if (req.query.customer_id != undefined && req.query.listByUser != undefined) {
        var customer_id = GLOBAL.getString(req.query.customer_id);
        if (customer_id) {
            listByUserId(customer_id, res);
        }
        else {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(App_Message.ERROR_IN_PROCESS);
        }
    }
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.ERROR_IN_PROCESS);
    }

};

// CHECK IF USERNAME IS AVAILABLE
var isMacRegister = function (ethMac, res) {
    GLOBAL.db_open();
    
    Device.find({ "ethMac": ethMac })
    .limit(1)
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
}

// BUILD FILTER LIST ALL
var listAllFilter = function (params) {
    
    var filter = 
    ({
        $and: [
            GLOBAL.getString(params.filter.search) != '' ? 
            {
                $or : [
                    { "ethMac": new RegExp(params.filter.search, 'i') }, 
                    { "wMac": new RegExp(params.filter.search, 'i') }, 
                    { "model_number": new RegExp(params.filter.search, 'i') },
                    { "uid": new RegExp(params.filter.search, 'i') }
                ]
            } : {},
            (params.filter.status == '' ? {} : ({ "status" : JSON.parse(params.filter.status) })),
            (params.filter.ref == '' ? {} : ({ "customer" : null }))
        ]
    });
    return filter;
};

// LIST ALL DEVICES ON THE DATABASE
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    Device.find(listAllFilter(params)).count(function (err, total) {
        
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

// LIST ALL DEVICES ON THE DATABASE
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    Device.find(
        (
          listAllFilter(params))
        )
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

// LIST ALL DEVICES ON THE DATABASE
var listByUserId = function (customer_id, res) {
    GLOBAL.db_open();
    
    Device.find({ 'customer.id' : customer_id })
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
    Device.find(({ _id: req.query.id }), function (err, device) {
        
        Device.remove({ _id: req.query.id }, function (err) {

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

// ======================================= =======================================  
// GET PARAMS FROM POST AND BIND AN OBJECT
// ======================================= =======================================
var getParamsDevice = function (req, obj) {
    
    var aux = JSON.parse(JSON.stringify(req.query));
    var _obj;
    
    if (obj == null)
        _obj = {};
    else
        _obj = obj;

    
    if (req.body._id != undefined) {
        _obj._id = req.body._id;
    }

    _obj.wMac           = GLOBAL.getString(aux.wMac);
    _obj.ethMac         = GLOBAL.getString(aux.ethMac);
    _obj.model_number   = GLOBAL.getString(aux.model_number);
    _obj.version_code   = GLOBAL.getString(aux.version_code);
    _obj.uid            = GLOBAL.getString(aux.uid);
    _obj.status         = GLOBAL.getBoolean(aux.status);
    _obj.registration   = GLOBAL.getString(aux.registration);
    
    if (aux.customer) {
        var customer = JSON.parse(req.query.customer);
        _obj.customer = {
            id: GLOBAL.getString(customer.id),
            name: GLOBAL.getString(customer.name)
        };
    }
    else {
        _obj.customer = null;
    }
    
    return _obj;
}

var saveByStep = function (callParams) {
    
    // GET OBJ
    if (callParams.step == 1) {
        
        callParams.step = 2;
        callParams.obj = null;
        
        // UPDATE
        if (callParams.req.query._id !== undefined) {
            callParams.obj = getParamsDevice(callParams.req, null);
        }
        else {
            callParams.obj = new Device();
            callParams.obj = getParamsDevice(callParams.req, callParams.obj);
        }
        
        saveByStep(callParams);
    }
    // SAVE / UPDATE
    else if (callParams.step == 2) {
        
        GLOBAL.db_open();
        
        // UPDATE
        if (callParams.req.query._id !== undefined) {
            
            Device.findByIdAndUpdate(callParams.req.query._id, callParams.obj, function (err) {
                
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
