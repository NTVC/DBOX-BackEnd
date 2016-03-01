var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var HomeSupportSchema = new Schema({
    title: String,
    message: String,
    phone: String,
    email: String,
    country: String,
    status: Boolean,
    registration: String
});

mongoose.model('HomeSupport', HomeSupportSchema);