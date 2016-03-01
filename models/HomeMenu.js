var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var HomeMenuSchema = new Schema({
    title: String,
    description: String,
    nexturl: String,
    order: Number,
    country: String,
    submenu: Boolean,
    status: Boolean,
    registration: String
});

mongoose.model('HomeMenu', HomeMenuSchema);