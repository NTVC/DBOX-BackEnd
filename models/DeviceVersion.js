var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var DeviceVersionSchema = new Schema({
    title: String,
    thumb: String,
    description: String,
    registration: String
});

mongoose.model('DeviceVersion', DeviceVersionSchema);