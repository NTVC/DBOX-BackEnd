require('./../models/TvSeries.video');
require('./../util/generic');

var TvSeriesVideo = GLOBAL.mongoose.model('TvSeriesVideo');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // VIDEO ALL BY TV_SERIES ID
    if (GLOBAL.getBoolean(req.query.getVideo) && req.query.tvserie_id != undefined && req.query.tvserie_list_id != undefined) {
        
        var params = {};
        
        params.filter = {
            search: GLOBAL.getString(req.query.search), 
            tvserie_id: GLOBAL.getString(req.query.tvserie_id), 
            tvserie_list_id: GLOBAL.getString(req.query.tvserie_list_id), 
            status: GLOBAL.getBoolean(req.query.status),
            pg: {
                index: GLOBAL.getNumber(req.query.pg_index), 
                limit: GLOBAL.getNumber(req.query.pg_limit)
            }
        };
        
        
        // COUNT ONLY
        if (GLOBAL.getBoolean(req.query.count)) {
            getArrayVideoCount(res, params);
        }

        // ALL DATA
        else {
            getArrayVideo(res, params);
        }
        
    }
    // ---------------------------------------------
    // SAVE OR UPDATE VIDEO OF TV_SERIES
    else if (GLOBAL.getBoolean(req.body.save)) {
        saveByStep({step:1, req: req, res:res});
    }
    // ---------------------------------------------
    // DELETE TV SERIES BY ID
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
            {"tvserie_id" : params.filter.tvserie_id},
            {"tvserie_list_id" : params.filter.tvserie_list_id},
            { "status" : params.filter.status}
        ]
    });
    return filter;
};


// ======================================= =======================================  
// GET QUANTITY OF OBJECTS ON THE DATABASE
// ======================================= =======================================
var getArrayVideoCount = function (res, params) {
    GLOBAL.db_open();
    
    TvSeriesVideo.find(listAllFilter(params)).count(function (err, total) {
        
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
//  LIST ALL OBJECTS ON THE DATABASE
// ======================================= =======================================
var getArrayVideo = function (res, params) {
    GLOBAL.db_open();
    
    TvSeriesVideo.find(listAllFilter(params))
    .sort({registration: -1})
    .skip(params.filter.pg.index * params.filter.pg.limit)
    .limit(params.filter.pg.limit)
    .exec(
    function (err, arrayVideo) {
        GLOBAL.db_close();

        if (!err) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(arrayVideo));
        }
        else {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(App_Message.ERROR_IN_PROCESS);
        }
    });
};

// ======================================= =======================================  
// GET PARAMS FROM POST AND BIND AN OBJECT
// ======================================= =======================================
var getParamsVideo = function (req, obj) {
    
    var aux = JSON.parse(JSON.stringify(req.body));
    var _obj;
    
    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    if (req.body._id != undefined) {
        _obj._id = req.body._id;
    }

    _obj.tvserie_id         = aux.tvserie_id; 
    _obj.tvserie_list_id    = aux.tvserie_list_id; 
    _obj.url                = GLOBAL.getString(aux.url); 
    _obj.title              = GLOBAL.getString(aux.title); 
    _obj.description        = GLOBAL.getString(aux.description); 
    _obj.year               = GLOBAL.getString(aux.year);
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
            callParams.obj = getParamsVideo(callParams.req, null);
            saveByStep(callParams);
        }
        else {
            callParams.obj = new TvSeriesVideo();
            callParams.obj = getParamsVideo(callParams.req, callParams.obj);
            
            saveByStep(callParams);
        }
    }
    // SAVE / UPDATE
    else if (callParams.step == 2) {

        GLOBAL.db_open();
        
        // UPDATE
        if (callParams.req.body._id !== undefined) {

            TvSeriesVideo.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                GLOBAL.db_close();
                done(callParams.res, GLOBAL.getJson(callParams.obj.tvserie_id), err);
            });
        }
        // SAVE NEW OBJ
        else {
            
            callParams.obj.registration = new Date().toISOString();
            callParams.obj.save(function (err) {
                GLOBAL.db_close();
                done(callParams.res, GLOBAL.getJson(callParams.obj.tvserie_id), err);
            });
        }
    }
}

// ======================================= =======================================  
// REMOVE OBJECT FROM THE DATABASE
// ======================================= =======================================
var remove = function (req, res) {
    
    GLOBAL.db_open();
      
    TvSeriesVideo.remove({ _id: req.body._id }, function (err) {
        
        GLOBAL.db_close();
        done(res,req.body.tvserie_id, err);
        
    });
}

var done = function(res, tvserie_id, err){
    
    res.writeHead(200, { "Content-Type": "text/plain" });
                 
    if (err) {
        res.end(App_Message.ERROR_IN_PROCESS);
    } else {
        setTotalVideos(tvserie_id);
        res.end(App_Message.SUCESS_IN_PROCESS);
    }
}

var setTotalVideos = function(tvserie_id){
   GLOBAL.db_open();
    
    TvSeriesVideo.find({status:true, tvserie_id: tvserie_id}).count(function (err, total) {
        GLOBAL.db_close();
        
        require('./../models/TvSeries');
        var TvSeries = GLOBAL.mongoose.model('TvSeries');
        
        GLOBAL.db_open();
        TvSeries.update({ _id:tvserie_id} , {"$set":{video_counter: total}},{safe:true},function(error, result){
            GLOBAL.db_close();
            
        });
    }); 
};
