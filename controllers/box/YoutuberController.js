var pathFolders = "./../../";

require(pathFolders + 'models/Youtuber');
require(pathFolders + 'util/generic');

var returnUtil = require(pathFolders +'util/ReturnUtil');
var Youtuber = GLOBAL.mongoose.model('Youtuber');

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
    .select("youtuber")
    .where('status').equals(true)
    .exec(function (err, background) {
        
        GLOBAL.db_close();
        if (!err) {
            
            if(background){
                callback(background.youtuber);
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
// LIST ALL YOUTUBER ON THE DATABASE
// ======================================= ======================================= 
exports.listAll = function (req, res, params, customer) {
    
    try {
        
        listAllByStep(params, 1, function(json){
        
            getBackground(customer, function(background) {
                
                json.background = background;
                returnUtil.generateReturn(null, 100, JSON.stringify( json ), 14, null, req, res);
                
            });
        
        })
      
    } 
    catch (error) {
        returnUtil.generateReturn(null, 101, null, 999, null, req, res);
    }
};

var listAllByStep = function(params, step, callback){
    
    
    // =======================================================
    // GET YOUTUBER
    if(step == 1){
        
        GLOBAL.db_open();
    
        Youtuber.find(listAllFilter(params))
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
    // GET BIND YOUTUBER WITH THEM LIST AND VIDEOS
    else if(step == 2){
        bindYoutuberList(params.obj, -1, function(obj){
            
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

var bindYoutuberList = function(obj, index, callback){
    
    index = index + 1;
            
    if(index < obj.length){
        getArrayList(obj[index]._id, function(list){
            obj[index].list = GLOBAL.getJson( list );
            
            if(list){
                bindYoutuberVideoList(obj[index].list, 0 , function(list){
                    
                    obj[index].list = list;
                    bindYoutuberList(obj, index, callback);
                    
                });
            }
            else{
                bindYoutuberList(obj, index, callback);
            }
        });
    }
    else{
        callback(obj);
    }
}

var bindYoutuberVideoList = function(obj, index, callback){
    
    if(obj.length > index){
        getArrayVideo(obj[index]._id, function(videos){
            obj[index].video = videos;
            
            if(videos.length == 0){
                obj.splice(index,1);
            }
            else{
                index = index + 1;
            }
            bindYoutuberVideoList(obj, index, callback);
        });
    }
    else{
        callback(obj);
    }
}

var getArrayList = function (youtuber_id, callback) {
    GLOBAL.db_open();
    
    require('./../../models/Youtuber.list');
    var YoutuberList = GLOBAL.mongoose.model('YoutuberList');
    
    YoutuberList.find({youtuber_id: youtuber_id, status: true})
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

var getArrayVideo = function (youtuber_list_id, callback) {
    GLOBAL.db_open();
    
    require('./../../models/Youtuber.video');
    var YoutuberVideo = GLOBAL.mongoose.model('YoutuberVideo');
    
    YoutuberVideo.find({youtuber_list_id: youtuber_list_id, status:true})
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
// GET COUNTRIES WITH ACTIVE YOUTUBER
// ======================================= ======================================= 
exports.getActiveCategories = function (params) {
    
    var returnJson = {nexturl: null, submenu: []};
    GLOBAL.db_open();

    Youtuber.find({ video_counter: { $ne: 0 } })
        .where('status').equals(true)
        .distinct('category')
        .exec(
        function (err, youtuber) {
            GLOBAL.db_close();
            if (err) {
                returnUtil.generateReturn(null, 200, null, null, null, params.req, params.res);
            } 
            else {
                if (youtuber === null || youtuber.length === 0) {
                    returnUtil.generateReturn(null, 101, null, null, null, params.req, params.res);
                } 
                else {
                    
                    returnJson.nexturl = 'getyoutuberbycategory';
                    
                    for (var i = 0; i < youtuber.length; i++) {
                        returnJson.submenu.push(
                            {
                                code: youtuber[i], 
                                name: findCategory(youtuber[i], params.categories), 
                            });
                    }

                    returnUtil.generateReturn(null, 100, JSON.stringify(returnJson), 5, null, params.req, params.res);
                }
            }
        }
    );
};