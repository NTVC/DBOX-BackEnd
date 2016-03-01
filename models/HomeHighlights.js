var mongoose = GLOBAL.mongoose;
var Schema = mongoose.Schema;

var HomeHighlightsSchema = new Schema({
    title: String,
    description: String,
    order: Number,
    /* 
    * SOURCE: RELATED THE JSON FILE >> public/json/homescreen/highlight.source.json 
    * LIST: GET BASIC OBJECT INFO FROM THE SOURCE
    * */
    source: Number,
    country: String,
    list: [{
        id: String,
        title: String,
        /* TYPE_CONTENT: RANDOM = 1 || FIXED = 2 */
        type_content: Number,
        cover: String,
        description: String
    }],
    status: Boolean,
    registration: String
});

mongoose.model('HomeHighlights', HomeHighlightsSchema);