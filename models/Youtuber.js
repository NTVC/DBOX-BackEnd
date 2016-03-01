var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var YoutuberSchema = new Schema({
    title: {
        type: String,
        trim: true,
        index: true
    },
    thumb: String,
    cover: String,
    description: String,
    background: String,
    country: String,
    language: {
        type: [String],
        trim: true,
        index: true
    },
    status: Boolean,
    category: {
        type: [Number],
        trim: true,
        index: true
    },
    tags: {
        type: [String],
        trim: true,
        index: true
    },
    video_counter: Number,
    registration: String
});

mongoose.model('Youtuber', YoutuberSchema);