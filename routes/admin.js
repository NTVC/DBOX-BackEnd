

// ======================================= GET CURRENT PAGE AND RENDER =======================================  

// ======================================= =======================================  
// IMDB HACK
// ======================================= ======================================= 

exports.imdb_hack = function (req, res) {
   
   // res.render('imdb-hack', {url: req.query.url});
    
} 
        
// ================================== =======================================  
// INDEX
// ================================== ======================================= 
        
exports.index = function (req, res) {
    
    res.render('index', {
        active: 'main',
        title: 'Main',
        icon: 'glyphicon glyphicon-globe',
        user: req.user
    });

};

// ======================================= =======================================  
// ADMIN
// ======================================= =======================================  

// *** GET REQUEST
exports.admin = function (req, res) {
    
    hasAccessPage(function () {
        res.render('admin', {
            active: 'admin',
            title: 'User',
            icon: 'glyphicon glyphicon-user',
            user: req.user
        });

    }, 'admin', req, res);
};

// *** POST REQUEST
exports.handler_admin = function (req, res) {

    hasAccessPage(function () {
        require('./../controllers/AdminController').process(req, res);
    }, 'admin', req, res);
};


// ======================================= =======================================  
// LIVE
// ======================================= =======================================  

// *** GET REQUEST
exports.live = function (req, res) {
    
    hasAccessPage(function () {
        res.render('live', {
            active: 'live',
            title: 'Live',
            icon: 'glyphicon glyphicon-facetime-video',
            user: req.user
        });

    }, 'live', req, res);
};

// *** POST REQUEST
exports.handler_live = function (req, res) {

    hasAccessPage(function () {
        require('./../controllers/LiveController').process(req, res);
    }, 'live', req, res);

};

// ======================================= =======================================  
// MOVIE
// ======================================= =======================================  

// *** GET REQUEST
exports.movie = function (req, res) {
    
    hasAccessPage(function () {
        res.render('movie', {
            active: 'movie',
            title: 'Movie',
            icon: 'glyphicon glyphicon-film',
            user: req.user
        });

    }, 'movie', req, res);
};

// *** POST REQUEST
exports.handler_movie = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/MovieController').process(req, res);
    }, 'movie', req, res);
};


// ======================================= =======================================  
// TV SERIES
// ======================================= =======================================  

// *** GET REQUEST
exports.tvseries = function (req, res) {
    
    hasAccessPage(function () {
        res.render('tvseries', {
            active: 'tvseries',
            title: 'TV Series',
            icon: 'glyphicon glyphicon-play-circle',
            user: req.user
        });

    }, 'tvseries', req, res);
};

// *** POST REQUEST
exports.handler_tvseries = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/TvSeriesController').process(req, res);
    }, 'tvseries', req, res);

};

// *** POST REQUEST
exports.handler_tvseries_list = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/TvSeriesListController').process(req, res);
    }, 'tvseries', req, res);
};
// *** POST REQUEST
exports.handler_tvseries_video = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/TvSeriesVideoController').process(req, res);
    }, 'tvseries', req, res);
};


// ======================================= =======================================  
// COMMUNITY
// ======================================= =======================================  

// *** GET REQUEST
exports.community = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('community', {
            active: 'community',
            title: 'Community',
            icon: 'glyphicon glyphicon-cloud',
            user: req.user
        });

    }, 'community', req, res);
};

// *** POST REQUEST
exports.handler_community = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/CommunityController').process(req, res);
    }, 'community', req, res);
};
// *** POST REQUEST
exports.handler_community_list = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/CommunityListController').process(req, res);
    }, 'community', req, res);
};
// *** POST REQUEST
exports.handler_community_video = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/CommunityVideoController').process(req, res);
    }, 'community', req, res);
};

// ======================================= =======================================  
// YOUTUBER
// ======================================= =======================================  

// *** GET REQUEST
exports.youtuber = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('youtuber', {
            active: 'youtuber',
            title: 'Youtuber',
            icon: 'glyphicon glyphicon-cloud',
            user: req.user
        });

    }, 'youtuber', req, res);
};

// *** POST REQUEST
exports.handler_youtuber = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/YoutuberController').process(req, res);
    }, 'youtuber', req, res);
};
// *** POST REQUEST
exports.handler_youtuber_list = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/YoutuberListController').process(req, res);
    }, 'youtuber', req, res);
};
// *** POST REQUEST
exports.handler_youtuber_video = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/YoutuberVideoController').process(req, res);
    }, 'youtuber', req, res);
};

// ======================================= =======================================  
// CUSTOMER
// ======================================= =======================================  

// *** GET REQUEST
exports.customer = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('customer', {
            active: 'customer',
            title: 'Customer',
            icon: 'glyphicon glyphicon-user',
            user: req.user
        });

    }, 'customer', req, res);
};

// *** POST REQUEST
exports.handler_customer = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/CustomerController').process(req, res);
    }, 'customer', req, res);

};


// ======================================= =======================================  
// DEVICE
// ======================================= =======================================  

// *** GET REQUEST
exports.device = function (req, res) {
    
    hasAccessPage(function () {
        res.render('device', {
            active: 'device',
            title: 'Device',
            icon: 'fa fa-android',
            user: req.user
        });

    }, 'device', req, res);
};

// *** POST REQUEST
exports.handler_device = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/DeviceController').process(req, res);
    }, 'device', req, res);

};


// ======================================= =======================================  
// DEVICE VERSION
// ======================================= =======================================  

// *** POST REQUEST
exports.handler_deviceVersion = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/DeviceVersionController').process(req, res);
    }, 'homedeviceversion', req, res);
};


// ======================================= =======================================  
// HOME SCREEN APPS
// ======================================= =======================================  

// *** GET REQUEST
exports.homeApps = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('homeApps', {
            active: 'homeapps',
            title: 'Apps',
            icon: 'fa fa-android',
            user: req.user
        });
    
    }, 'homeapps', req, res);
};  

// *** POST REQUEST
exports.handler_homeApps = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/HomeAppsController').process(req, res);
    }, 'homeapps', req, res);
};

// ======================================= =======================================  
// HOME SCREEN HIGHLIGHTS
// ======================================= =======================================  

// *** GET REQUEST
exports.homeHighlights = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('homeHighlights', {
            active: 'homehighlights',
            title: 'Highlights',
            icon: 'fa fa-android',
            user: req.user
        });
    
    }, 'homehighlights', req, res);
};

// *** POST REQUEST
exports.handler_homeHighlights = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/HomeHighLightsController').process(req, res);
    }, 'homehighlights', req, res);
};

// ======================================= =======================================  
// HOME SCREEN BANNERS
// ======================================= =======================================  

// *** GET REQUEST
exports.homeBanners = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('homeBanners', {
            active: 'homebanners',
            title: 'Banners',
            icon: 'fa fa-android',
            user: req.user
        });
    
    }, 'homebanners', req, res);
};

// *** POST REQUEST
exports.handler_homeBanners = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/HomeBannersController').process(req, res);
    }, 'homebanners', req, res);
};

// *** POST REQUEST
exports.handler_homeBannersContent = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/HomeBannersContentController').process(req, res);
    }, 'homebanners', req, res);
};

// ======================================= =======================================  
// HOME SCREEN SPONSORS VIDEO
// ======================================= =======================================  

// *** GET REQUEST
exports.homeSponsors = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('homeSponsors', {
            active: 'homesponsors',
            title: 'Sponsors Video',
            icon: 'fa fa-android',
            user: req.user
        });
    
    }, 'homesponsors', req, res);
};

// *** POST REQUEST
exports.handler_homeSponsors = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/HomeSponsorsController').process(req, res);
    }, 'homesponsors', req, res);
};
// ======================================= =======================================  
// HOME SCREEN WIDGET
// ======================================= =======================================  

// *** GET REQUEST
exports.homeWidgets = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('homeWidgets', {
            active: 'homewidgets',
            title: 'Widgets',
            icon: 'fa fa-android',
            user: req.user
        });
    
    }, 'homewidgets', req, res);
};

// *** POST REQUEST
exports.handler_homeWidgets = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/HomeWidgetsController').process(req, res);
    }, 'homewidgets', req, res);
};
// ======================================= =======================================  
// HOME SCREEN SUPPORT
// ======================================= =======================================  

// *** GET REQUEST
exports.homeSupport = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('homeSupport', {
            active: 'homeSupport',
            title: 'Support',
            icon: 'fa fa-question-circle',
            user: req.user
        });
    
    }, 'homesupport', req, res);
};

// *** POST REQUEST
exports.handler_homeSupport = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/HomeSupportController').process(req, res);
    }, 'homesupport', req, res);
};

// ======================================= =======================================  
// HOME SCREEN MENU
// ======================================= =======================================  

// *** GET REQUEST
exports.homeMenu = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('homeMenu', {
            active: 'homeMenu',
            title: 'Menu',
            icon: 'fa fa-question-circle',
            user: req.user
        });
    
    }, 'homemenu', req, res);
};

// *** POST REQUEST
exports.handler_homeMenu = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/HomeMenuController').process(req, res);
    }, 'homemenu', req, res);
};

// ======================================= =======================================  
// HOME SCREEN BACKGROUND
// ======================================= =======================================  

// *** GET REQUEST
exports.homeBackground = function (req, res) {
    
    hasAccessPage(function () {
        
        res.render('homeBackground', {
            active: 'homeBackground',
            title: 'Background',
            icon: 'fa fa-picture-o',
            user: req.user
        });
    
    }, 'homebackground', req, res);
};

// *** POST REQUEST
exports.handler_homeBackground = function (req, res) {
    
    hasAccessPage(function () {
        require('./../controllers/HomeBackgroundController').process(req, res);
    }, 'homebackground', req, res);
};

// ======================================= =======================================  
// LOGIN
// ======================================= =======================================

// *** GET REQUEST
exports.login = function (req, res) {

    res.render('login', {
        messages: req.flash('error') || req.flash('info')
    });
};

// ======================================= =======================================  
// CHECK PERMISSION ON THE CURRENT PAGE
// ======================================= =======================================
function hasAccessPage(callback, page, req, res){
    
    var hasAcess = false;
    
    // IS SUPERADMIN
    if (req.user.superadmin) {
        hasAcess = true;
    }
    // CHECK TAB PERMISSION
    else if (req.user[page]) {
        hasAcess = true;
    }

    // -------------------------------------------------------------------
    // NO PERMISSIONS, REDIRECT TO LOGIN PAGE
    if (!hasAcess) {
        req.flash('error', 'Page not permited to %s.', req.user.username);
        req.logout();
        res.redirect('/login');
    }
    // PROCEED PROCESS
    else {
        callback();
    }
}