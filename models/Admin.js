var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var AdminSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        index: true
    },
    password: String,
    firstname: String,
    lastname: String,
    phone: String,
    mail: {
        type: String,
        index: true
    },
    status: Boolean,

    superadmin: Boolean,
    live: Boolean,
    movie: Boolean,
    tvseries: Boolean,
    community: Boolean,
    customer: Boolean,
    device: Boolean,
    
    homeapps: Boolean,
    homebackground: Boolean,
    homesponsors: Boolean,
    homesupport: Boolean,
    homebanners: Boolean,
    homehighlights: Boolean,
    homemenu: Boolean,
    homewidgets: Boolean,

});

AdminSchema.methods.authenticate = function (password) {
    
    try {
        // COMPARE PASSWORD FROM INPUT WITH THE PASSWORD OF SCHEMA
        return password === GLOBAL.decrypter(this.password);
    }
    catch (ex) {
        return false;
    }
};

mongoose.model('Admin', AdminSchema);