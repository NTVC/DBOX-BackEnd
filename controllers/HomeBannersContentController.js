require('./../models/HomeBanners.content');
require('./../util/generic');

var HomeBannersContent = GLOBAL.mongoose.model('HomeBannersContent');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST ALL BY CONTENT ID
    if (GLOBAL.getBoolean(req.query.getContent) && req.query.homebanners_id != undefined) {
        
        var params = {};
        
        params.filter = {
            search: GLOBAL.getString(req.query.search), 
            homebanners_id: GLOBAL.getString(req.query.homebanners_id), 
            status: GLOBAL.getString(req.query.status),
            pg: {
                index: GLOBAL.getNumber(req.query.pg_index), 
                limit: GLOBAL.getNumber(req.query.pg_limit)
            }
        };
        
        // COUNT ONLY
        if (req.query.count != undefined) {
            getArrayContentCount(res, params);
        }

        // ALL DATA
        else {
            getArrayContent(res, params);
        }
    }
    // ---------------------------------------------
    // SAVE OR UPDATE LIST OF CONTENT
    else if (GLOBAL.getBoolean(req.body.save)) {
        saveByStep({step:1, req: req, res:res});
    }
    // ---------------------------------------------
    // DELETE CONTENT BY ID
    else if (GLOBAL.getBoolean(req.body.delete) && req.body._id != undefined) {
        remove(req, res);
    }
    // ---------------------------------------------
    // UPDATE ORDER APPS
    else if (req.query.order_contents != undefined && req.query.array != undefined) {
        var array = GLOBAL.getArray(req.query, "array");
        updateOrderContents(0, array, res);
    }
    else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.ERROR_IN_PROCESS);
    }

};

// --------------------------------------------- CONTENT -------------------------------------------------
// BUILD FILTER LIST ALL

var contentAllFilter = function (params) {
    
    var filter = 
    ({
        $and: [
            (params.filter.search == '' ? {} : ({ "title": new RegExp(params.filter.search, 'i') })),
            {"homebanners_id" : params.filter.homebanners_id}
        ]
    });
    return filter;
};


// LIST ALL CONTENTS ON THE DATABASE
var getArrayContent = function (res, params) {
    GLOBAL.db_open();
    
    HomeBannersContent.find(contentAllFilter(params))
    .sort({order: 1})
    .skip(params.filter.pg.index * params.filter.pg.limit)
    .limit(params.filter.pg.limit)
    .exec(
    function (err, arrayContent) {
        GLOBAL.db_close();

        if (!err) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(arrayContent));
        }
        else {
            GLOBAL.log(err, null);
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(App_Message.ERROR_IN_PROCESS);
        }
    });
};

// LIST ALL ADMINS ON THE DATABASE
var getArrayContentCount = function (res, params) {
    GLOBAL.db_open();
    
    HomeBannersContent.find(contentAllFilter(params)).count(function (err, total) {
        
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

// GET PARAMS FROM POST AND BIND AN OBJECT
var getParamsContent = function (req, obj) {
    
    var aux = JSON.parse(JSON.stringify(req.body));
    var _obj;
    
    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    if (req.body._id != undefined) {
        _obj._id = req.body._id;
    }

    _obj.homebanners_id = aux.homebanners_id; 
    _obj.invoke = GLOBAL.getString(aux.invoke); 
    _obj.parameter = GLOBAL.getString(aux.parameter); 
    _obj.order = GLOBAL.getNumber(aux.order); 
    _obj.banner = GLOBAL.getString(aux.banner);
    _obj.status = GLOBAL.getBoolean(aux.status);
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
            callParams.obj = getParamsContent(callParams.req, null);
            findOneCB(callParams.req.body._id, saveByStep, callParams);
        }
        else {
            callParams.obj = new HomeBannersContent();
            callParams.obj = getParamsContent(callParams.req, callParams.obj);
            
            saveByStep(callParams);
        }
    }
    // CHECK THUMBNAIL
    else if (callParams.step == 2) {
        
        callParams.step = 3;
        var banner_file = callParams.req.files.banner_file;
        
        // THUMBNAIL EXIST
        if (banner_file) {
            
            var thumbName = GLOBAL.imageName(banner_file);
            
            GLOBAL.saveFile(banner_file, thumbName, GLOBAL.path.SERVER_HOME_BANNER, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_HOME_BANNER + path.basename(callParams.old_obj.banner));

                    callParams.obj.banner = GLOBAL.path.WEB_HOME_BANNER + thumbName;
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

            HomeBannersContent.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
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

// FIND THE OBJ AND ADD callParams LIKE A OLD OBJECT
var findOneCB = function (id, callback, callParams) {
    
    GLOBAL.db_open();
    HomeBannersContent.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        callParams.old_obj = item;
        
        callback(callParams);
    });
}

// REMOVE LIST OF CONTENT FROM DATABASE
var remove = function (req, res) {
    
    GLOBAL.db_open();
    
    HomeBannersContent.findOne(({ _id: req.body._id }), function (err, content) {
        
        HomeBannersContent.remove({ _id: req.body._id }, function (err) {
            
            GLOBAL.db_close();

            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                
                // DELETE LIST THUMBNAIL
                if (content.banner) {
                    GLOBAL.deleteFile(GLOBAL.path.SERVER_HOME_BANNER + path.basename(content.banner));

                }
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
            
        });
    });
}


var updateOrderContents = function (index, array, res) {
    
    if (index < array.length) {
        
        // VALIDATE IF CONTAINS ID
        if (GLOBAL.getString(array[index]) == "") {
            
            index += 1;
            updateOrderContents(index, array, res);
        }
        else {
            
            GLOBAL.db_open();
            HomeBannersContent.update({ _id: array[index] } , { $set: { order : index } } , function (err, item) {
                
                GLOBAL.db_close();
                
                if (err) {
                    GLOBAL.log(err, null);
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end(App_Message.ERROR_IN_PROCESS);
                }
                else {
                    index += 1;
                    updateOrderContents(index, array, res);
                }
            });
        }
        
    }
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.SUCESS_IN_PROCESS);
    }

}
// --------------------------------------------- END CONTENT ---------------------------------------------