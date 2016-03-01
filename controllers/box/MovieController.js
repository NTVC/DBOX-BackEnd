require('./../../models/Movie');
require('./../../util/generic');

var returnUtil = require('./../../util/ReturnUtil');
var Movie = GLOBAL.mongoose.model('Movie');

// ======================================= =======================================  
// BUILD FILTER LIST ALL
// ======================================= ======================================= 
var listAllFilter = function (params) {

    var filter = 
    ({
        $and : [
            (GLOBAL.isObjectId(params.filter.search) ? { "_id" : params.filter.search } : { "title" : new RegExp(params.filter.search, 'i') }),
            (params.filter.code == '' ? {} : ({ "category" :  params.filter.code })),
            {"active" : true},
        ]
    });
    return filter;
};


// ======================================= =======================================  
// COUNT MOVIES
// ======================================= ======================================= 
var listAllCount = function (params, callback) {
    GLOBAL.db_open();
    
    Movie.find(listAllFilter(params)).count(function (err, total) {
        GLOBAL.db_close();
        callback(String(total));
    });
        
};
// ======================================= =======================================  
// GET ALL MOVIES
// ======================================= ======================================= 
exports.listAll = function (req, res, params) {
    GLOBAL.db_open();
    
    Movie.find(listAllFilter(params))
    .skip(params.filter.pg.index * params.filter.pg.limit)
    .limit(params.filter.pg.limit)
    .exec(
        function (err, movies) {
            GLOBAL.db_close();
            if (!err) {
                
                var json = {};
                json.code = params.filter.code;
                json.title = params.filter.name;
                json.movies = movies;
                
                listAllCount(params, function (total) { 
                    
                    json.total = total;
                    returnUtil.generateReturn(null, 100, JSON.stringify(json), 2, null, req, res);
                })

            }
            else {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(App_Message.ERROR_IN_PROCESS);
            }
        }
    );
};

// ======================================= =======================================  
// GET ACTIVE CATEGORIES OF MOVIES
// ======================================= ======================================= 
exports.getActiveCategories = function (params) {
    
    var returnJson = {nexturl: null, submenu: []};

    GLOBAL.db_open();
    
    Movie.find()
    .where('active').equals(true)
    .distinct('category')
    .exec(
        function (err, movies) {
            GLOBAL.db_close();
            if (err) {
                returnUtil.generateReturn(null, 200, null, null, null, params.req, params.res);
            } 
            else {
                if (movies === null || movies.length === 0) {
                    returnUtil.generateReturn(null, 101, null, null, null, params.req, params.res);
                } 
                else {
                    
                    returnJson.nexturl = 'getmoviebycategory';
                    
                    for (var i = 0; i < movies.length; i++) {
                        returnJson.submenu.push(
                        {
                            code: movies[i], 
                            name: findCategory(movies[i], params.categories)
                        });
                    }

                    returnUtil.generateReturn(null, 100, JSON.stringify(returnJson), 5, null, params.req, params.res);
                }
            }
        }
    );
};

