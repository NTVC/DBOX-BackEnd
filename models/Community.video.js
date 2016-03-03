var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

require(__dirname + '/Community');
require(__dirname + '/Community.list');

var communityVideoShema = new Schema({
   
    community_id: {type: Schema.ObjectId, ref: 'communityShema'},
    community_list_id: {type: Schema.ObjectId, ref: 'communityListShema'},
    title: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    isPublished: {
        type: Boolean,
        default: true
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