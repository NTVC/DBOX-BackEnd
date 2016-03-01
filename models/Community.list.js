var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

require(__dirname + '/Community');

var communityListShema = new Schema({
    
    community_id: {type: Schema.ObjectId, ref: 'communitySchema'},
    title: {
        type: String,
        trim: true,
    },
    description: String,
    thumb: String,
    status: Boolean,
    registration: String
});
mongoose.model('CommunityList', communityListShema);