var pathFolders = "./../../";

require(pathFolders + 'models/TvSeries');
require(pathFolders + 'util/generic');

var returnUtil = require(pathFolders +'util/ReturnUtil');
var TvSeries = GLOBAL.mongoose.model('TvSeries');

// ======================================= =======================================  
// BUILD FILTER LIST ALL
// ======================================= ======================================= 
var listAllFilter = function (params) {
    
    var filter = 
    ({
        $and: [
            (GLOBAL.isObjectId(params.filter.search) ? { "_id" : params.filter.search } : { "title" : new RegExp(params.filter.search, 'i') }),
            { "status" : true },
            (GLOBAL.getString(params.filter.code) == '' ? {} : ({ "category" : params.filter.code })),
            { video_counter: { $ne: 0 } }
        ]
    });
    return filter;
};

// ======================================= =======================================  
// GET BACKGROUND
// ======================================= ======================================= 
var getBackground = function (customer, callback) {
    
    require(pathFolders + 'models/HomeBackground');
    var HomeBackground = GLOBAL.mongoose.model('HomeBackground');

    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeBackground.findOne(GLOBAL.getCountryFilter(customer))
    .select("tvseries")
    .where('status').equals(true)
    .exec(function (err, background) {
        
        GLOBAL.db_close();
        if (!err) {
            
            if(background){
                callback(background.tvseries);
            }
            else{
                callback(null);
            }
             
        }
        else {
            callback(null);
        }
    });
};

// ======================================= =======================================  
// LIST ALL TV SERIES ON THE DATABASE
// ======================================= ======================================= 
exports.listAll = function (req, res, params, customer) {
    
    try {
        
        listAllByStep(params, 1, function(json){
        
            getBackground(customer, function(background) {
                
                json.background = background;
                returnUtil.generateReturn(null, 100, JSON.stringify( json ), 4, null, req, res);
                
            });
        
        })
      
    } 
    catch (error) {
        returnUtil.generateReturn(null, 101, null, 999, null, req, res);
    }
};

var listAllByStep = function(params, step, callback){
    
    
    // =======================================================
    // GET TV SERIES
    if(step == 1){
        
        GLOBAL.db_open();
    
        TvSeries.find(listAllFilter(params))
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .exec(
            function (err, communities) {
              
                GLOBAL.db_close();
                
                params.obj = GLOBAL.getJson(communities);
                
                listAllByStep(params, 2, callback);
            }
        ); 
        
    }
    // =======================================================
    // GET BIND TV SERIES WITH THEM LIST AND VIDEOS
    else if(step == 2){
        bindTvSeriesList(params.obj, -1, function(obj){
            
            params.obj = obj;
            listAllByStep(params, 3, callback);
        });
    }
    // =======================================================
    // RETURN TO THE MAIN FUNCTION
    else
    {         
        var json = {};
        json.title = params.filter.name;
        json.data = params.obj;
        
        callback(json);
    }
};

var bindTvSeriesList = function(obj, index, callback){
    
    index = index + 1;
            
    if(index < obj.length){
        getArrayList(obj[index]._id, function(list){
            obj[index].list = GLOBAL.getJson( list );
            
            if(list){
                bindTvSeriesVideoList(obj[index].list, 0 , function(list){
                    
                    obj[index].list = list;
                    bindTvSeriesList(obj, index, callback);
                    
                });
            }
            else{
                bindTvSeriesList(obj, index, callback);
            }
        });
    }
    else{
        callback(obj);
    }
}

var bindTvSeriesVideoList = function(obj, index, callback){
    
    if(obj.length > index){
        getArrayVideo(obj[index]._id, function(videos){
            obj[index].video = videos;
            
            if(videos.length == 0){
                obj.splice(index,1);
            }
            else{
                index = index + 1;
            }
            
            bindTvSeriesVideoList(obj, index, callback);
        });
    }
    else{
        callback(obj);
    }
}

var getArrayList = function (tvseries_id, callback) {
    GLOBAL.db_open();
    
    require('./../../models/TvSeries.list');
    var TvSeriesList = GLOBAL.mongoose.model('TvSeriesList');
    
    TvSeriesList.find({tvserie_id: tvseries_id, status: true})
    .sort({registration: -1})
    .select("title description thumb")
    .exec(
    function (err, arrayList) {
        GLOBAL.db_close();

        if (err) {
           callback(null);
        }
        else {
           callback(arrayList);
        }
    });
};

var getArrayVideo = function (tvseries_list_id, callback) {
    GLOBAL.db_open();
    
    require('./../../models/TvSeries.video');
    var TvSeriesVideo = GLOBAL.mongoose.model('TvSeriesVideo');
    
    TvSeriesVideo.find({tvserie_list_id: tvseries_list_id, status:true, "isPublished": true})
    .sort({registration: -1})
    .select("title description url")
    .exec(
    function (err, arrayVideo) {
        GLOBAL.db_close();

        if (err) {
           callback(null);
        }
        else {
           callback(arrayVideo);
        }
    });
};

// ======================================= =======================================  
// GET COUNTRIES WITH ACTIVE TV SERIES
// ======================================= ======================================= 
exports.getActiveCategories = function (params) {
    
    var returnJson = {nexturl: null, submenu: []};
    GLOBAL.db_open();

    TvSeries.find({ video_counter: { $ne: 0 } })
        .where('status').equals(true)
        .distinct('category')
        .exec(
        function (err, tvseries) {
            GLOBAL.db_close();
            if (err) {
                returnUtil.generateReturn(null, 200, null, null, null, params.req, params.res);
            } 
            else {
                if (tvseries === null || tvseries.length === 0) {
                    returnUtil.generateReturn(null, 101, null, null, null, params.req, params.res);
                } 
                else {
                    
                    returnJson.nexturl = 'gettvseriesbycategory';
                    
                    for (var i = 0; i < tvseries.length; i++) {
                        returnJson.submenu.push(
                            {
                                code: tvseries[i], 
                                name: findCategory(tvseries[i], params.categories), 
                            });
                    }

                    returnUtil.generateReturn(null, 100, JSON.stringify(returnJson), 5, null, params.req, params.res);
                }
            }
        }
    );
};