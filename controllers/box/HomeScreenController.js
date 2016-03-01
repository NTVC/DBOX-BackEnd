var pathFolders = "./../../";
require(pathFolders + 'util/generic');

var returnUtil = require(pathFolders + 'util/ReturnUtil');
var filter;
var select;

// ======================================= =======================================  
// GET BACKGROUND
// ======================================= ======================================= 
exports.getBackground = function (req, res, customer, callback) {
    
    require(pathFolders + 'models/HomeBackground');
    var HomeBackground = GLOBAL.mongoose.model('HomeBackground');

    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeBackground.findOne(GLOBAL.getCountryFilter(customer))
    .select("home")
    .where('status').equals(true)
    .exec(function (err, background) {
        
        GLOBAL.db_close();
        if (!err) {
            
            if(background){
                callback(background.home);
            }
            else{
                callback(null);
            }
        }
        else {
            returnUtil.generateReturn(null, 101, null, 999, null, req, res);
        }
    });
};

// ======================================= =======================================  
// GET MENU
// ======================================= ======================================= 
exports.getMenu = function (req, res, customer, callback) {
    
    require(pathFolders + 'models/HomeMenu');
    var HomeMenu = GLOBAL.mongoose.model('HomeMenu');

    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeMenu.find(GLOBAL.getCountryFilter(customer))
    .where('status').equals(true)
    .count(function (err, total) {
        
        // GET DATA
        HomeMenu.find(GLOBAL.getCountryFilter(customer, total))
        .select("title nexturl submenu")
        .where('status').equals(true)
        .sort({ order: 1 })
        .limit(GLOBAL.HOMESCREEN_LIMIT.MENU)
        .exec(
            function (err, menu) {
                GLOBAL.db_close();
                if (!err) {
                    callback(menu);
                }
                else {
                    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
                }
            }
        );

    });
};
// ======================================= =======================================  
// GET SUPPORT
// ======================================= ======================================= 
exports.getSupport = function (req, res, customer, callback) {
    
    require(pathFolders + 'models/HomeSupport');
    var HomeSupport = GLOBAL.mongoose.model('HomeSupport');

    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeSupport.find(GLOBAL.getCountryFilter(customer))
    .where('status').equals(true)
    .count(function (err, total) {
        
        // GET DATA
        HomeSupport.findOne(GLOBAL.getCountryFilter(customer, total))
        .select("title message email phone")
        .where('status').equals(true)
        .limit(GLOBAL.HOMESCREEN_LIMIT.APPS.MAX_VIEW)
        .exec(
            function (err, support) {
                GLOBAL.db_close();
                if (!err) {
                    callback(support);
                }
                else {
                    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
                }
            }
        );

    });
};
// ======================================= =======================================  
// GET ALL APPS
// ======================================= ======================================= 
exports.getHomeApps = function (req, res, customer, callback) {
    
    require(pathFolders + 'models/HomeApps');
    var HomeApps = GLOBAL.mongoose.model('HomeApps');

    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeApps.find(GLOBAL.getCountryFilter(customer))
    .where('status').equals(true)
    .count(function (err, total) {
        
        // GET DATA
        HomeApps.find(GLOBAL.getCountryFilter(customer, total))
        .select("name thumb key intent")
        .sort({ order: 1 })
        .where('status').equals(true)
        .limit(GLOBAL.HOMESCREEN_LIMIT.APPS.MAX_VIEW)
        .exec(
            function (err, apps) {
                GLOBAL.db_close();
                if (!err) {
                    callback(apps);
                }
                else {
                    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
                }
            }
        );

    });
};

exports.getAllApps = function (req, res, customer, params) {
    
    require(pathFolders + 'models/HomeApps');
    var HomeApps = GLOBAL.mongoose.model('HomeApps');

    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeApps.find(GLOBAL.getCountryFilter(customer))
    .where('status').equals(true)
    .count(function (err, total) {
        
        // GET DATA
        HomeApps.find(GLOBAL.getCountryFilter(customer, total))
        .select("name thumb key intent")
        .sort({ order: 1 })
        .where('status').equals(true)
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .exec(
            function (err, apps) {
                GLOBAL.db_close();
                if (!err) {
                     returnUtil.generateReturn(null, 100, JSON.stringify(apps), 6, null, req, res);
                }
                else {
                    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
                }
            }
        );

    });
};
// ======================================= =======================================  
// GET ALL HIGHLIGHTS
// ======================================= ======================================= 

var notIn = [];
exports.getAllHighlights = function (req, res, customer, callback) {
    
    require(pathFolders + 'models/HomeHighlights');
    var HomeHighlights = GLOBAL.mongoose.model('HomeHighlights');

    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeHighlights.find(GLOBAL.getCountryFilter(customer))
    .where('status').equals(true)
    .count(function (err, total) {
        
        filter = GLOBAL.getCountryFilter(customer, total);
        // GET HIGHLIGHTS
        HomeHighlights.find(
            {
                $and: [
                    { "list" : { $ne: 0 }},
                    filter
                ]
            }
        )
        .select("title source list")
        .sort({ order: 1 })
        .where('status').equals(true)
        .limit(GLOBAL.HOMESCREEN_LIMIT.HIGHTLIGHTS.MAX_ITEMS)
        .exec(
            function (err, highlights) {
                GLOBAL.db_close();
                if (!err) {
                    
                    var array = GLOBAL.getJson(highlights);
                    var callParams = { req: req, res: res, highlights: array, step: 1, index: 0, maincallback: callback };
                    setHighlighJSON(callParams);

                }
                else {
                    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
                }
            }
        );
        // END HIGHTLIGHTS

    });
};

var setHighlighJSON = function (callParams) {

    if (callParams.step == 1) {
        
        if (callParams.index < callParams.highlights.length) {

            for (var i = callParams.index; i < callParams.highlights.length; i++) {
                
                notIn = []; // RESET VARIABLE
                callParams.index_high = i;
                callParams.index_list = -1;
                
                process.nextTick(function() { 
                    getHighlighList(callParams);
                });
                break;
            }
        }
        else {
            callParams.maincallback(callParams.highlights);
        }
    }
}

var getHighlighList = function (callParams){
    
    // GO BACK TO THE PREVIOUS CALL
    if(callParams.break)
    {
        callParams.break = false;
        process.nextTick(function() { 
            getHighlighListDone(callParams);
        });
        return null;
    }
    
    var tb;
    var tbName;
    var obj = callParams.highlights[callParams.index_high];
    
    // DEFAULT SELECT
    select = "_id title cover thumb";
    
    callParams.index_list += 1;

    // LIVE
    if (obj.source == 1) {
        callParams.highlights[callParams.index_high]["nexturl"] = GLOBAL.NEXT_URL.LIVE_COUNTRY_CHANNELS;

        tbName = "Live";
        select = "_id name cover thumb url";
    }
    // Movie
    else if (obj.source == 2) {
        callParams.highlights[callParams.index_high]["nexturl"] = GLOBAL.NEXT_URL.MOVIE_BY_CATEGORY;

        tbName = "Movie";
        select = "_id title cover thumb url";
        filter = {};
    }
    // TV Series
    else if (obj.source == 3) {
        callParams.highlights[callParams.index_high]["nexturl"] = GLOBAL.NEXT_URL.TV_SERIES_CATEGORIES;

        tbName = "TvSeries";
        filter = { video_counter: { $ne: 0 } };
    }
    // Community
    else if (obj.source == 4) {
        callParams.highlights[callParams.index_high]["nexturl"] = GLOBAL.NEXT_URL.COMMUNITY_BY_CHANNEL;

        tbName = "Community";
        filter = { video_counter: { $ne: 0 } };
    }
    // Youtuber
    else if (obj.source == 5) {
        callParams.highlights[callParams.index_high].nexturl = GLOBAL.NEXT_URL.YOUTUBER_BY_CATEGORY;

        tbName = "Youtuber";
        filter = { video_counter: { $ne: 0 } };
    }
    
    if (tbName && callParams.index_list < obj.list.length) {
        require(pathFolders + 'models/' + tbName);
        tb = GLOBAL.mongoose.model(tbName);
        
        callParams.tb = tb;
        callParams.callback_2 = getHighlighList;

        findOneHighLightContent(obj.list[callParams.index_list].id, callParams);
    }
    else {
        getHighlighListDone(callParams);
    }
}

var getHighlighListDone = function(callParams){
    
    callParams.index += 1;
    setHighlighJSON(callParams);
};

// FIND THE OBJ AND ADD callParams LIKE A OLD OBJECT
var findOneHighLightContent = function (id, callParams) {
    
    GLOBAL.db_open();
    
    // GET ESPECIFIC OBJECT
    if (id) {
        callParams.tb.findOne({ _id: id })
        .select(select)
        .limit(1)
        .exec(function (err, item) {
            GLOBAL.db_close();
            
            if(item){
                notIn.push(item._id);
                callParams.highlights[callParams.index_high].list[callParams.index_list] = item;
            }
            
            callParams.callback_2(callParams);
        });
    }
    else {
        // GET RANDOM OBJECT
        
        callParams.tb.find(filter, { "_id": { $nin: notIn } }, { "cover" : { $exists: true } })
        .where("_id").nin(notIn)
        .count(function (err, total) {
            
            GLOBAL.db_close();
            if(total > 0){
                
                GLOBAL.db_open();
                callParams.tb.findOne(filter, { "_id": { $nin: notIn } }, { "cover" : { $exists: true } })
                .select(select)
                .where("_id").nin(notIn)
                .limit(1).skip(Math.floor(Math.random()* total) )
                .exec(function (err, item) {
                    GLOBAL.db_close();
                    
                    if(item){
                        notIn.push(item._id);
                        callParams.highlights[callParams.index_high].list[callParams.index_list] = item;
                    }
                    callParams.callback_2(callParams);
                });

            }
            else{
                // DELETE OBJECT WITHOUT CONTEXT
                var length = callParams.highlights[callParams.index_high].list.length;
                
                for(var i = length; i >= callParams.index_high; i--){
                    
                    try{
                        callParams.highlights[callParams.index_high].list.splice(i, 1);
                    }
                    catch(e){}
                }
                
                callParams.break = true;
                callParams.callback_2(callParams);
            }
        });

      
    }
}

// ======================================= =======================================  
// GET ALL BANNERS
// ======================================= ======================================= 
exports.getAllBanners = function (req, res, customer, callback) {
    
    require(pathFolders + 'models/HomeBanners');
    var HomeBanners = GLOBAL.mongoose.model('HomeBanners');
    
    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeBanners.find(GLOBAL.getCountryFilter(customer))
    .where('status').equals(true)
    .count(function (err, total) {
        
        // GET BANNERS
        HomeBanners.find(GLOBAL.getCountryFilter(customer, total))
        .sort({ order: 1 })
        .select("timer")
        .where('status').equals(true)
        .limit(GLOBAL.HOMESCREEN_LIMIT.BANNERS.MAX_ITEMS)
        .exec(
            function (err, banners) {
                GLOBAL.db_close();
                if (!err) {
                    var obj = {banners: GLOBAL.getJson(banners), index: 0, res: res, req: req, callback: callback }
                    getBannersContent(obj);
                }
                else {
                    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
                }
            }
        );

    });
};

var getBannersContent = function(obj){
    
    if(obj.index < obj.banners.length){
        
        require(pathFolders + 'models/HomeBanners.content');
        var HomeBannersContent = GLOBAL.mongoose.model('HomeBannersContent');

        HomeBannersContent.find({homebanners_id: obj.banners[obj.index]._id})
        .sort({ order: 1 })
        .select("invoke parameter banner")
        .where('status').equals(true)
        .limit(GLOBAL.HOMESCREEN_LIMIT.BANNERS.MAX_ITEMS)
        .exec(
            function (err, contents) {
                GLOBAL.db_close();
                if (!err) {
                    
                    if(contents){
                        obj.banners[obj.index].list = contents;
                    }
                    
                    obj.index = obj.index + 1;
                    
                    getBannersContent(obj);
                }
                else {
                    returnUtil.generateReturn(null, 101, null, 999, null, obj.req, obj.res);
                }
            }
        );
        
    } else{
        obj.callback(obj.banners);
    }        
}

// ======================================= =======================================  
// GET ALL SPONSORS
// ======================================= ======================================= 
exports.getAllSponsors = function (req, res, customer, callback) {
    
    require(pathFolders + 'models/HomeSponsors');
    var HomeSponsors = GLOBAL.mongoose.model('HomeSponsors');
    
    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeSponsors.find(GLOBAL.getCountryFilter(customer))
    .where('status').equals(true)
    .count(function (err, total) {
        
        // GET SPONSORS
        HomeSponsors.find(GLOBAL.getCountryFilter(customer, total))
        .sort({ order: 1 })
        .select("name poster url")
        .where('status').equals(true)
        .limit(GLOBAL.HOMESCREEN_LIMIT.SPONSORS)
        .exec(
            function (err, sponsors) {
                GLOBAL.db_close();
                if (!err) {
                    callback(sponsors);
                }
                else {
                    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
                }
            }
        );

    });
};

// ======================================= =======================================  
// GET ALL WIDGETS
// ======================================= ======================================= 
exports.getAllWidgets = function (req, res, customer, callback) {
    
    require(pathFolders + 'models/HomeWidgets');
    var HomeWidgets = GLOBAL.mongoose.model('HomeWidgets');
    
    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeWidgets.find(GLOBAL.getCountryFilter(customer))
    .where('status').equals(true)
    .count(function (err, total) {
        
        // GET WIDGETS
        HomeWidgets.find(GLOBAL.getCountryFilter(customer, total))
        .sort({ order: 1 })
        .select("name html")
        .where('status').equals(true)
        .limit(GLOBAL.HOMESCREEN_LIMIT.WIDGETS)
        .skip(Math.floor(Math.random() * total))
        .exec(
            function (err, widgets) {
                GLOBAL.db_close();
                if (!err) {
                    var json = {address: null, widgets: null, language: null};
                    
                    json.widgets = widgets;
                    
                    try {
                        json.language = customer.language[0];
                        json.address = customer.address;
                    } catch (error) {
                        json.address = null;
                    }
                    
                    callback(json);
                }
                else {
                    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
                }
            }
        );

    });
};
