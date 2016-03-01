var returnUtil = require('../util/ReturnUtil');
var pathBox = "./../controllers/box/";
require('./../util/generic');


exports.mainFlow = function (req, res, json) {
    
    var filters;

    try{
        
        if (json.DBox.Query.hasOwnProperty('nexturl')) {
            
            var params = { res: res, req: req };
            
            filters = getFilterParams(json.DBox.Query);
            
            // ======================================= =======================================  
            // MAIN LIST CALL
            // ======================================= ======================================= 
            
            if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.MAIN_LIST) {
                getServiceDbox(json, req, res, null, 1, true);
            }

            // ======================================= =======================================  
            // APPS
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.HOME_APPS) {
                getServiceDbox(json, req, res, null, 2, true);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.ALL_APPS) {
                require(pathBox + 'HomeScreenController').getAllApps(req, res,  json.DBox.Customer, filters);
            }

            // ======================================= =======================================  
            // HIGHLIGHTS
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.HIGHLIGHTS) {
                getServiceDbox(json, req, res, null, 3, true);
            }
            
            // ======================================= =======================================  
            // BANNERS
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.BANNERS) {
                getServiceDbox(json, req, res, null, 4, true);
            }
            
            // ======================================= =======================================  
            // SPONSORS
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.SPONSORS) {
                getServiceDbox(json, req, res, null, 5, true);
            }
            
            // ======================================= =======================================  
            // WIDGETS
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.WIDGETS) {
                getServiceDbox(json, req, res, null, 6, true);
            }
            
            // ======================================= =======================================  
            // SUPPORT
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.SUPPORT) {
                getServiceDbox(json, req, res, null, 7, true);
            }
            
            // ======================================= =======================================  
            // HOME BACKGROUND
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.HOME_BACKGROUND) {
                getServiceDbox(json, req, res, null, 8, true);
            }

            // ======================================= =======================================  
            // HOMESCREEN COMPLETE WITH MENU OR NOT
            // ======================================= ======================== =============== 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.HOME_SCREEN) {
                getServiceDbox(json, req, res, null, 2, false);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.HOME_SCREEN_WITH_MENU) {
                getServiceDbox(json, req, res, null, 1, false);
            }
            
            // ======================================= =======================================  
            // COMMUNITY REQUESTS
            // ======================================= ======================================= 

            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.COMMUNITY_COUNTRIES) {
                GLOBAL.getCountries(params, require(pathBox + 'CommunityController').getActiveCountries);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.COMMUNITY_BY_CHANNEL) {
                dashBoardObject(req, 3, json, filters);
                require(pathBox + 'CommunityController').listAll(req, res, filters, json.DBox.Customer);
            }

            // ======================================= =======================================  
            // LIVE REQUESTS
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.LIVE_COUNTRIES) {
                GLOBAL.getCountries(params, require(pathBox + 'LiveController').getActiveCountries);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.LIVE_COUNTRY_CHANNELS) {
                dashBoardObject(req, 1, json, filters);
                require(pathBox + 'LiveController').listAll(req, res, filters, json.DBox.Customer);
            }
            
            // ======================================= =======================================  
            // MOVIES REQUESTS
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.MOVIE_CATEGORIES) {
                GLOBAL.getCategories(params, require(pathBox + 'MovieController').getActiveCategories);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.MOVIE_BY_CATEGORY) {
                dashBoardObject(req, 2, json, filters);
                require(pathBox + 'MovieController').listAll(req, res, filters);
            }

            // ======================================= =======================================  
            // TV SERIES REQUESTS
            // ======================================= ======================================= 

            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.TV_SERIES_CATEGORIES) {
                GLOBAL.getCategories(params, require(pathBox + 'TvSeriesController').getActiveCategories);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.TV_SERIES_BY_CATEGORY) {
                dashBoardObject(req, 4, json, filters);
                require(pathBox + 'TvSeriesController').listAll(req, res, filters, json.DBox.Customer);
            }
            
            // ======================================= =======================================  
            // YOUTUBER REQUESTS
            // ======================================= ======================================= 

            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.YOUTUBER_CATEGORIES) {
                GLOBAL.getCommunityCategories(params, require(pathBox + 'YoutuberController').getActiveCategories);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.YOUTUBER_BY_CATEGORY) {
                dashBoardObject(req, 14, json, filters);
                require(pathBox + 'YoutuberController').listAll(req, res, filters, json.DBox.Customer);
            }
            
            // ======================================= =======================================  
            // PARENTAL CONTROL
            // ======================================= ======================================= 
            
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.EXIST_PARENTAL_CONTROL) {
                require(pathBox + 'ParentalControlController').exist(req, res, json.DBox.Device);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.GET_PARENTAL_CONTROL) {
                require(pathBox + 'ParentalControlController').get(req, res, json.DBox.Device);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.SET_PARENTAL_CONTROL) {
                require(pathBox + 'ParentalControlController').set(req, res, json.DBox.Device, json.DBox.Query.ParentalControl);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.SET_PASSWORD_PARENTAL_CONTROL) {
                require(pathBox + 'ParentalControlController').setPassword(req, res, json);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.AUTHENTICATE_PARENTAL_CONTROL) {
                require(pathBox + 'ParentalControlController').authenticate(req, res, json);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.GET_OBJECTS_PARENTAL_CONTROL) {
                require(pathBox + 'ParentalControlController').getObjects(req, res, json.DBox.Customer);
            }
            else if (json.DBox.Query.nexturl === GLOBAL.NEXT_URL.RESET_PARENTAL_CONTROL) {
                require(pathBox + 'ParentalControlController').reset(req, res, json);
            }
            
            // ======================================= =======================================  
            // ERROR REQUESTS
            // ======================================= ======================================= 

            else {
                returnUtil.generateReturn(null, 101, null, 999, null, req, res);
            }
            
        }
        else {
            // ======================================= =======================================  
            // ERROR REQUESTS
            // ======================================= ======================================= 

            returnUtil.generateReturn(null, 101, null, 999, null, req, res);
        }
    }
    catch(ex){
        GLOBAL.log(ex.message, ex.stack);
        returnUtil.generateReturn(null, 101, null, 999, null, req, res);
    }
};

function getServiceDbox(mainJson, req, res, result, step, isOnly)
{
    
    var getFullJson = { background: null, menu: null, apps: null, highlights: null, banners: null, sponsors: null, widgets: null, customer: null, support:null };
    
    if (!result) {
        result = getFullJson;
    }

    // ======================================= =======================================  
    // GET ALL MENUS
    // ======================================= ======================================= 
    
    if (step == 1) {
        
        require(pathBox + 'HomeScreenController').getMenu(req, res, mainJson.DBox.Customer, function (data) {
            
            if (isOnly) {
                returnUtil.generateReturn(null, 100, JSON.stringify(data), 0, null, req, res);
            }
            else {
                result.menu = data;
                getServiceDbox(mainJson, req, res, result, 2);
            }

        });

    }

    // ======================================= =======================================  
    // GET ALL APPS
    // ======================================= ======================================= 
    
    if (step == 2) {
        require(pathBox + 'HomeScreenController').getHomeApps(req, res, mainJson.DBox.Customer, function (data) {
            
            if (isOnly) {
                returnUtil.generateReturn(null, 100, JSON.stringify(data), 6, null, req, res);
            }
            else {
                result.apps = data;
                getServiceDbox(mainJson, req, res, result, 3);
            }

        });
    }
        
    // ======================================= =======================================  
    // GET ALL HIGHTLIGHTS
    // ======================================= ======================================= 
        
    else if (step == 3) {
        require(pathBox + 'HomeScreenController').getAllHighlights(req, res, mainJson.DBox.Customer, function (data) {
           
            if (isOnly) {
                returnUtil.generateReturn(null, 100, JSON.stringify(data), 7, null, req, res);
            }
            else {
                result.highlights = data;
                getServiceDbox(mainJson, req, res, result, 4);
            }

        });
    }
    // ======================================= =======================================  
    // GET ALL BANNERS
    // ======================================= ======================================= 
        
    else if (step == 4) {
        require(pathBox + 'HomeScreenController').getAllBanners(req, res, mainJson.DBox.Customer, function (data) {
            
            if (isOnly) {
                returnUtil.generateReturn(null, 100, JSON.stringify(data), 9, null, req, res);
            }
            else {
                result.banners = data;
                getServiceDbox(mainJson, req, res, result, 5);
            }

        });
    }
    // ======================================= =======================================  
    // GET SPONSORS
    // ======================================= ======================================= 
        
    else if (step == 5) {
        require(pathBox + 'HomeScreenController').getAllSponsors(req, res, mainJson.DBox.Customer, function (data) {
            
            if (isOnly) {
                returnUtil.generateReturn(null, 100, JSON.stringify(data), 10, null, req, res);
            }
            else {
                result.sponsors = data;
                getServiceDbox(mainJson, req, res, result, 6);
            }

        });
    }
    // ======================================= =======================================  
    // GET WIDGETS
    // ======================================= ======================================= 
        
    else if (step == 6) {
        require(pathBox + 'HomeScreenController').getAllWidgets(req, res, mainJson.DBox.Customer, function (data) {
            
            if (isOnly) {
                returnUtil.generateReturn(null, 100, JSON.stringify(data), 11, null, req, res);
            }
            else {
                result.widgets = data;
                getServiceDbox(mainJson, req, res, result, 7);
            }

        });
    }  
    // ======================================= =======================================  
    // GET SUPPORT
    // ======================================= ======================================= 
    
    else if (step == 7) {
        
       require(pathBox + 'HomeScreenController').getSupport(req, res, mainJson.DBox.Customer, function (data) {
            
            if (isOnly) {
                returnUtil.generateReturn(null, 100, JSON.stringify(data), 12, null, req, res);
            }
            else {
                result.support = data;
                getServiceDbox(mainJson, req, res, result, 8);
            }

        });

    }
    // ======================================= =======================================  
    // GET HOME BACKGROUND
    // ======================================= ======================================= 
    
    else if (step == 8) {
        
       require(pathBox + 'HomeScreenController').getBackground(req, res, mainJson.DBox.Customer, function (data) {
            
            if (isOnly) {
                returnUtil.generateReturn(null, 100, JSON.stringify(data), 13, null, req, res);
            }
            else {
                result.background = data;
                getServiceDbox(mainJson, req, res, result, 9);
            }

        });

    }
    // ======================================= =======================================  
    // GET CUSTOMER
    // ======================================= ======================================= 
    
    else if (step == 9) {
        
        var customer = {
            firstname: null,
            lastname: null,
            address: null
        }
        
        if (mainJson.DBox.Customer) {
            
            customer.firstname = mainJson.DBox.Customer.firstname;
            customer.lastname = mainJson.DBox.Customer.lastname;
            
            if(mainJson.DBox.Customer.address){
                customer.address = mainJson.DBox.Customer.address;
            }
            
        }
        
        result.customer = customer;
        getServiceDbox(mainJson, req, res, result, 10);

    }
    else if(step == 10) {
        returnUtil.generateReturn(null, 100, JSON.stringify(result), 0, null, req, res);
    }
    
}

// ======================================= =======================================  
// GET BASIC PARAMETERS FROM REQUEST
// ======================================= ======================================= 

function getFilterParams(query){

    var params = {};
    
    params.filter = {
        code: GLOBAL.getString(query.code), 
        search: GLOBAL.getString(query.search), 
        name: GLOBAL.getString(query.name), 
        pg: {
            index: ( GLOBAL.getString(query.pg_index) == '' ? 0 : query.pg_index), 
            limit: (GLOBAL.getString(query.pg_limit) == '' ? 50 : query.pg_limit)
        }
    };
    
    return params;
}

// ======================================= =======================================  
// GET AND SET DASHBOARD LOG
// ======================================= ======================================= 

function dashBoardObject(req, render, mainJson, filters){
    
    var wsDash  = require('./../util/DashBoard');
    var obj = {
        
        Customer:           null,
        Device:             null, 
        Device_info: {
            ip:             null,
            agent:          null,
            referrer:       null,
            screen: {
                width:      null,
                height:     null
            }
        },
        Content: {
            type_content:   null, 
            filter:         null, 
            item:           null
        }
        
    };
    
    obj.Customer                    = mainJson.DBox.Customer;
    obj.Device                      = mainJson.DBox.Device;
    
    obj.Device_info.ip              = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress);
    obj.Device_info.agent           = req.headers['user-agent'];
    obj.Device_info.referrer        = req.headers['referrer'];
    obj.Device_info.screen.width    = GLOBAL.getString(req.param('width'));
    obj.Device_info.screen.height   = GLOBAL.getString(req.param('height'));
    
    obj.Content.type_content        = render;
    obj.Content.filter              = {code: filters.filter.code, title: filters.filter.name};
    obj.Content.item                = null;
    
    wsDash.register(obj);
    
};