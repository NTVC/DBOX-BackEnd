require('./../../models/Live');
require('./../../util/generic');

var pathFolders = "./../../";
var returnUtil = require('./../../util/ReturnUtil');
var Live = GLOBAL.mongoose.model('Live');

// BUILD FILTER LIST ALL
var listAllFilter = function (params) {

    var filter = 
    ({
        $and : [
            (GLOBAL.isObjectId(params.filter.search) ? { "_id" : params.filter.search } : { "name" : new RegExp(params.filter.search, 'i') }),
            (params.filter.code == '' ? {} : ({ "country" : new RegExp(params.filter.code, 'i') })),
            {"active" : true},
        ]
    });
    return filter;
};

// ======================================= =======================================  
// GET BACKGROUND
// ======================================= ======================================= 
var getBackground = function (params, callback) {
    
    require(pathFolders + 'models/HomeBackground');
    var HomeBackground = GLOBAL.mongoose.model('HomeBackground');

    GLOBAL.db_open();
    
    // FIRST CHECK THE NUMBER OF DATA
    HomeBackground.findOne({country: GLOBAL.getString(params.filter.code)})
    .select("live")
    .where('status').equals(true)
    .exec(function (err, background) {
        
        GLOBAL.db_close();
        if (!err) {
            if(background){
                callback(background.live);
            }else{
                callback(null);
            }
        }
        else {
            callback(null);
        }
    });
};

// ======================================= =======================================  
// LIST ALL LIVES ON THE DATABASE
// ======================================= ======================================= 

exports.listAll = function (req, res, params, customer) {
  
    try {
        // GET LIVE
        listAll(params, function(json){
        
            getBackground(params, function(background) {
                
                json.background = background;
                returnUtil.generateReturn(null, 100, JSON.stringify( json ), 1, null, req, res);
            });
        
        })
      
    } catch (error) {
        returnUtil.generateReturn(null, 101, null, 999, null, req, res);
    }
    
};

var listAll = function(params, callback){
    
    GLOBAL.db_open();
    
    Live.find(
        (
          listAllFilter(params))
        )
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .exec(
        function (err, lives) {
            GLOBAL.db_close();
            if (!err) {
                
                var json = {};
                json.title = params.filter.name;
                json.lives = lives;
                
                callback(json);
            }
            else {
                callback(null);
            }
        }
    );
};


// ======================================= =======================================  
// GET LIST OF COUNTRIES WITH LIVE ACTIVE
// ======================================= ======================================= 
exports.getActiveCountries = function (params) {
    
    var returnJson = {nexturl: null, submenu: []};

    GLOBAL.db_open();
    Live.find()
        .where('active').equals(true)
        .distinct('country')
        .exec(
        function (err, live) {
            if (err) {
                returnUtil.generateReturn(null, 200, null, null, null, params.req, params.res);
            } 
            else {
                if (live === null || live.length === 0) {
                    returnUtil.generateReturn(null, 101, null, null, null, params.req, params.res);
                } 
                else {
                    returnJson.nexturl = 'getlivecountrychannels';
                    
                    for (var i = 0; i < live.length; i++) {
                        returnJson.submenu.push(
                        {
                            code: live[i], 
                            name: findCountry(live[i], params.countries)
                        });
                    }

                    returnUtil.generateReturn(null, 100, JSON.stringify(returnJson), 5, null, params.req, params.res);
                }
            }
        }
    );
};

