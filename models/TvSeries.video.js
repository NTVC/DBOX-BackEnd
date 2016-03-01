var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

require(__dirname + '/TvSeries');
require(__dirname + '/TvSeries.list');

var TvSeriesVideoSchema = new Schema({
   
    tvserie_id: {type: Schema.ObjectId, ref: 'TvSeriesSchema'},
    tvserie_list_id: {type: Schema.ObjectId, ref: 'TvSeriesListSchema'},
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

mongoose.model('TvSeriesVideo', TvSeriesVideoSchema);
