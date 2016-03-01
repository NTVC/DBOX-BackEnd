// production || development || homologation
GLOBAL.environment = 'development';
process.env.NODE_ENV = process.env.NODE_ENV || GLOBAL.environment;


GLOBAL.environment_settings = require('./config/env/' + process.env.NODE_ENV + '.js');

// ==========================================================================================
// ======================================= LOG ==============================================  

GLOBAL.log = function(message, stack){
    
    var fs = require('fs');
    var d = new Date();
    var txtName = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + d.getFullYear();
    
    var file = __dirname + "/public/log/" + txtName + ".txt";
    var errorMessage;

    errorMessage = "Date: " + new Date().toISOString();
    errorMessage += '\n uncaughtException: ' + message + '\n';
    
    if(stack){
        errorMessage += stack + '\n\n';
    }
    
    try {
        fs.appendFile(file, errorMessage, "utf8");
    } catch (e) {
        fs.writeFile(file, errorMessage, "utf8");
    }
  
    GLOBAL.sendEmail(null, null, "Golive - backend error", errorMessage);
};
// ==========================================================================================
// ======================================= SET VARIABLES ====================================  

var express = require('express');
var flash = require('connect-flash');
var http = require('http');
var path = require('path');

var app = express();
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

var config = require('./config/config');
var mongoose = require('./config/mongoose');
var bodyParser = require('body-parser');

var routes_admin = require('./routes/admin.js');
var routes_dbox = require('./routes/dbox.js');

// ==========================================================================================
// =================================== SET APP BASIC SETTINGS ===============================

app.set('port', GLOBAL.environment_settings.port || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.bodyParser({ maxFieldsSize: '50mb' }));
app.use(express.cookieParser());
app.use(require('express-session')({
    saveUninitialized: true, 
    resave: false,
    duration: 30 * 60 * 1000,
    activeDuration: 50 * 60 * 1000, 
    secret: '3667ce11c49bc51f0a4504c0081b1b12',
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    key:'golive', httpOnly: true 
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// ===================================
// ACCEPT ANY COMPUTER MAKING REQUEST IN THIS PATH
app.all('/dbox', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// ==========================================================================================
// ======================================= SET ROUTES =======================================  

// =======================================
// SET REQUEST BY GET
app.get('/', isLoggedIn, routes_admin.index);
app.get('/login', routes_admin.login);
app.get('/admin', isLoggedIn, routes_admin.admin);
app.get('/live', isLoggedIn, routes_admin.live);
app.get('/movie', isLoggedIn, routes_admin.movie);
app.get('/customer', isLoggedIn, routes_admin.customer);
app.get('/tvseries', isLoggedIn, routes_admin.tvseries);
app.get('/community', isLoggedIn, routes_admin.community);
app.get('/youtuber', isLoggedIn, routes_admin.youtuber);
app.get('/device', isLoggedIn, routes_admin.device);

app.get('/homeApps', isLoggedIn, routes_admin.homeApps);
app.get('/homeHighlights', isLoggedIn, routes_admin.homeHighlights);
app.get('/homeBanners', isLoggedIn, routes_admin.homeBanners);
app.get('/homeSponsors', isLoggedIn, routes_admin.homeSponsors);
app.get('/homeWidgets', isLoggedIn, routes_admin.homeWidgets);
app.get('/homeSupport', isLoggedIn, routes_admin.homeSupport);
app.get('/homeMenu', isLoggedIn, routes_admin.homeMenu);
app.get('/homeBackground', isLoggedIn, routes_admin.homeBackground);

// HACK IMG - media imdb
//app.get('/imdb-hack', isLoggedIn, routes_admin.imdb_hack);
app.get('/imdb-hack', routes_admin.imdb_hack);

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

// =======================================
// SET REQUEST BY POST
app.post('/handler/admin', isLoggedIn, routes_admin.handler_admin);
app.post('/handler/live', isLoggedIn, routes_admin.handler_live);
app.post('/handler/movie', isLoggedIn, routes_admin.handler_movie);
app.post('/handler/customer', isLoggedIn, routes_admin.handler_customer);

app.post('/handler/tvseries', isLoggedIn, routes_admin.handler_tvseries);
app.post('/handler/tvseriesList', isLoggedIn, routes_admin.handler_tvseries_list);
app.post('/handler/tvseriesVideo', isLoggedIn, routes_admin.handler_tvseries_video);

app.post('/handler/community', isLoggedIn, routes_admin.handler_community);
app.post('/handler/communityList', isLoggedIn, routes_admin.handler_community_list);
app.post('/handler/communityVideo', isLoggedIn, routes_admin.handler_community_video);

app.post('/handler/youtuber', isLoggedIn, routes_admin.handler_youtuber);
app.post('/handler/youtuberList', isLoggedIn, routes_admin.handler_youtuber_list);
app.post('/handler/youtuberVideo', isLoggedIn, routes_admin.handler_youtuber_video);

app.post('/handler/device', isLoggedIn, routes_admin.handler_device);
app.post('/handler/deviceVersion', isLoggedIn, routes_admin.handler_deviceVersion);

app.post('/handler/homeApps', isLoggedIn, routes_admin.handler_homeApps);
app.post('/handler/homeHighlights', isLoggedIn, routes_admin.handler_homeHighlights);

app.post('/handler/homeBanners', isLoggedIn, routes_admin.handler_homeBanners);
app.post('/handler/homeBannersContent', isLoggedIn, routes_admin.handler_homeBannersContent);

app.post('/handler/homeSponsors', isLoggedIn, routes_admin.handler_homeSponsors);
app.post('/handler/homeWidgets', isLoggedIn, routes_admin.handler_homeWidgets);
app.post('/handler/homeSupport', isLoggedIn, routes_admin.handler_homeSupport);
app.post('/handler/homeMenu', isLoggedIn, routes_admin.handler_homeMenu);
app.post('/handler/homeBackground', isLoggedIn, routes_admin.handler_homeBackground);

app.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

// =======================================
// DBOX ROUTES 
routes_dbox(app);

// ==========================================================================================
// ======================================= SESSION ==========================================  

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    require('./controllers/AdminController').findById(id, done);
});

// =======================================
// ROUTE TO AUTHENTICATE THE USER
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

// =======================================
// VALIDATE CURRENT USER HAS ACCESS
passport.use(new LocalStrategy(function (username, password, done) {
    require('./controllers/AdminController').login(username, password, done);
}));

// =======================================
// VALIDATE IF USER IS AUTHENTICATED
function isLoggedIn(req, res, next) {
    
    if (req.isAuthenticated()) {
        return next();
    }
    else if (req.method == "POST") {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.SESSION_EXPIRED);
    }
    else {
        res.redirect('/login');
    }
}

// =======================================
// OPEN APPLICATION ON THE PORT CONFIGURED
app.listen(config.port, config.serverip);

// ======================================= =======================================  
//GET APPLICATION ERRORS
// ======================================= =======================================  

process.on('uncaughtException', function (err) {
   GLOBAL.log(err.message, err.stack);
});
