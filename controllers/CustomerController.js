require('./../models/Customer');
var Customer = GLOBAL.mongoose.model('Customer');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST CUSTOMERS
    if (req.query.list != undefined) {
        
        var params = {};
        
        params.filter = {
            search: req.query.search, 
            status: req.query.status, 
            country: req.query.country, 
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
    // SAVE OR UPDATE CUSTOMER
    else if (req.query.save != undefined) {
        save(req, res);
    }
    
    // ---------------------------------------------
    // DELETE CUSTOMER BY ID
    else if (req.query.delete != undefined && req.query.id != undefined) {
        remove(req, res);
    }
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.ERROR_IN_PROCESS);
    }
};

exports.findOne = function (id, callback, req, res) {
    findOne(id, callback, req, res);
}

// BUILD FILTER LIST ALL
var listAllFilter = function (params) {
    
    var filter = 
 ({
        $and: [
            
            (GLOBAL.isObjectId(params.filter.search) ? { "_id": params.filter.search} : (
                (params.filter.search != '' && (!GLOBAL.getNumber(params.filter.search)) )? 
                    {
                        $or : [
                            { "firstname": new RegExp(params.filter.search, 'i') }, 
                            { "lastname": new RegExp(params.filter.search, 'i') }, 
                            { "mail": new RegExp(params.filter.search, 'i') },
                            { "phone": new RegExp(params.filter.search, 'i') }
                        ]
                    } : {}
                )
            ),
            (params.filter.status == '' ? {} : ({ "status" : JSON.parse(params.filter.status) })),
            (params.filter.country == '' ? {} : ({ "address.country" : new RegExp(params.filter.country, 'i') }))
        ]
    });
    
    return filter;
};

// LIST ALL CUSTOMERS ON THE DATABASE
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    Customer.find(listAllFilter(params)).count(function (err, total) {
        
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

// LIST ALL CUSTOMERS ON THE DATABASE
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    Customer.find(
        (
          listAllFilter(params))
    )
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .exec(
        function (err, customer) {

            GLOBAL.db_close();

            if (!err) {
                
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(customer));
            }
            else {
                GLOBAL.log(err, null);
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(App_Message.ERROR_IN_PROCESS);
            }
        }
    );
};

// UPDATE AND SAVE CUSTOMER
var save = function (req, res) {
    
    var obj;
    
    // UPDATE
    if (req.query._id !== undefined) {
        
        obj = getParamsCustomer(req, null);
        
        GLOBAL.db_open();
        
        Customer.findByIdAndUpdate(req.query._id, obj, function (err) {
            
            GLOBAL.db_close();

            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
        });
        
    }
    // SAVE NEW CUSTOMER
    else {
        
        obj = new Customer();
        obj = getParamsCustomer(req, obj);
        
        GLOBAL.db_open();
        
        obj.save(function (err) {
            
            GLOBAL.db_close();
            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            } else {
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
        });
    }
}

// REMOVE CUSTOMER FROM DATABASE
var remove = function (req, res) {
    
    GLOBAL.db_open();
    
    Customer.remove({ _id: req.query.id }, function (err) {
        
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
var getParamsCustomer = function (req, obj) {
    
    var _obj;
    
    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    if (req.query._id != undefined) {
        _obj._id = req.query._id;
    }
    
    _obj.firstname = GLOBAL.getString(req.query.firstname);
    _obj.lastname = GLOBAL.getString(req.query.lastname);
    _obj.phone = GLOBAL.getString(req.query.phone);
    _obj.mail = GLOBAL.getString(req.query.mail);
    _obj.status = GLOBAL.getBoolean(req.query.status);
    _obj.address = JSON.parse(req.query.address);
    
    _obj.language = GLOBAL.getArray(req.query, "language");
    _obj.registration = req.query.registration == undefined ? new Date().toISOString() : req.query.registration;

    return _obj;
}

// FIND THE OBJ AND ADD callParams LIKE A OLD OBJECT
var findOne = function (id, callback, req, res) {
    
    GLOBAL.db_open();
    Customer.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();

        if (!err) {
            
            if (callback) {
                callback(item);
            }
            else{
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(item));
            }
        }
        else {
            GLOBAL.log(err, null);
            returnUtil.generateReturn(null, 101, null, 999, null, req, res);
        }


    });
}
