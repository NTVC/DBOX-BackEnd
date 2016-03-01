/**
 * Created by thiagosilva on 15-09-05.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Admin = GLOBAL.mongoose.model('Admin');

module.exports = function () {

    passport.use(new LocalStrategy(
        function (username, password, done) {
            
            GLOBAL.db_open();

            Admin.findOne({username: username}, function (err, admin) {
                if (err) {
                    return done(err);
                }
                if (!admin) {
                    return done(null, false, {message: 'Incorrect username.'});
                }
                if (!admin.authenticate(password)) {
                    return done(null, false, {message: 'Incorrect password.'});
                }
                if (admin.status == false ) {
                    return done(null, false, {message: 'Admin disabled.'});
                }
                return done(null, admin);
            });
            
            GLOBAL.db_close();
        }
    ));
};