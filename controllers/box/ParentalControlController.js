var pathFolders = "./../../";

require(pathFolders + 'models/ParentalControl');
require(pathFolders + 'util/generic');

var returnUtil = require(pathFolders + 'util/ReturnUtil');
var ParentalControl = GLOBAL.mongoose.model('ParentalControl');

// ======================================= =======================================  
// LIST OBJECTS TO LOCK AND UNLOCK PARENTAL CONTROL
// ======================================= ======================================= 

exports.getObjects = function(req, res, customer){
    
    var result = {
        apps: null,
        lives: null,
        movies: null,
        tvseries: null,
        communities: null,
        youtubers: null
    };
    
    getObjects(req, res, result, customer, 1);
};

var getObjects = function(req, res, result, customer, step){
    
    // ======================================= 
    // GET APPS
    // =======================================
    if(step == 1){
        
        require(pathFolders + 'models/HomeApps');
        var HomeApps = GLOBAL.mongoose.model('HomeApps');
        
        GLOBAL.db_open();
    
        HomeApps.find(GLOBAL.getCountryFilter(customer))
        .select("thumb name")
        .where('status').equals(true)
        .sort({ order: 1 })
        .exec(
            function (err, apps) {
                
                GLOBAL.db_close();  
                
                if (!err) {
                    
                    if(apps.length == 0){
                        getObjects(req, res, result, null, 1);
                    }else{
                        result.apps = GLOBAL.getJson(apps);
                    }
                    
                }
                
                getObjects(req, res, result, customer, 2);
            }
        );
    }
    // ======================================= 
    // GET LIVES
    // =======================================
    else if(step == 2){
        
        require(pathFolders + 'models/Live');
        var Live = GLOBAL.mongoose.model('Live');
        
        GLOBAL.db_open();
    
        Live.find()
            .select("thumb name")
            .where('active').equals(true)
            .exec(
            function (err, lives) {
                
                GLOBAL.db_close();
                
                if (!err) {
                    result.lives = GLOBAL.getJson(lives);
                }
                
                getObjects(req, res, result, customer, 3);
            }
        );
    }
    // ======================================= 
    // GET MOVIES
    // =======================================
    else if(step == 3){
        
        require(pathFolders + 'models/Movie');
        var Movie = GLOBAL.mongoose.model('Movie');
        
        GLOBAL.db_open();
    
        Movie.find()
            .select("thumb title")
            .where('active').equals(true)
            .exec(
            function (err, movies) {
                
                GLOBAL.db_close();
                
                if (!err) {
                    result.movies = GLOBAL.getJson(movies);
                }
                
                getObjects(req, res, result, customer, 4);
            }
        );
    }
    // ======================================= 
    // GET TVSERIES
    // =======================================
    else if(step == 4){
        
        require(pathFolders + 'models/TvSeries');
        var TvSeries = GLOBAL.mongoose.model('TvSeries');
        
        GLOBAL.db_open();
    
        TvSeries.find({ video_counter: { $ne: 0 } })
            .where('status').equals(true)
            .select("thumb title")
            .exec(
            function (err, tvseries) {
                
                GLOBAL.db_close();
                
                if (!err) {
                    result.tvseries = GLOBAL.getJson(tvseries);
                }
                
                getObjects(req, res, result, customer, 5);
            }
        );
    }
    // ======================================= 
    // GET COMMUNITIES
    // =======================================
    else if(step == 5){
        
        require(pathFolders + 'models/Community');
        var Community = GLOBAL.mongoose.model('Community');
        
        GLOBAL.db_open();
    
        Community.find({ video_counter: { $ne: 0 } })
            .select("thumb title")
            .where('status').equals(true)
            .exec(
            function (err, communities) {
                
                GLOBAL.db_close();
                
                if (!err) {
                    result.communities = GLOBAL.getJson(communities);
                }
                
                getObjects(req, res, result, customer, 6);
            }
        );
    }
    // ======================================= 
    // GET YOUTUBERS
    // =======================================
    else if(step == 6){
        
        require(pathFolders + 'models/Youtuber');
        var Youtuber = GLOBAL.mongoose.model('Youtuber');
        
        GLOBAL.db_open();
    
        Youtuber.find({ video_counter: { $ne: 0 } })
            .select("thumb title")
            .where('status').equals(true)
            .exec(
            function (err, youtubers) {
                
                GLOBAL.db_close();
                
                if (!err) {
                    result.youtubers = GLOBAL.getJson(youtubers);
                }
                
                getObjects(req, res, result, customer, 7);
            }
        );
    }
    else{
        
        returnUtil.generateReturn(null, 100, JSON.stringify(result), 15, null, req, res);
    }
};

// ======================================= =======================================  
// RESET PARENTAL CONTROL
// ======================================= ======================================= 

exports.reset = function (req, res, mainJson) {
  
    if(!mainJson.DBox.Device){
        error(req, res);
        return null;
    }
  
    GLOBAL.db_open();
    
    ParentalControl.findOne({$and : [{ "device" : mainJson.DBox.Device._id }]})
    .exec(
        function (err, json) {
            GLOBAL.db_close();
            
            if (err) {
                returnUtil.generateReturn(null, 200, null, 999, null, req, res);
            }
            else{
                
                GLOBAL.db_open();
                
                var new_pass = String(Math.round(Math.random() * (9999 - 1000) + 1000 ));
                
                // SET NEW PASSWORD    
                ParentalControl.update(
                { device: mainJson.DBox.Device._id}, 
                { 
                    $set: 
                    { 
                        password : GLOBAL.encrypter(new_pass),
                        update: new Date().toISOString()
                    }
                }, 
                function(err, result) {
                    GLOBAL.db_close();
                        
                    if(err){
                        returnUtil.generateReturn(null, 200, null, 999, null, req, res);
                    }else{
                        
                        var email_sent = sendResetEmail(mainJson.DBox.Customer, new_pass);
                        
                        if(email_sent)
                        {
                            returnUtil.generateReturn(null, 100, {mail:email_sent},  15, null, req, res);  
                        }
                        else{
                            returnUtil.generateReturn(null, 200, null, 999, null, req, res);
                        }
                    }
                });
                    
            }
        }
    );
};

var sendResetEmail = function(customer, new_pass){
    
    if(!customer){
        return null;
    }
    
    if(customer.mail){
        var html = "<html>";
        
        html += "<body>";
        html += "Dear " + customer.firstname + ",<br/>";
        html += "A password reset request has been received for the account with email: " + customer.mail + ".<br/>";
        html += "This is your temporary password <b>" + new_pass + "</b>.<br/><br/>"; 

        html += "Do not reply this email <br/><hr/>";
        html += "This email is intended only for the person or entity to which it is addressed and may contain information that is privileged, confidential "; 
        html += "or otherwise protected from disclosure. Dissemination, distribution or copying of this e-mail or the information herein by anyone other than ";
        html += "the intended recipient, or an employee or agent responsible for delivering the message to the intended recipient, is prohibited. If you have received this e-mail in error, please immediately notify the sender. Thank you for your cooperation.";
        html += "</body>";
        html += "</html>";  
             
        GLOBAL.sendEmail(customer.mail, null, 'Golive - New password', html);
        return customer.mail;
    }
    else{
        return null;
    }
};

// ======================================= =======================================  
// GET PARENTAL CONTROL
// ======================================= ======================================= 

exports.get = function (req, res, device) {
  
    if(!device){
        error(req, res);
        return null;
    }
  
    GLOBAL.db_open();
    
    ParentalControl.findOne({$and : [{ "device" : device._id }]})
    .select("-password -device -update -registration -status -_id")
    .exec(
        function (err, json) {
            GLOBAL.db_close();
            
            if (err) {
                returnUtil.generateReturn(null, 200, null, 999, null, req, res);
            }
            else {
                returnUtil.generateReturn(null, 100, JSON.stringify(json), 15, null, req, res);
            }
        }
    );
};

// ======================================= =======================================  
// SET PARENTAL CONTROL
// ======================================= ======================================= 

exports.set = function (req, res, device, object) {
  
    if((!device) || (!object)){
        error(req, res);
        return null;
    }
  
    var updates = {
        password:       GLOBAL.encrypter(GLOBAL.getString(object.password)),
        apps:           object.apps,
        lives:          object.lives,
        movies:         object.movies,
        communities:    object.communities,
        tvseries:       object.tvseries,
        youtubers:      object.youtubers,
        status:         GLOBAL.getBoolean(object.status),
        update:         new Date().toISOString()
    };
    
    // DELETE PASSWORD IF IT DOESNT EXIST
    if(GLOBAL.getString(object.password) == ""){
        delete updates.password;
    }
  
    GLOBAL.db_open();
                    
    ParentalControl.update(
        { device: device._id} , 
        { 
        $set:  updates 
        }, 
        function(err, results) {
            GLOBAL.db_close();
                
            if(err){
                returnUtil.generateReturn(null, 200, null, 999, null, req, res);
            }else{
                returnUtil.generateReturn(null, 100, null,  15, null, req, res);
            }
        }
    );
};

// ======================================= =======================================  
// SET PASSWORD PARENTAL CONTROL
// ======================================= ======================================= 

exports.setPassword = function(req, res, info){
    
    if(!info.DBox.Device){
        error(req, res);
        return null;
    }
    
    GLOBAL.db_open();
    ParentalControl.findOne({ "device" : info.DBox.Device._id })
    .exec(
        function (err, json) {
            GLOBAL.db_close();
            
            if (err) {
                returnUtil.generateReturn(null, 200, null, 999, null, req, res);
            }
            else {
                
                // =======================================
                // UPDATE OBJECT
                // =======================================
                if(json){
                    
                    GLOBAL.db_open();
                    
                    ParentalControl.update(
                        { device: info.DBox.Device._id}, 
                        { 
                        $set: { 
                            password : GLOBAL.encrypter(info.DBox.Query.password),
                            update: new Date().toISOString()
                            }
                        }, 
                        function(err, results) {
                            GLOBAL.db_close();
                                
                            if(err){
                                returnUtil.generateReturn(null, 200, null, 999, null, req, res);
                            }else{
                                returnUtil.generateReturn(null, 100, null,  15, null, req, res);
                            }
                        }
                    );
                }
                
                // =======================================
                // ADD NEW OBJECT
                // =======================================
                else{
                    
                    var obj = new ParentalControl();
                    
                    obj.device = info.DBox.Device._id;
                    obj.password = GLOBAL.encrypter(info.DBox.Query.password);
                    obj.status = true;
                    obj.registration = new Date().toISOString();
                    
                    GLOBAL.db_open();

                    obj.save(function (err) {

                        GLOBAL.db_close();

                        if (err) {
                            returnUtil.generateReturn(null, 200, null, 999, null, req, res);
                        } else {
                            returnUtil.generateReturn(null, 100, null,  15, null, req, res);
                        }
                    });
                }
                
            }
        }
    );
    
}

// ======================================= =======================================  
// AUTHENTICATE PARENTAL CONTROL
// ======================================= ======================================= 

exports.authenticate = function(req, res, info){
    
    if(!info.DBox.Device){
        error(req, res);
        return null;
    }
    
    GLOBAL.db_open();
    
    ParentalControl.findOne({$and : [{ "device" : info.DBox.Device._id }]})
    .exec(
        function (err, json) {
            GLOBAL.db_close();
            
            if (err) {
                returnUtil.generateReturn(null, 200, null, 999, null, req, res);
            }
            else if(json) {
                
                if(info.DBox.Query.password == GLOBAL.decrypter(GLOBAL.getString(json.password))){
                    returnUtil.generateReturn(null, 100, {authenticated: true}, 15, null, req, res);
                }else{
                    returnUtil.generateReturn(null, 300, {authenticated: false}, 15, null, req, res);
                }
                
            }
            else{
                error(req, res);
            }
        }
    );
    
}
// ======================================= =======================================  
// EXIST PARENTAL CONTROL
// ======================================= ======================================= 

exports.exist = function(req, res, device){
    
    if(!device){
        error(req, res);
        return null;
    }
    
    GLOBAL.db_open();
    
    ParentalControl.findOne({ "device" : device._id })
    .exec(
        function (err, json) {
            GLOBAL.db_close();
            
            if (err) {
                returnUtil.generateReturn(null, 200, null, 999, null, req, res);
            }
            else {
                if(json){
                    returnUtil.generateReturn(null, 100, {exist: true}, 15, null, req, res);
                }else{
                    returnUtil.generateReturn(null, 100, {exist: false}, 15, null, req, res);
                }
            }
        }
    );
}

// ======================================= =======================================  
// ERROR
// ======================================= ======================================= 

var error = function(req, res){
    
    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
};