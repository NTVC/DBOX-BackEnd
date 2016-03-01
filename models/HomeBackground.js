var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var HomeBackgroundSchema = new Schema({
    home: String,
    live: String,
    community: String,
    tvseries: String,
    youtuber: String,
    country: String,
    status: Boolean,
    registration: String
});

mongoose.model('HomeBackground', HomeBackgroundSchema);