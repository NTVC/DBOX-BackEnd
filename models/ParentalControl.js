var mongoose    = GLOBAL.mongoose;
var Schema      = mongoose.Schema;

require(__dirname + '/Device');

require(__dirname + '/HomeApps');
require(__dirname + '/Live');
require(__dirname + '/Movie');
require(__dirname + '/Community');
require(__dirname + '/TvSeries');
require(__dirname + '/Youtuber');

var ParentalControlSchema = new Schema({
    
    device:         {type: Schema.ObjectId, ref: 'DeviceSchema', index: true},
    password:       {type: String, index: true},
    
    apps: {
        isBlocked: Boolean,
        objects: {type: [Schema.ObjectId], ref: 'HomeAppsSchema'}
    },
    lives: {
        isBlocked: Boolean,
        objects: {type: [Schema.ObjectId], ref: 'LiveSchema'}
    },
    movies: {
        isBlocked: Boolean,
        objects: {type: [Schema.ObjectId], ref: 'MovieSchema'}
    },
    communities: {
        isBlocked: Boolean,
        objects: {type: [Schema.ObjectId], ref: 'CommunitySchema'}
    },
    tvseries: {
        isBlocked: Boolean,
        objects: {type: [Schema.ObjectId], ref: 'TvSeriesSchema'}
    },
    youtubers: {
        isBlocked: Boolean,
        objects: {type: [Schema.ObjectId], ref: 'YoutuberSchema'}
    },
    
    status:         Boolean,
    registration:   String,
    update:         String
    
});

mongoose.model('ParentalControl', ParentalControlSchema);