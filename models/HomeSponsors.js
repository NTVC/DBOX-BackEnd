var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var HomeSponsorsSchema = new Schema({
    name: String,
    poster: String,
    url: String,
    order: Number,
    country: String,
    status: Boolean,
    description: String,
    registration: String
});

mongoose.model('HomeSponsors', HomeSponsorsSchema);