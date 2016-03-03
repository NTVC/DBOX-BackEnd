require('./../models/Movie');
require('./../util/generic');

var Movie = GLOBAL.mongoose.model('Movie');
var path = require('path');

exports.process = function (req, res) {
    // ---------------------------------------------
    // LIST MOVIES
    if (req.query.list != undefined) {
        
        var params = {filter: req.query};
        
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
    // SAVE OR UPDATE MOVIES
    else if (req.body.save != undefined) {
        saveByStep({ step: 1, req: req, res: res });
    }
    
    // ---------------------------------------------
    // DELETE MOVIES BY ID
    else if (req.query.delete != undefined && req.query.id != undefined) {
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
            params.filter.search != '' ? 
            {
                $or : [
                    { "title": new RegExp(params.filter.search, 'i') }, 
                    { "tags": new RegExp(params.filter.search, 'i') }
                ]
            } : {},
            (params.filter.active == '' ? {} : ({ "active" : JSON.parse(params.filter.active) })),
            { "isPublished" : GLOBAL.getBoolean(params.filter.isPublished) }
        ]
    });
    return filter;
};

// ======================================= =======================================  
// GET QUANTITY OF MOVIES ON THE DATABASE
// ======================================= =======================================
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    Movie.find(listAllFilter(params)).count(function (err, total) {
        
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

// ======================================= =======================================  
//  LIST ALL MOVIE ON THE DATABASE
// ======================================= =======================================
var listAll = function (res, params) {
    GLOBAL.db_open();
    
    Movie.find(
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
    Movie.find(({ _id: req.query.id }), function (err, movie) {
        
        Movie.remove({ _id: req.query.id }, function (err) {

            GLOBAL.db_close();
            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                
                GLOBAL.deleteFile(GLOBAL.path.SERVER_MOVIE + path.basename(movie[0].thumb));
                GLOBAL.deleteFile(GLOBAL.path.SERVER_MOVIE_COVER + path.basename(movie[0].cover));
                removeReferences(req.query.id);
                
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
        
        });
    });
}

var removeReferences = function(id){
    require('./../models/HomeHighlights');
    var HomeHighlights = GLOBAL.mongoose.model('HomeHighlights');
    
    GLOBAL.db_open();
    
    HomeHighlights.update(
        { source: 2 },
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

// ======================================= =======================================  
// GET PARAMS FROM POST AND BIND AN OBJECT
// ======================================= =======================================
var getParamsMovie = function (req, obj) {
    
    var aux = JSON.parse(JSON.stringify(req.body));
    var _obj;
    
    if (obj == null)
        _obj = {};
    else
        _obj = obj;

    if (GLOBAL.isObjectId(req.query._id)) {
        _obj._id = req.query._id;
    }

    _obj.tags           = GLOBAL.getArray(aux, "tags");
    _obj.category       = GLOBAL.getArray(aux, "category");
    
    _obj.title          = GLOBAL.getString(aux.title); 
    _obj.description    = GLOBAL.getString(aux.description);
    _obj.url            = GLOBAL.getString(aux.url);

    _obj.thumb          = GLOBAL.getString(aux.thumb);
    _obj.cover          = GLOBAL.getString(aux.cover);

    _obj.active         = GLOBAL.getBoolean(aux.active);
    _obj.exibitiondate  = GLOBAL.getString(aux.exibitiondate);
    _obj.lenght         = GLOBAL.getString(aux.lenght);
    
    _obj.rated          = GLOBAL.getString(aux.rated);
    _obj.director       = GLOBAL.getString(aux.director);
    _obj.writer         = GLOBAL.getString(aux.writer);
    _obj.actors         = GLOBAL.getString(aux.actors);
    _obj.language       = GLOBAL.getArray(aux, "language");
    _obj.country        = GLOBAL.getString(aux.country);
    _obj.awards         = GLOBAL.getString(aux.awards);
    _obj.year           = GLOBAL.getString(aux.year);
	_obj.isPublished    = GLOBAL.getBoolean(aux.isPublished);
    
    return _obj;
}

var saveByStep = function (callParams) {
    
    path = require('path');
    
    // GET OBJ
    if (callParams.step == 1) {
        
        callParams.step = 2;
        callParams.obj = null;
        
        // UPDATE
        if (GLOBAL.isObjectId(callParams.req.body._id)) {
            callParams.obj = getParamsMovie(callParams.req, null);
            findOneCB(callParams.req.body._id, saveByStep, callParams);
        }
        else {
            callParams.obj = new Movie();
            callParams.obj = getParamsMovie(callParams.req, callParams.obj);
            saveByStep(callParams);
        }

    }
    // CHECK THUMBNAIL
    else if (callParams.step == 2) {
        
        callParams.step = 3;
        
        var thumb_file = callParams.req.files.thumb_file;
        var thumbName = "";

        // THUMBNAIL EXIST
        if (thumb_file) {
            
            thumbName = GLOBAL.imageName(thumb_file);
            
            GLOBAL.saveFile(thumb_file, thumbName, GLOBAL.path.SERVER_MOVIE, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if(callParams.old_obj && GLOBAL.getString(callParams.old_obj.thumb) != '')
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_MOVIE + path.basename(callParams.old_obj.thumb));

                    callParams.obj.thumb = GLOBAL.path.WEB_MOVIE + thumbName;
                }
                saveByStep(callParams);

            });
           
        }
        // DOWNLOAD IMAGE FROM imdb server
        else if (callParams.obj.thumb != "" && callParams.obj.thumb.indexOf("ia.media-imdb") > -1) {
            
            thumbName = GLOBAL.imageName(callParams.obj.thumb);
            
            GLOBAL.download(callParams.obj.thumb, (GLOBAL.path.SERVER_MOVIE + thumbName), function (e) {
                
                // DELETE OLD FILE
                if(callParams.old_obj)
                    GLOBAL.deleteFile(GLOBAL.path.SERVER_MOVIE + path.basename(callParams.old_obj.thumb));

                callParams.obj.thumb = GLOBAL.path.WEB_MOVIE + thumbName;
                
                saveByStep(callParams);
            });
           
        }
        else {
            saveByStep(callParams);

        }

    }
     // CHECK COVER
    else if (callParams.step == 3) {
        
        callParams.step = 4;
        var cover_file = callParams.req.files.cover_file;
        
        // THUMBNAIL EXIST
        if (cover_file) {
            
            var thumbName = GLOBAL.imageName(cover_file);
            
            GLOBAL.saveFile(cover_file, thumbName, GLOBAL.path.SERVER_MOVIE_COVER, function (r, thumbName) {
                
                if (r) {
                    // DELETE OLD FILE
                    if (callParams.old_obj && GLOBAL.getString(callParams.old_obj.cover) != '')
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_MOVIE_COVER + path.basename(callParams.old_obj.cover));

                    callParams.obj.cover = GLOBAL.path.WEB_MOVIE_COVER + thumbName;
                }
                saveByStep(callParams);

            });
           
        }
        else {
            
            saveByStep(callParams);
        }

    }
    // VIDEO MOVIE
    else if (callParams.step == 4) {
        
        callParams.step = 5;
        
        var file = callParams.req.files.file;

        // FILE EXIST
        if (file) {
            
            var path = require('path');
            var ext = path.extname(file.name);
            var thumbName = String(callParams.obj.id) + ext;
            
            GLOBAL.saveFile(file, thumbName, GLOBAL.path.SERVER_MOVIE_TEMP_PATH, function (r, thumbName) {
                
                if (r) {
                    callParams.obj.url = GLOBAL.path.SERVER_MOVIE_TEMP_PATH + thumbName;
                }
                saveByStep(callParams);

            });
           
        }
        else{
            saveByStep(callParams);
        }
        
    }
    // SAVE / UPDATE
    else if (callParams.step == 5) {
        
        GLOBAL.db_open();
        
        // UPDATE
        if (GLOBAL.isObjectId(callParams.req.body._id)) {
            
            Movie.findByIdAndUpdate(callParams.req.body._id, callParams.obj, function (err) {
                
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
                    
                    // DELETE TEMPORARY FILES
                    GLOBAL.deleteFile(GLOBAL.path.SERVER_MOVIE + path.basename(callParams.obj.thumb));
                    GLOBAL.deleteFile(GLOBAL.path.SERVER_MOVIE_COVER + path.basename(callParams.obj.cover));
                    GLOBAL.deleteFile(GLOBAL.path.SERVER_MOVIE_TEMP_PATH  + path.basename(callParams.obj.url));
                        
                    // MAKE A LOG
                    GLOBAL.log(err, null);
                    
                    // DEFAULT ERROR RESPONSE
                    callParams.res.end(App_Message.ERROR_IN_PROCESS);
                } else {
                    callParams.res.end(App_Message.SUCESS_IN_PROCESS);
                }
                
            });
        }
    }
}

// ======================================= =======================================  
// FIND THE OBJ AND ADD callParams LIKE A OLD OBJECT
// ======================================= =======================================
var findOneCB = function (id, callback, callParams) {
    
    GLOBAL.db_open();
    Movie.findOne({ _id: id }, function (err, item) {
        
        GLOBAL.db_close();
        callParams.old_obj = item;
        
        callback(callParams);
    });
}