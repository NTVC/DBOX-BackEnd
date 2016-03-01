require('./../models/HomeHighlights');
var HomeHighlights = GLOBAL.mongoose.model('HomeHighlights');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST HIGHLIGHTS
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
    // SAVE OR UPDATE HIGHLIGHT
    else if (req.body.save != undefined) {
        save(req, res);
    }
    
    // ---------------------------------------------
    // DELETE HIGHLIGHT BY ID
    else if (req.query.delete != undefined && req.query.id != undefined ) {
        remove(req, res);
    }
    // ---------------------------------------------
    // UPDATE ORDER APPS
    else if (req.query.order_apps != undefined && req.query.array != undefined) {
        var array = GLOBAL.getArray(req.query, "array");
        updateOrderHightlights(0, array, res);
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
            (params.filter.search == '' ? {} : ({ "title" : new RegExp(params.filter.search, 'i') })),
            (params.filter.status == '' ? {} : ({ "status" : JSON.parse(params.filter.status) })),
            (params.filter.country == '' ? {} : ({ "country" : params.filter.country }))
        ]
    });

    return filter;
};

// ======================================= =======================================  
// COUNT ALL HIGHLIGHTS ON THE DATABASE
// ======================================= ======================================= 
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    HomeHighlights.find(listAllFilter(params)).count(function (err, total) {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        if (err) {
            GLOBAL.log(err, null);
            res.end(App_Message.ERROR_IN_PROCESS);
        }
        else {
            res.end(String(total));
        }
        GLOBAL.db_close();
    });
        
};

// ======================================= =======================================  
// LIST ALL HIGHLIGHTS ON THE DATABASE
// ======================================= =======================================
var listAll = function (res, params) {
    GLOBAL.db_open();

    HomeHighlights.find(
        (
          listAllFilter(params))
        )
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .sort({ order: 1 })
        .exec(
        function (err, highlights) {
            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(highlights));
            }
            else {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            GLOBAL.db_close();
        }
    );
};

// ======================================= =======================================  
// UPDATE AND SAVE HIGHLIGHT
// ======================================= =======================================
var save = function (req, res) {
    
    var obj;

    // UPDATE
    if (req.body._id !== undefined) {
        
        obj = getParamsHomeHighlights(req, null);

        GLOBAL.db_open();

        HomeHighlights.findByIdAndUpdate(req.body._id, obj, function (err) {
            
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
    // SAVE NEW HIGHLIGHT
    else {

        obj = new HomeHighlights();
        obj = getParamsHomeHighlights(req, obj);
        
        GLOBAL.db_open();
        
        obj.registration = new Date().toISOString();

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

// ======================================= =======================================  
// REMOVE HIGHLIGHT FROM DATABASE
// ======================================= =======================================
var remove = function (req, res){
    
    GLOBAL.db_open();

    HomeHighlights.remove({ _id: req.query.id }, function (err) {
        
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

// ======================================= =======================================  
// GET PARAMS FROM POST AND BIND AN OBJECT
// ======================================= =======================================
var getParamsHomeHighlights = function(req, obj){
    
    var aux = JSON.parse(JSON.stringify(req.body));
    var _obj;

    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    if (aux._id != undefined) {
        _obj._id = aux._id;
    }
    
    _obj.title = GLOBAL.getString(aux.title);
    _obj.description = GLOBAL.getString(aux.description);
    _obj.order = GLOBAL.getNumber(aux.order);
    _obj.source = GLOBAL.getString(aux.source);
    _obj.country = GLOBAL.getString(aux.country);
    _obj.status = aux.status;
    _obj.registration = GLOBAL.getString(aux.registration);
    _obj.list = GLOBAL.getArray(aux, "list");

    return _obj;
}

// ======================================= =======================================  
// UPDATE ORDER TO DISPLAY AT THE USER INTERFACE
// ======================================= =======================================
var updateOrderHightlights = function (index, array, res) {
    
    if (index < array.length) {
        
        // VALIDATE IF CONTAINS ID
        if (GLOBAL.getString(array[index]) == "") {
            
            index += 1;
            updateOrderHightlights(index, array, res);
        }
        else {
            
            GLOBAL.db_open();
            HomeHighlights.update({ _id: array[index] } , { $set: { order : index } } , function (err, item) {
                
                GLOBAL.db_close();
                
                if (err) {
                    GLOBAL.log(err, null);
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end(App_Message.ERROR_IN_PROCESS);
                }
                else {
                    index += 1;
                    updateOrderHightlights(index, array, res);
                }
            });
        }
        
    }
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.SUCESS_IN_PROCESS);
    }

}