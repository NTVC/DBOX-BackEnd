var mongoose = GLOBAL.mongoose,
    Schema = mongoose.Schema;

var LiveShema = new Schema({
    name: {
        type: String,
        trim: true,
        index: true
    },
    description: String,
    country: String,
    url: String,
    thumb: String,
    cover: String,
    active: Boolean,
    diaryprogramation: [{
        programename: String,
        startdate: Date,
        enddate: Date
    }]
});

mongoose.model('Live', LiveShema);