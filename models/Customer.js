var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
    firstname: String,
    lastname: String,
    address: {
        street: String,
        number: String,
        complement: String,
        zipcode: String,
        city: String,
        state: String,
        country: {
            type: String,
            index: true
        }
    },
    phone: String,
    mail: {
        type: String,
        index: true
    },
    language: {
        type: [String],
        trim: true,
        index: true
    },
    registration: String,
    status: Boolean,

    favoriteslive: [Schema.ObjectId],
    favoritesmovie: [Schema.ObjectId],
    favoritestvseries: [Schema.ObjectId],
    favoritescomunity: [Schema.ObjectId]
});

mongoose.model('Customer', CustomerSchema);