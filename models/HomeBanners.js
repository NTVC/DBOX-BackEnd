var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var HomeBannersSchema = new Schema({
    title: String,
    description: String,
    order: Number,
    timer: Number,
    country: String,
    status: Boolean,
    registration: String
});

mongoose.model('HomeBanners', HomeBannersSchema);
