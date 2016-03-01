var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

require(__dirname + '/Community');
require(__dirname + '/Community.list');

var communityVideoShema = new Schema({
   
    community_id: {type: Schema.ObjectId, ref: 'communityShema'},
    community_list_id: {type: Schema.ObjectId, ref: 'communityListShema'},
    url: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    year: String,
    status: Boolean,
    registration: String
});

mongoose.model('CommunityVideo', communityVideoShema);