var mongoose = GLOBAL.mongoose,
    Schema = mongoose.Schema;

var MovieSchema = new Schema({
    active: Boolean,
    title: {
        type: String,
        trim: true,
        index: true
    },
    url: String,
    description: String,
    thumb: String,
    cover: String,
    exibitiondate: Date,
    lenght: String,
    tags: {
        type: [String],
        trim: true,
        index: true
    },
    category: {
        type: [Number],
        trim: true,
        index: true
    },
    language: {
        type: [String],
        trim: true,
        index: true
    },
    year: String,
    rated: String,
    director: String,
    writer: String,
    actors: String,
    country: String,
    awards: String,
    isPublished: {
        type: Boolean,
        default: true
    }
});

mongoose.model('Movie', MovieSchema);