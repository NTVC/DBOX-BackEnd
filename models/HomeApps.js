var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var HomeAppsSchema = new Schema({
    key: String,
    name: String,
    thumb: String,
    order: Number,
    country: String,
    intent: {
        type: [String],
        trim: true,
        index: true
    },
    status: Boolean,
    description: String,
    registration: String
});

mongoose.model('HomeApps', HomeAppsSchema);