var pathFolders = "./../../";

require(pathFolders + 'models/Community');
require(pathFolders + 'util/generic');

var returnUtil = require(pathFolders +'util/ReturnUtil');
var Community = GLOBAL.mongoose.model('Community');

// ======================================= =======================================  
// BUILD FILTER LIST ALL
// ======================================= ======================================= 
var listAllFilter = function (params) {
    
    var filter = 
    ({
        $and: [
            (GLOBAL.isObjectId(params.filter.search) ? { "_id" : params.filter.search } : { "title" : new RegExp(params.filter.search, 'i') }),
            { "status" : true },
            (GLOBAL.getString(params.filter.code) == '' ? {} : ({ "country" : params.filter.code})),
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
    .select("community")
    .where('status').equals(true)
    .exec(function (err, background) {
        
        GLOBAL.db_close();
        
        if (!err) {
            
            if(background){
                callback(background.community);
            }
            else{
                callback(null);
            }
             
        }
        else {
            GLOBAL.log(err, null);
            callback(null);
        }
    });
};

// ======================================= =======================================  
// LIST ALL COMMUNITIES ON THE DATABASE
// ======================================= ======================================= 
exports.listAll = function (req, res, params, customer) {
    
    try {
        
        listAllByStep(params, 1, function(json){
        
            getBackground(customer, function(background) {
                
                json.background = background;
                returnUtil.generateReturn(null, 100, JSON.stringify( json ), 3, null, req, res);
                
            });
        
        })
      
    } 
    catch (error) {
        returnUtil.generateReturn(null, 101, null, 999, null, req, res);
    }
};

var listAllByStep = function(params, step, callback){
    
    
    // =======================================================
    // GET COMMUNITIES
    if(step == 1){
        
        GLOBAL.db_open();
    
        Community.find(listAllFilter(params))
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
    // GET BIND COMMUNITIES WITH THEM LIST AND VIDEOS
    else if(step == 2){
        bindCommunityList(params.obj, -1, function(obj){
            
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

var bindCommunityList = function(obj, index, callback){
    
    index = index + 1;
            
    if(index < obj.length){
        getArrayList(obj[index]._id, function(list){
            obj[index].list = GLOBAL.getJson( list );
            
            if(list){
                bindCommunityVideoList(obj[index].list, 0 , function(list){
                    
                    obj[index].list = list;
                    bindCommunityList(obj, index, callback);
                    
                });
            }
            else{
                bindCommunityList(obj, index, callback);
            }
        });
    }
    else{
        callback(obj);
    }
}

var bindCommunityVideoList = function(obj, index, callback){
    
    if(obj.length > index){
        getArrayVideo(obj[index]._id, function(videos){
            obj[index].video = videos;
            
            if(videos.length == 0){
                obj.splice(index,1);
            }
            else{
                index = index + 1;
            }
            
            bindCommunityVideoList(obj, index, callback);
        });
    }
    else{
        callback(obj);
    }
}

var getArrayList = function (community_id, callback) {
    GLOBAL.db_open();
    
    require('./../../models/Community.list');
    var CommunityList = GLOBAL.mongoose.model('CommunityList');
    
    CommunityList.find({community_id: community_id, status: true})
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

var getArrayVideo = function (community_list_id, callback) {
    GLOBAL.db_open();
    
    require('./../../models/Community.video');
    var CommunityVideo = GLOBAL.mongoose.model('CommunityVideo');
    
    CommunityVideo.find({community_list_id: community_list_id, status:true})
    .sort({registration: -1})
    .select("title description url")
    .exec(
    function (err, arrayVideo) {
        GLOBAL.db_close();

        if (err) {
            GLOBAL.log(err, null);
            callback(null);
        }
        else {
            callback(arrayVideo);
        }
    });
};

// ======================================= =======================================  
// GET COUNTRIES WITH ACTIVE COMMUNITIES
// ======================================= ======================================= 
exports.getActiveCountries = function (params) {
    
    var returnJson = {nexturl: null, submenu: []};
    GLOBAL.db_open();

    Community.find({ video_counter: { $ne: 0 } } )
    .where('status').equals(true)
    .distinct('country')
    .exec(
        function (err, community_country) {
            
            GLOBAL.db_close();
            if (err) {
                GLOBAL.log(err, null);
                returnUtil.generateReturn(null, 200, null, null, null, params.req, params.res);
            } 
            else {
                
                if (community_country === null || community_country.length === 0) {
                    returnUtil.generateReturn(null, 101, null, null, null, params.req, params.res);
                } 
                else {
                    
                    returnJson.nexturl = 'getcommunitycountrychannels';
                    
                    // SET TITLE AND CODE OF COUNTRY AND INCLUDE AT THE JSON
                    for (var i = 0; i < community_country.length; i++) {
                        returnJson.submenu.push(
                        {
                            code: community_country[i], 
                            name: findCountry(community_country[i], params.countries)
                        });
                    }
                    
                    returnUtil.generateReturn(null, 100, JSON.stringify(returnJson), 5, null, params.req, params.res);
                }
            }
        }
    );
};