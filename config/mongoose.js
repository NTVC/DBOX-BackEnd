
GLOBAL.mongoose = require('mongoose');

//CLOSE CONNECTION WITH MONGODB
var db_close = function () {
    var db = GLOBAL.mongoose;
    
    if (db.connection.readyState == 1) {
        try { db.close(); } catch (ex) { }
    }
};

//OPEN CONNECTION WITH MONGODB
var db_open = function () {
    var config = require('./config');
    var db = GLOBAL.mongoose;
    
    if (db.connection.readyState == 0) {
        try { db.open(); } catch (ex) { }
        GLOBAL.mongoose = db.connect(config.db);
    }
    else if (db.connection.readyState == 2) {
        try { db.open(); } catch (ex) { }
        GLOBAL.mongoose = db.connection.open();
    }

    return GLOBAL.mongoose;
};

GLOBAL.db_open = db_open;
GLOBAL.db_close = db_close;