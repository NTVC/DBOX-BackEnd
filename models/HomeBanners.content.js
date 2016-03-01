var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

require(__dirname + '/HomeBanners');

var homeBannersListShema = new Schema({
    
    homebanners_id: {type: Schema.ObjectId, ref: 'HomeBannersSchema'},
    banner: String,
    invoke: String,
    parameter: String,
    order: Number,
    registration: String,
    status: Boolean
});
mongoose.model('HomeBannersContent', homeBannersListShema);