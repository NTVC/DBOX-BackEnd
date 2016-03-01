var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var HomeWidgetsSchema = new Schema({
    name: String,
    html: String,
    order: Number,
    country: String,
    status: Boolean,
    registration: String
});

mongoose.model('HomeWidgets', HomeWidgetsSchema);