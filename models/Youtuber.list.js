var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

require(__dirname + '/Youtuber');

var YoutuberListSchema = new Schema({
    
    youtuber_id: {type: Schema.ObjectId, ref: 'YoutuberSchema'},
    title: {
        type: String,
        trim: true,
    },
    description: String,
    thumb: String,
    status: Boolean,
    registration: String
});
mongoose.model('YoutuberList', YoutuberListSchema);