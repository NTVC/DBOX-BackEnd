require('./../models/Admin');
var Admin = GLOBAL.mongoose.model('Admin');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST ADMINS
    if (GLOBAL.getBoolean(req.query.list)) {
        
        var params = {};
        
        params.filter = {
            search: req.query.search, 
            status: req.query.status, 
            pg: {
                index: req.query.pg_index, 
                limit: req.query.pg_limit
            }
        };

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
    // SAVE OR UPDATE ADMIN
    else if (GLOBAL.getBoolean(req.query.save)) {
        save(req, res);
    }
    
    // ---------------------------------------------
    // DELETE ADMIN BY ID
    else if (GLOBAL.getBoolean(req.query.delete) && req.query.id != undefined ) {
        remove(req, res);
    }
    
    // ---------------------------------------------
    // CHECK USERNAME EXIST ON THE DATABASE
    else if (req.query.username != undefined && GLOBAL.getBoolean(req.query.check)) {

        var username = req.query.username;
        isUserNameAvailable(username, res);
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
                    { "firstname": new RegExp(params.filter.search, 'i') }, 
                    { "lastname": new RegExp(params.filter.search, 'i') }, 
                    { "username": new RegExp(params.filter.search, 'i') },
                    { "mail": new RegExp(params.filter.search, 'i') },
                    { "phone": new RegExp(params.filter.search, 'i') }
                ]
            } : {},
            (params.filter.status == '' ? {} : ({ "status" : JSON.parse(params.filter.status) }))
        ]
    });

    return filter;
};

// ======================================= =======================================  
// GET QUANTITY OF ADMINS ON THE DATABASE
// ======================================= =======================================
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    Admin.find(listAllFilter(params)).count(function (err, total) {
        
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
//  LIST ALL ADMINS ON THE DATABASE
// ======================================= =======================================
var listAll = function (res, params) {
    GLOBAL.db_open();

    Admin.find(listAllFilter(params))
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .exec(
        function (err, admins) {
            GLOBAL.db_close();
            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(admins));
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
// UPDATE AND SAVE ADMIN
// ======================================= =======================================
var save = function (req, res) {
    
    var obj;

    // UPDATE
    if (req.query._id !== undefined) {
        
        obj = getParamsAdmin(req, null);

        GLOBAL.db_open();

        Admin.findByIdAndUpdate(req.query._id, obj, function (err) {
            
            GLOBAL.db_close();

            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
        });

    }
    // SAVE NEW ADMIN
    else {

        obj = new Admin();
        obj = getParamsAdmin(req, obj);
        
        GLOBAL.db_open();

        obj.save(function (err) {

            GLOBAL.db_close();

            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            } else {
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
        });
    }
}

// ======================================= =======================================  
// FIND BY ID
// ======================================= =======================================

exports.findById = function(id, done){
    
    GLOBAL.db_open();
    Admin.findById(id, function (err, user) {
        GLOBAL.db_close();
        done(err, user);
    });
}

// ======================================= =======================================  
// LOGIN
// ======================================= =======================================
exports.login = function(username, password, done){
    
    GLOBAL.db_open();
    
    Admin.findOne({ username: username, status: true }, function (err, admin) {
        
        GLOBAL.db_close();
        if (err) {
            GLOBAL.log(err, null);
            return done(err);
        }
        if (!admin) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (!admin.authenticate(password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        if (admin.status == false) {
            return done(null, false, { message: 'Admin disabled.' });
        }
        return done(null, admin);
    });
}

// ======================================= =======================================  
// REMOVE ADMIN FROM DATABASE
// ======================================= =======================================
var remove = function (req, res){
    
    GLOBAL.db_open();

    Admin.remove({ _id: req.query.id }, function (err) {
        
        GLOBAL.db_close();

        res.writeHead(200, { "Content-Type": "text/plain" });
        if (err) {
            GLOBAL.log(err, null);
            res.end(App_Message.ERROR_IN_PROCESS);
        }
        else {
            res.end(App_Message.SUCESS_IN_PROCESS);
        }

    });
}

// ======================================= =======================================  
// CHECK IF USERNAME IS AVAILABLE
// ======================================= =======================================
var isUserNameAvailable = function (username, res){
    GLOBAL.db_open();
    
    Admin.find({ "username": username })
    .limit(1)
    .exec(
        function (err, admin) {
            
            GLOBAL.db_close();

            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(admin));
            }
            else {
                GLOBAL.log(err, null);
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(App_Message.ERROR_IN_PROCESS);
            }
        }
    );
}

// ======================================= =======================================  
// GET PARAMS FROM POST AND BIND AN OBJECT
// ======================================= =======================================
var getParamsAdmin = function(req, obj){
    
    var _obj;

    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    if (req.query._id != undefined) {
        _obj._id = req.query._id;
    }

    _obj.username = GLOBAL.getString(req.query.username);
    
    if (req.query.password != undefined) {
        
        if (req.query.password_update != undefined) {
            _obj.password = GLOBAL.encrypter(req.query.password);
        }
        else {
            _obj.password = req.query.password;
        }
    }
        
    _obj.firstname          = GLOBAL.getString(req.query.firstname);
    _obj.lastname           = GLOBAL.getString(req.query.lastname);
    _obj.phone              = GLOBAL.getString(req.query.phone);
    _obj.mail               = GLOBAL.getString(req.query.mail);
    _obj.status             = GLOBAL.getString(req.query.status);
    
    // -------------------------------------------------------------
    // PERMISSIONS
    _obj.superadmin         = GLOBAL.getBoolean(req.query.superadmin);
    _obj.live               = GLOBAL.getBoolean(req.query.live);
    _obj.movie              = GLOBAL.getBoolean(req.query.movie);
    _obj.tvseries           = GLOBAL.getBoolean(req.query.tvseries);
    _obj.community          = GLOBAL.getBoolean(req.query.community);
    _obj.customer           = GLOBAL.getBoolean(req.query.customer);
    _obj.device             = GLOBAL.getBoolean(req.query.device);
    
    _obj.homeapps           = GLOBAL.getBoolean(req.query.homeapps);
    _obj.homebackground     = GLOBAL.getBoolean(req.query.homebackground);
    _obj.homesponsors       = GLOBAL.getBoolean(req.query.homesponsors);
    _obj.homesupport        = GLOBAL.getBoolean(req.query.homesupport);
    _obj.homebanners        = GLOBAL.getBoolean(req.query.homebanners);
    _obj.homehighlights     = GLOBAL.getBoolean(req.query.homehighlights);
    _obj.homemenu           = GLOBAL.getBoolean(req.query.homemenu);
    _obj.homewidgets        = GLOBAL.getBoolean(req.query.homewidgets);

    return _obj;
}