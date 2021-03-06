var mongoose = GLOBAL.mongoose,
    Schema = mongoose.Schema;

var TvSeriesSchema = new Schema({
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
    status: Boolean,
    language: {
        type: [String],
        trim: true,
        index: true
    },
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
mongoose.model('TvSeries', TvSeriesSchema);