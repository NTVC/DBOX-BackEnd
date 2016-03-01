require('./../models/Community');
require('./../util/generic');

var Community = GLOBAL.mongoose.model('Community');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST COMMUNITIES
    if (GLOBAL.getBoolean(req.body.list)) {
        
        var params = {};
        
        params.filter = {
            search: GLOBAL.getString(req.body.search), 
            country: GLOBAL.getString(req.body.country),
            status: GLOBAL.getString(req.body.status),
            category: GLOBAL.getString(req.body.category), 
            pg: {
                index: GLOBAL.getNumber(req.body.pg_index), 
                limit: GLOBAL.getNumber(req.body.pg_limit)
            }
        };
        
        // COUNT ONLY
        if (req.body.count != undefined) {
            listAllCount(res, params);
        }
        // ALL DATA
        else {
            listAll(res, params);
        }
       
    }
    // ---------------------------------------------
    // SAVE OR UPDATE COMMUNITY
    else if (GLOBAL.getBoolean(req.body.save)) {
        save(req, res);
    }
    // ---------------------------------------------
    // DELETE COMMUNITIES BY ID
    else if (GLOBAL.getBoolean(req.body.delete) && req.body.id != undefined) {
        remove(req, res, null, 1);
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
            params.filter.search != '' ? 
            {
                $or : [
                    { "title": new RegExp(params.filter.search, 'i') }, 
                    { "tags": new RegExp(params.filter.search, 'i') },
                ]
            } : {},
            (params.filter.status == '' ? {} : ({ "status" : JSON.parse(params.filter.status) })),
            (params.filter.category == '' ? {} : ({ "category" : params.filter.category })),
            (params.filter.country == '' ? {} : ({ "country" : new RegExp(params.filter.country, 'i') }))
        ]
    });
    return filter;
};

// ======================================= =======================================  
// GET QUANTITY OF COMMUNITIES ON THE DATABASE
// ======================================= =======================================
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    Community.find(listAllFilter(params)).count(function (err, total) {
        
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
//  LIST ALL COMMUNITIES ON THE DATABASE
// ======================================= =======================================
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    Community.find(
    (
        listAllFilter(params))
    )
    .skip(params.filter.pg.index * params.filter.pg.limit)
    .limit(params.filter.pg.limit)
    .exec(
    function (err, movie) {
        GLOBAL.db_close();

        if (!err) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(movie));
        }
        else {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(App_Message.ERROR_IN_PROCESS);
        }
    });
};

// UPDATE AND SAVE COMMUNITY
var save = function (req, res) {
    
    var obj;
    
    // UPDATE
    if (req.body._id !== undefined) {
        
        obj = getParamsCommunity(req, null);
        updateByStep({ step: 1, obj: obj, req : req, res : res });
    }
    // SAVE NEW COMMUNITY
    else {
        
        obj = new Community();
        obj = getParamsCommunity(req, obj);
        saveByStep({ step: 1, obj: obj, req : req, res : res });
       
    }
}

var saveObj = function (callParams) {
    
    GLOBAL.db_open();
    
    callParams.obj.save(function (err) {
        
        GLOBAL.db_close();

        callParams.res.writeHead(200, { "Content-Type": "text/plain" });
        if (err) {
            callParams.res.end(App_Message.ERROR_IN_PROCESS);
        } else {
            callParams.res.end(App_Message.SUCESS_IN_PROCESS);
        }
        
    });
}


var error = function(res){
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(App_Message.ERROR_IN_PROCESS);
}

// ======================================= =======================================  
// REMOVE OBJECT FROM THE DATABASE
// ======================================= =======================================
var remove = function (req, res, obj, step) {
    
    // GET COMMUNITY
    if(step == 1){
        
        GLOBAL.db_open();
        Community.findOne(({ _id: req.body.id }), function (err, community) {
            
            GLOBAL.db_close();
            
            if(err){
                error(res);
            }
            else{
                obj = community;
                remove(req, res, obj, 2);
            }
            
        });
    }
    
    // GET ALL LISTS
    else if(step == 2){
        
        try{
            getArrayList(obj._id, function(lists){
                
                obj.lists = lists;
                remove(req, res, obj, 3);
            });
            
        }catch(ex){
            error(res);
        }
    }
    // GET ALL VIDEOS
    else if(step == 3){
        
        try{
            getArrayVideo(obj._id, function(videos){
                
                obj.videos = videos;
                remove(req, res, obj, 4);
            });
            
        }catch(ex){
            error(res);
        }
    }
    // DELETE ALL VIDEOS
    else if(step == 4){
        
        try{ 
            GLOBAL.db_open();
    
            require('./../models/Community.video');
            var CommunityVideo = GLOBAL.mongoose.model('CommunityVideo');
            CommunityVideo.remove({ community_id: obj._id }, function (err) {
                GLOBAL.db_close();
                
                if(err){
                    error(res);
                }
                else{
                    remove(req, res, obj, 5);
                }
            });
            
        }catch(ex){
            error(res);
        }
    }
    // DELETE ALL LIST
    else if(step == 5){
        
        try{ 
            GLOBAL.db_open();
    
            require('./../models/Community.list');
            var CommunityList = GLOBAL.mongoose.model('CommunityList');
            CommunityList.remove({ community_id: obj._id }, function (err) {
                GLOBAL.db_close();
                
                if(err){
                    error(res);
                }
                else{
                    remove(req, res, obj, 6);
                }
            });
            
        }catch(ex){
            error(res);
        }
    }
    // DELETE COMMUNITY
    else if(step == 6){
        
        try{ 
            GLOBAL.db_open();
    
            Community.remove({ _id: obj._id }, function (err) {
                    GLOBAL.db_close();
                    
                    if(err){
                        error(res);
                    }
                    else{
                        remove(req, res, obj, 7);
                    }
            });
                
        }catch(ex){
            error(res);
        }
    }
    else{
        
        try {
            
            // DELETE LIST THUMBNAIL
            if (obj.lists) {
                for (var i = 0; i < obj.lists.length; i++) {
                    if (obj.lists[i].thumb) {
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_COMMUNITY_LIST + path.basename(obj.lists[i].thumb));
                    }
                }
            }
           
            // DELETE MAIN THUMBNAIL
            if (obj.thumb) {
                GLOBAL.deleteFile(GLOBAL.path.SERVER_COMMUNITY + path.basename(obj.thumb));
            }
            // DELETE MAIN COVER
            if (obj.cover) {
                GLOBAL.deleteFile(GLOBAL.path.SERVER_COMMUNITY_COVER + path.basename(obj.cover));
            }
            // DELETE MAIN BACKGROUND
            if (obj.background) {
                GLOBAL.deleteFile(GLOBAL.path.SERVER_COMMUNITY_BACKGROUND + path.basename(obj.background));
            }
            
            removeReferences(req.body.id);
                
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(App_Message.SUCESS_IN_PROCESS);
            
        } catch (error) {
            error(res);
        }
    }      
}

var removeReferences = function(id){
    require('./../models/HomeHighlights');
    var HomeHighlights = GLOBAL.mongoose.model('HomeHighlights');
    
    GLOBAL.db_open();
    
    HomeHighlights.update(
        { source: 4 },
        { $pull: 
            { 'list': 
                { 
                    "type_content": 2, "id": id 
                } 
            } 
        },
        {multi: true}, 
        function(err, result) {
            if (err){
                console.log(err);
            }
        }
    );
    
    GLOBAL.db_close();
};

// GET ALL LIST THAT IT HAAS A RELATION WITH THIS COMMUNITY
var getArrayList = function (community_id, callback) {
    GLOBAL.db_open();
    
    require('./../models/Community.list');
    var CommunityList = GLOBAL.mongoose.model('CommunityList');
    
    CommunityList.find({community_id : community_id})
    .exec(
    function (err, arrayList) {
        GLOBAL.db_close();
        callback(arrayList);
    });
};

// GET ALL VIDEOS THAT IT HAAS A RELATION WITH THIS COMMUNITY
var getArrayVideo = function (community_id, callback) {
    GLOBAL.db_open();
    
    require('./../models/Community.video');
    var CommunityVideo = GLOBAL.mongoose.model('CommunityVideo');
    
    CommunityVideo.find({community_id : community_id})
    .exec(
    function (err, arrayVideo) {
        GLOBAL.db_close();
        callback(arrayVideo);
    });
};

// ======================================= =======================================  
// GET PARAMS FROM POST AND BIND AN OBJECT
// ======================================= =======================================
var getParamsCommunity = function (req, obj) {
    
    var aux = JSON.parse(JSON.stringify(req.body));
    var _obj;
    
    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    if (req.query._id != undefined) {
        _obj._id = req.query._id;
    }
    
    _obj.status         = GLOBAL.getBoolean(aux.status);
    _obj.title          = GLOBAL.getString(aux.title);
    _obj.description    = GLOBAL.getString(aux.description);

    _obj.video_counter  = GLOBAL.getNumber(aux.video_counter);
    _obj.thumb          = GLOBAL.getString(aux.thumb);
    _obj.cover          = GLOBAL.getString(aux.cover);
    _obj.background     = GLOBAL.getString(aux.background);
    
    _obj.tags           = GLOBAL.getArray(aux, "tags");
    _obj.category       = GLOBAL.getArray(aux, "category");
    
    _obj.language       =  GLOBAL.getArray(aux, "language");
    _obj.country        = aux.country;
    
    return _obj;
}

var update = function (id, obj, res) {
    
    Community.findByIdAndUpdate(id, obj, function (err, item) {
        
        GLOBAL.db_close();

        res.writeHead(200, { "Content-Type": "text/plain" });
        if (err) {
            GLOBAL.log(err, null);
            res.end(App_Message.ERROR_IN_PROCESS);
        }
        else {
            res.end(JSON.stringify(item));
        }
    });

}

// ======================================= =======================================  
// FIND THE OBJ AND ADD callParams LIKE A OLD OBJECT
// ======================================= =======================================
var findOneCB = function (id, callback, callParams) {
    
    GLOBAL.db_open();
    Community.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        callParams.old_obj = item;
        
        callback(callParams);
    });
}

var saveByStep = function (callParams) {
    
    if (callParams.step == 1) {
        
        callParams.step = 2;
        callParams.img_step = 1;
        callParams.callback = saveByStep;
        
        getAndSetMainImages(callParams);
    }
    else {
        
        saveObj(callParams);
    }
}

var updateByStep = function (callParams) {
    
    var callParams;
    var thumbName;
    
    // GET OBJ
    if (callParams.step == 1) {
        callParams.step = 2;
        findOneCB(callParams.req.body._id, updateByStep, callParams);
    }
    // GET MAIN IMAGES
    else if (callParams.step == 2) {
        
        callParams.step = 3;
        callParams.img_step = 1;
        callParams.callback = updateByStep;
        getAndSetMainImages(callParams);
    }
    else {
        // UPDATE JSON
        update(callParams.old_obj._id, callParams.obj, callParams.res);
    }
}

var getAndSetMainImages = function (callParams) {
    
    var thumbName;
    
    
    // SAVE THUMBNAIL
    if (callParams.img_step == 1) {
        
        callParams.img_step = 2;
        
        var thumb_file = callParams.req.files.thumb_file;
        
        // THUMBNAIL EXIST
        if (thumb_file) {
            
            var thumbName = GLOBAL.imageName(thumb_file);
            
            GLOBAL.saveFile(thumb_file, thumbName, GLOBAL.path.SERVER_COMMUNITY, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if(callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_COMMUNITY + path.basename(callParams.old_obj.thumb));

                    callParams.obj.thumb = GLOBAL.path.WEB_COMMUNITY + thumbName;
                }
                getAndSetMainImages(callParams);


            });
           
        }
        else {
            getAndSetMainImages(callParams);
        }
    }
    // SAVE COVER
    else if (callParams.img_step == 2) {
        
        callParams.img_step = 3;
        
        var cover_file = callParams.req.files.cover_file;
        
        // COVER EXIST
        if (cover_file) {
            
            var thumbName = GLOBAL.imageName(cover_file);
            
            GLOBAL.saveFile(cover_file, thumbName, GLOBAL.path.SERVER_COMMUNITY_COVER, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_COMMUNITY_COVER + path.basename(callParams.old_obj.cover));

                    callParams.obj.cover = GLOBAL.path.WEB_COMMUNITY_COVER + thumbName;
                }
                getAndSetMainImages(callParams);


            });
           
        }
        else {
            getAndSetMainImages(callParams);
        }
    }
    // SAVE BACKGROUND
    else if (callParams.img_step == 3) {
        
        var background_file = callParams.req.files.background_file;
        
        // BACKGROUND EXIST
        if (background_file) {
            
            var thumbName = GLOBAL.imageName(background_file);
            
            GLOBAL.saveFile(background_file, thumbName, GLOBAL.path.SERVER_COMMUNITY_BACKGROUND, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj)
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_COMMUNITY_BACKGROUND + path.basename(callParams.old_obj.background));

                    callParams.obj.background = GLOBAL.path.WEB_COMMUNITY_BACKGROUND + thumbName;
                }
                
                callParams.callback(callParams);

            });
           
        }
        else {
            callParams.callback(callParams);
        }
    }
};