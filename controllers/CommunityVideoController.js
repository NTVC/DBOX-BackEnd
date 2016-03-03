require('./../models/Community.video');
require('./../util/generic');

var CommunityVideo = GLOBAL.mongoose.model('CommunityVideo');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // VIDEO ALL BY COMMUNITY ID
    if (GLOBAL.getBoolean(req.query.getVideo) && req.query.community_id != undefined && req.query.community_list_id != undefined) {
        
        var params = {};
        
        params.filter = {
            search: GLOBAL.getString(req.query.search), 
            community_id: GLOBAL.getString(req.query.community_id), 
            community_list_id: GLOBAL.getString(req.query.community_list_id), 
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
    // SAVE OR UPDATE VIDEO OF COMMUNITY
    else if (req.body.save != undefined) {
        saveByStep({step:1, req: req, res:res});
    }
    // ---------------------------------------------
    // DELETE COMMUNITIES BY ID
    else if (GLOBAL.getBoolean(req.body.delete) && req.body._id != undefined) {
        remove(req, res);
    }
    else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.ERROR_IN_PROCESS);
    }

};

// --------------------------------------------- COMMUNITY -------------------------------------------------
// BUILD FILTER VIDEO ALL

var listAllFilter = function (params) {
    
    var filter = 
    ({
        $and: [
            (params.filter.search == '' ? {} : ({ "title": new RegExp(params.filter.search, 'i') })),
            {"community_id" : params.filter.community_id},
            {"community_list_id" : params.filter.community_list_id},
            { "status" : params.filter.status}
        ]
    });
    return filter;
};


// LIST ALL ADMINS ON THE DATABASE
var getArrayVideoCount = function (res, params) {
    GLOBAL.db_open();
    
    CommunityVideo.find(listAllFilter(params)).count(function (err, total) {
        
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

// VIDEO ALL COMMUNITIES ON THE DATABASE
var getArrayVideo = function (res, params) {
    GLOBAL.db_open();
    
    CommunityVideo.find(listAllFilter(params))
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
            GLOBAL.log(err, null);
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(App_Message.ERROR_IN_PROCESS);
        }
    });
};

// GET PARAMS FROM POST AND BIND AN OBJECT
var getParamsVideo = function (req, obj) {
    
    var aux = JSON.parse(JSON.stringify(req.body));
    var _obj;
    
    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    if (GLOBAL.isObjectId(req.body._id)) {
        _obj._id = req.body._id;
    }

    _obj.community_id = aux.community_id; 
    _obj.community_list_id = aux.community_list_id; 
    _obj.url = GLOBAL.getString(aux.url); 
    _obj.title = GLOBAL.getString(aux.title); 
    _obj.description = GLOBAL.getString(aux.description); 
    _obj.year = GLOBAL.getString(aux.year);
    _obj.status = GLOBAL.getBoolean(aux.status);
    _obj.registration = GLOBAL.getString(aux.registration);
    _obj.isPublished = GLOBAL.getBoolean(aux.isPublished);
    
    return _obj;
}


var saveByStep = function (callParams){
    
    // GET OBJ
    if (callParams.step == 1) {
        
        callParams.step = 2;
        callParams.obj = null;

        // UPDATE
        if (GLOBAL.isObjectId(callParams.req.body._id )) {
            callParams.obj = getParamsVideo(callParams.req, null);
            saveByStep(callParams);
        }
        else {
            callParams.obj = new CommunityVideo();
            callParams.obj = getParamsVideo(callParams.req, callParams.obj);
            
            saveByStep(callParams);
        }
    }
    // VIDEO MOVIE
    else if (callParams.step == 2) {
        
        callParams.step = 3;
        
        var file = callParams.req.files.file;

        // FILE EXIST
        if (file) {
            
            var path = require('path');
            var ext = path.extname(file.name);
            var thumbName = String(callParams.obj.id) + ext;
            
            GLOBAL.saveFile(file, thumbName, GLOBAL.path.SERVER_COMMUNITY_TEMP_PATH, function (r, thumbName) {
                
                if (r) {
                    callParams.obj.url = GLOBAL.path.SERVER_COMMUNITY_TEMP_PATH + thumbName;
                }
                saveByStep(callParams);

            });
           
        }
        else{
            saveByStep(callParams);
        }
        
    }
    // SAVE / UPDATE
    else if (callParams.step == 3) {

        GLOBAL.db_open();
        
        // UPDATE
        if (GLOBAL.isObjectId(callParams.req.body._id)) {

            CommunityVideo.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                GLOBAL.db_close();
                
                // DELETE TEMP FILE
                if(err){
                    GLOBAL.deleteFile(callParams.obj.url);
                }
                
                done(callParams.res, GLOBAL.getJson(callParams.obj.community_id), err);
            });
        }
        // SAVE NEW OBJ
        else {
            
            callParams.obj.registration = new Date().toISOString();
            callParams.obj.save(function (err) {
                GLOBAL.db_close();
                done(callParams.res, GLOBAL.getJson(callParams.obj.community_id), err);
            });
        }
    }
}


// REMOVE VIDEO OF COMMUNITY FROM DATABASE
var remove = function (req, res) {
    
    GLOBAL.db_open();
      
    CommunityVideo.remove({ _id: req.body._id }, function (err) {
        
        GLOBAL.db_close();
        done(res,req.body.community_id, err);
        
    });
}

var done = function(res, community_id, err){
    
    res.writeHead(200, { "Content-Type": "text/plain" });
                 
    if (err) {
        GLOBAL.log(err, null);
        res.end(App_Message.ERROR_IN_PROCESS);
    } else {
        setTotalVideos(community_id);
        res.end(App_Message.SUCESS_IN_PROCESS);
    }
}

var setTotalVideos = function(community_id){
   GLOBAL.db_open();
    
    CommunityVideo.find({status:true, community_id: community_id}).count(function (err, total) {
        GLOBAL.db_close();
        
        require('./../models/Community');
        var Community = GLOBAL.mongoose.model('Community');
        
        GLOBAL.db_open();
        Community.update({ _id:community_id} , {"$set":{video_counter: total}},{safe:true},function(error, result){
            GLOBAL.db_close();
            
        });
    });
        
};


// --------------------------------------------- END COMMUNITY ---------------------------------------------