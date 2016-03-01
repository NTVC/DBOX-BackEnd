module.exports = require('./env/' + process.env.NODE_ENV + '.js');


var os = require('os');

var master_web_path = "images/dbox/";
var suffix_tree = (os.platform() == "linux" || os.platform() == "darwin") ? "/" : "\\";
var images_path = (__dirname + suffix_tree + ".." + suffix_tree + "public" + suffix_tree + "images" + suffix_tree + "dbox" + suffix_tree);
var videos_path = (__dirname + suffix_tree + ".." + suffix_tree + "public" + suffix_tree);

require('./../util/generic');

// ======================================= =======================================  
// RETURN TO USER INTERFACE
// ======================================= ======================================= 

GLOBAL.App_Message = {
    ERROR_IN_PROCESS: "ERROR_IN_PROCESS",
    SUCESS_IN_PROCESS: "SUCESS_IN_PROCESS",
    SESSION_EXPIRED: "SESSION_EXPIRED",
    DUPLICATE: "DUPLICATE"
}


// ======================================= =======================================  
// DEFAULT COUNTRY IF SOME MODELS ARE MISSING IT
// ======================================= ======================================= 

GLOBAL.defaultCountry = "CA";

// ======================================= =======================================  
// ALL PATHS
// ======================================= ======================================= 

GLOBAL.path = {
    // =======================================
    // HOME APP PATHS
    // =======================================
    WEB_HOME_APP_VERSION: (master_web_path + "homeapp/"),
    SERVER_HOME_APP_VERSION: (images_path + "homeapp" + suffix_tree),
    
    // =======================================
    // HOME BANNERS PATHS
    // =======================================
    WEB_HOME_BANNER: (master_web_path + "homebanner/"),
    SERVER_HOME_BANNER: (images_path + "homebanner" + suffix_tree),

    // =======================================
    // HOME SPONSORS PATHS
    // =======================================
    WEB_HOME_SPONSOR_VERSION: (master_web_path + "homesponsor/"),
    SERVER_HOME_SPONSOR_VERSION: (images_path + "homesponsor" + suffix_tree),

    // =======================================
    // DEVICE VERSION PATHS
    // =======================================
    WEB_DEVICE_VERSION: (master_web_path + "deviceversion/"),
    SERVER_DEVICE_VERSION: (images_path + "deviceversion" + suffix_tree),

    // =======================================
    // ON LIVE PATHS
    // =======================================
    WEB_LIVE: (master_web_path + "live/"),
    SERVER_LIVE: (images_path + "live" + suffix_tree),

    WEB_LIVE_COVER: (master_web_path + "live/cover/"),
    SERVER_LIVE_COVER: (images_path + "live" + suffix_tree + "cover" + suffix_tree),

    WEB_LIVE_BACKGROUND: (master_web_path + "live/background/"),
    SERVER_LIVE_BACKGROUND: (images_path + "live" + suffix_tree + "background" + suffix_tree),

    // =======================================
    // ON MOVIE PATHS
    // =======================================
    WEB_MOVIE: (master_web_path + "movie/"),
    SERVER_MOVIE: (images_path + "movie" + suffix_tree),
    
    WEB_MOVIE_COVER: (master_web_path + "movie/cover/"),
    SERVER_MOVIE_COVER: (images_path + "movie" + suffix_tree + "cover" + suffix_tree),

    // =======================================
    // ON TVSERIES PATHS
    // =======================================
    WEB_TVSERIES: (master_web_path + "tvseries/"),
    SERVER_TVSERIES: (images_path + "tvseries" + suffix_tree),

    WEB_TVSERIES_LIST: (master_web_path + "tvseries/list/"),
    SERVER_TVSERIES_LIST: (images_path + "tvseries" + suffix_tree + "list" + suffix_tree),
    
    WEB_TVSERIES_COVER: (master_web_path + "tvseries/cover/"),
    SERVER_TVSERIES_COVER: (images_path + "tvseries" + suffix_tree + "cover" + suffix_tree),

    WEB_TVSERIES_BACKGROUND: (master_web_path + "tvseries/background/"),
    SERVER_TVSERIES_BACKGROUND: (images_path + "tvseries" + suffix_tree + "background" + suffix_tree),
    
    // =======================================
    // ON COMMUNITY PATHS
    // =======================================
    WEB_COMMUNITY: (master_web_path + "community/"),
    SERVER_COMMUNITY: (images_path + "community" + suffix_tree),
    
    WEB_COMMUNITY_LIST: (master_web_path + "community/list/"),
    SERVER_COMMUNITY_LIST: (images_path + "community" + suffix_tree + "list" + suffix_tree),
    
    WEB_COMMUNITY_COVER: (master_web_path + "community/cover/"),
    SERVER_COMMUNITY_COVER: (images_path + "community" + suffix_tree + "cover" + suffix_tree),
    
    WEB_COMMUNITY_BACKGROUND: (master_web_path + "community/background/"),
    SERVER_COMMUNITY_BACKGROUND: (images_path + "community" + suffix_tree + "background" + suffix_tree),
    
    // =======================================
    // ON YOUTUBER PATHS
    // =======================================
    WEB_YOUTUBER: (master_web_path + "youtuber/"),
    SERVER_YOUTUBER: (images_path + "youtuber" + suffix_tree),
    
    WEB_YOUTUBER_LIST: (master_web_path + "youtuber/list/"),
    SERVER_YOUTUBER_LIST: (images_path + "youtuber" + suffix_tree + "list" + suffix_tree),
    
    WEB_YOUTUBER_COVER: (master_web_path + "youtuber/cover/"),
    SERVER_YOUTUBER_COVER: (images_path + "youtuber" + suffix_tree + "cover" + suffix_tree),
    
    WEB_YOUTUBER_BACKGROUND: (master_web_path + "youtuber/background/"),
    SERVER_YOUTUBER_BACKGROUND: (images_path + "youtuber" + suffix_tree + "background" + suffix_tree),

    // =======================================
    // ON HOME BACKGROUND PATHS
    // =======================================
    WEB_BACKGROUND_HOME: (master_web_path + "background/home/"),
    SERVER_BACKGROUND_HOME: (images_path + "background" + suffix_tree + "home" + suffix_tree),
    
    WEB_BACKGROUND_LIVE: (master_web_path + "background/live/"),
    SERVER_BACKGROUND_LIVE: (images_path + "background" + suffix_tree + "live" + suffix_tree),
    
    WEB_BACKGROUND_COMMUNITY: (master_web_path + "background/community/"),
    SERVER_BACKGROUND_COMMUNITY: (images_path + "background" + suffix_tree + "community" + suffix_tree),
    
    WEB_BACKGROUND_TVSERIES: (master_web_path + "background/tvseries/"),
    SERVER_BACKGROUND_TVSERIES: (images_path + "background" + suffix_tree + "tvseries" + suffix_tree),
    
    WEB_BACKGROUND_YOUTUBER: (master_web_path + "background/youtuber/"),
    SERVER_BACKGROUND_YOUTUBER: (images_path + "background" + suffix_tree + "youtuber" + suffix_tree),
    
    // =======================================
    // TEMPORARY PATH DIRECTORY FOR VIDEOS
    // =======================================
    
    SERVER_MOVIE_TEMP_PATH: (videos_path + "temp" + suffix_tree + "movie" + suffix_tree),
    SERVER_COMMUNITY_TEMP_PATH: (videos_path + "temp" + suffix_tree + "community" + suffix_tree),
    SERVER_TV_SERIES_TEMP_PATH: (videos_path + "temp" + suffix_tree + "tvserie" + suffix_tree),
    SERVER_YOUTUBERS_PATH: (videos_path + "temp" + suffix_tree + "youtuber" + suffix_tree),
    
    // =======================================
    // APPLICATION LOGS
    // =======================================
    LOG_PATH: (__dirname + suffix_tree + ".." + suffix_tree + "public" + suffix_tree + "log" + suffix_tree),
}


// ################################################################
// CREATE ALL PATHS 


GLOBAL.createPath(path.SERVER_HOME_APP_VERSION);
GLOBAL.createPath(path.SERVER_HOME_BANNER);
GLOBAL.createPath(path.SERVER_HOME_SPONSOR_VERSION);

GLOBAL.createPath(path.SERVER_LIVE);
GLOBAL.createPath(path.SERVER_LIVE_COVER);
GLOBAL.createPath(path.SERVER_LIVE_BACKGROUND);

GLOBAL.createPath(path.SERVER_MOVIE);
GLOBAL.createPath(path.SERVER_MOVIE_COVER);

GLOBAL.createPath(path.SERVER_TVSERIES);
GLOBAL.createPath(path.SERVER_TVSERIES_COVER);
GLOBAL.createPath(path.SERVER_TVSERIES_BACKGROUND);
GLOBAL.createPath(path.SERVER_TVSERIES_LIST);

GLOBAL.createPath(path.SERVER_COMMUNITY);
GLOBAL.createPath(path.SERVER_COMMUNITY_LIST);
GLOBAL.createPath(path.SERVER_COMMUNITY_COVER);
GLOBAL.createPath(path.SERVER_COMMUNITY_BACKGROUND);

GLOBAL.createPath(path.SERVER_YOUTUBER);
GLOBAL.createPath(path.SERVER_YOUTUBER_LIST);
GLOBAL.createPath(path.SERVER_YOUTUBER_COVER);
GLOBAL.createPath(path.SERVER_YOUTUBER_BACKGROUND);

GLOBAL.createPath(path.SERVER_DEVICE_VERSION);

GLOBAL.createPath(path.SERVER_BACKGROUND_HOME);
GLOBAL.createPath(path.SERVER_BACKGROUND_LIVE);
GLOBAL.createPath(path.SERVER_BACKGROUND_COMMUNITY);
GLOBAL.createPath(path.SERVER_BACKGROUND_TVSERIES);
GLOBAL.createPath(path.SERVER_BACKGROUND_YOUTUBER);

GLOBAL.createPath(path.SERVER_MOVIE_TEMP_PATH);
GLOBAL.createPath(path.SERVER_COMMUNITY_TEMP_PATH);
GLOBAL.createPath(path.SERVER_TV_SERIES_TEMP_PATH);
GLOBAL.createPath(path.SERVER_YOUTUBERS_PATH);

GLOBAL.createPath(path.LOG_PATH);

// ################################################################
// END - CREATE ALL PATHS 


// ======================================= =======================================  
// LIMITS TO HOMESCREEN FUNCTIONS AT THE FRONT END
// ======================================= ======================================= 

GLOBAL.HOMESCREEN_LIMIT = {
    APPS: {MAX_VIEW: 7, MAX_INSERT: 9},
    BANNERS: {MAX_BLOCKS: 2, MAX_ITEMS: 30},
    HIGHTLIGHTS: {MAX_BLOCKS: 2, MAX_ITEMS: 3},
    WIDGETS: 10,
    SPONSORS: 10,
    MENU: 20
};

// ======================================= =======================================  
// FRONT END PARAMETER CALLS
// ======================================= ======================================= 

GLOBAL.NEXT_URL = {
    
    MAIN_LIST: 'getmainlist',
    HOME_APPS: 'gethomeapps',
    ALL_APPS: 'getallapps',
    HIGHLIGHTS: 'gethightlights',
    BANNERS: 'getbanners',
    SPONSORS: 'getsponsors',
    WIDGETS: 'getwidgets',
    HOME_BACKGROUND: 'gethomescreenbackground',

    HOME_SCREEN: 'gethomescreen',
    HOME_SCREEN_WITH_MENU: 'gethomescreenmenu',

    LIVE_COUNTRIES: 'getlivecountries',
    LIVE_COUNTRY_CHANNELS: 'getlivecountrychannels',

    MOVIE_CATEGORIES: 'getmoviecategories',
    MOVIE_BY_CATEGORY: 'getmoviebycategory',

    TV_SERIES_CATEGORIES: 'gettvseriescategories',
    TV_SERIES_BY_CATEGORY: 'gettvseriesbycategory',

    COMMUNITY_COUNTRIES: 'getcommunitycountries', 
    COMMUNITY_BY_CHANNEL: 'getcommunitycountrychannels',
    
    YOUTUBER_CATEGORIES: 'getyoutubercategories',
    YOUTUBER_BY_CATEGORY: 'getyoutuberbycategory',
    
    SUPPORT: "getsupport",
    
    GET_PARENTAL_CONTROL: "getparentalcontrol",
    SET_PARENTAL_CONTROL: "setparentalcontrol",
    SET_PASSWORD_PARENTAL_CONTROL: "setpasswordparentalcontrol",
    AUTHENTICATE_PARENTAL_CONTROL: "authenticateparentalcontrol",
    GET_OBJECTS_PARENTAL_CONTROL: "getobjectsparentalcontrol",
    EXIST_PARENTAL_CONTROL: "existparentalcontrol",
    RESET_PARENTAL_CONTROL: "resetparentalcontrol"

};