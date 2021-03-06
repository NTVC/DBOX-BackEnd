var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

require(__dirname + '/Youtuber');
require(__dirname + '/Youtuber.list');

var youtuberVideoShema = new Schema({
   
    youtuber_id: {type: Schema.ObjectId, ref: 'YoutuberSchema'},
    youtuber_list_id: {type: Schema.ObjectId, ref: 'YoutuberListSchema'},
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

mongoose.model('YoutuberVideo', youtuberVideoShema);