var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;
var config = require('../config/config');

require(__dirname + '/DeviceVersion');
require(__dirname + '/Customer');

var DeviceSchema = new Schema({

    version_code: {type: Schema.ObjectId, ref: 'DeviceVersionSchema'},
    customer: {
        id: { type: Schema.ObjectId, ref: 'CustomerSchema' },
        name: {type: String}
    },
    ethMac: String,
    wMac: String,
    model_number: String,
    uid: String,
    status: Boolean,
    registration: String,
    log: {
        type: [String],
        trim: true,
        index: true
    }
});

mongoose.model('Device', DeviceSchema);