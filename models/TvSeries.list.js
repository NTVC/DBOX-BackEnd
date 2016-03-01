var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

require(__dirname + '/TvSeries');

var TvSeriesListSchema = new Schema({
    
    tvserie_id: {type: Schema.ObjectId, ref: 'TvSeriesSchema'},
    title: {
        type: String,
        trim: true,
    },
    description: String,
    thumb: String,
    status: Boolean,
    registration: String
});
mongoose.model('TvSeriesList', TvSeriesListSchema);