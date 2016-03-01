require('./../models/HomeBanners');
var HomeBanners = GLOBAL.mongoose.model('HomeBanners');
var path = require('path');

exports.process = function (req, res) {
    
    // ---------------------------------------------
    // LIST BANNERS
    if (req.query.list != undefined) {
        
        var params = {};
        
        params.filter = {
            search: req.query.search, 
            status: req.query.status, 
            country: req.query.country, 
            pg: {
                index: req.query.pg_index, 
                limit: req.query.pg_limit
            }
        };

        // COUNT ONLY
        if (req.query.count != undefined) {
            listAllCount(res, params)
        }

        // ALL DATA
        else {
            listAll(res, params)
        }
       
    }

    // ---------------------------------------------
    // SAVE OR UPDATE BANNER
    else if (req.body.save != undefined) {
        save(req, res);
    }
    // ---------------------------------------------
    // SAVE OR UPDATE BANNER
    else if (req.body.save_content != undefined) {
        saveContent(req, res);
    }
    
    // ---------------------------------------------
    // DELETE BANNER BY ID
    else if (req.query.delete != undefined && req.query.id != undefined ) {
        remove(req, res, null, 1);
    }
    // ---------------------------------------------
    // UPDATE ORDER APPS
    else if (req.query.order_banners != undefined && req.query.array != undefined) {
        var array = GLOBAL.getArray(req.query, "array");
        updateOrderBanners(0, array, res);
    }
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.ERROR_IN_PROCESS);
    }
};

// BUILD FILTER LIST ALL
var listAllFilter = function (params) {

    var filter = 
     ({
        $and: [
            (params.filter.search == '' ? {} : ({ "title" : new RegExp(params.filter.search, 'i') })),
            (params.filter.status == '' ? {} : ({ "status" : JSON.parse(params.filter.status) })),
            (params.filter.country == '' ? {} : ({ "country" : params.filter.country }))
        ]
    });

    return filter;
};

// LIST ALL BANNERS ON THE DATABASE
var listAllCount = function (res, params) {
    GLOBAL.db_open();
    
    HomeBanners.find(listAllFilter(params)).count(function (err, total) {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        if (err) {
            res.end(App_Message.ERROR_IN_PROCESS);
        }
        else {
            res.end(String(total));
        }
        GLOBAL.db_close();
    });
        
};

// LIST ALL BANNERS ON THE DATABASE
var listAll = function (res, params) {
    GLOBAL.db_open();

    HomeBanners.find(
        (
          listAllFilter(params))
        )
        .skip(params.filter.pg.index * params.filter.pg.limit)
        .limit(params.filter.pg.limit)
        .sort({ order: 1 })
        .exec(
        function (err, highlights) {
            if (!err) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(highlights));
            }
            else {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            GLOBAL.db_close();
        }
    );
};

// UPDATE AND SAVE BANNER
var save = function (req, res) {
    
    var obj;

    // UPDATE
    if (req.body._id !== undefined) {
        
        obj = getParamsHomeBanners(req, null);

        GLOBAL.db_open();
        
        HomeBanners.findByIdAndUpdate(req.body._id, obj, function (err) {
                
            GLOBAL.db_close();
            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            }
            else {
                res.end(App_Message.SUCESS_IN_PROCESS);
            }
        });

    }
    // SAVE NEW BANNER
    else {

        obj = new HomeBanners();
        obj = getParamsHomeBanners(req, obj);
        
        GLOBAL.db_open();
        
        obj.registration = new Date().toISOString();

        obj.save(function (err) {

            GLOBAL.db_close();
            res.writeHead(200, { "Content-Type": "text/plain" });
            if (err) {
                GLOBAL.log(err, null);
                res.end(App_Message.ERROR_IN_PROCESS);
            } else {
                res.end(App_Message.SUCESS_IN_PROCESS);
            }

        });
    }
}

// REMOVE BANNER FROM DATABASE
var remove = function (req, res, obj, step) {
    
    if(step == 1){
        
        GLOBAL.db_open();
    
        HomeBanners.findOne(({ _id: req.query.id }), function (err, banner) {
            
            HomeBanners.remove({ _id: req.query.id }, function (err) {
                
                GLOBAL.db_close();
            
                if(err){
                    error(res);
                }
                else{
                    var obj = GLOBAL.getJson(banner);
                    remove(req, res, obj, 2);
                }
                
            });
    
        });
    }
    
    // GET ALL CONTENTS
    else if(step == 2){
        
        try{
          
            require('./../models/HomeBanners.content');
            var HomeBannersContent = GLOBAL.mongoose.model('HomeBannersContent');
            
            HomeBannersContent.find({ homebanners_id: req.query.id }, function (err, contents) {
              
                obj.contents = contents;
                remove(req, res, obj, 3);
        
            });
 
        }catch(ex){
            error(res);
        }
    }
    
    // DELETE ALL CONTENTS
    else if(step == 3){
        
        try{ 
            GLOBAL.db_open();
    
            require('./../models/HomeBanners.content');
            var HomeBannersContent = GLOBAL.mongoose.model('HomeBannersContent');
            
            HomeBannersContent.remove({ homebanners_id: req.query.id  }, function (err) {
                GLOBAL.db_close();
                
                if(err){
                    error(res);
                }
                else{
                    remove(req, res, obj, 4);
                }
            });
            
        }catch(ex){
            error(res);
        }
    }
    
    // DELETE BANNERS
    else if(step == 4){
        
        try{ 
            GLOBAL.db_open();
    
            HomeBanners.remove({ _id: req.query.id  }, function (err) {
                GLOBAL.db_close();
                
                if(err){
                    error(res);
                }
                else{
                    remove(req, res, obj, 5);
                }
            });
            
        }catch(ex){
            error(res);
        }
    }
    else{
        
          try {
            
            // DELETE CONTENT BANNER
            if (obj.contents) {
                for (var i = 0; i < obj.contents.length; i++) {
                    if (obj.contents[i].banner) {
                        GLOBAL.deleteFile(GLOBAL.path.SERVER_HOME_BANNER + path.basename(obj.contents[i].banner));
                    }
                }
            }
           
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(App_Message.SUCESS_IN_PROCESS);
            
        } catch (error) {
            error(res);
        }
        
    }
   
}


var error = function(res){
    GLOBAL.log(err, null);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(App_Message.ERROR_IN_PROCESS);
}

// GET PARAMS FROM POST AND BIND AN OBJECT
var getParamsHomeBanners = function(req, obj){
    
    var aux = JSON.parse(JSON.stringify(req.body));
    var _obj;

    if (obj == null)
        _obj = {};
    else
        _obj = obj;
    
    if (aux._id != undefined) {
        _obj._id = aux._id;
    }
    
    _obj.title = GLOBAL.getString(aux.title);
    _obj.description = GLOBAL.getString(aux.description);
    _obj.order = GLOBAL.getNumber(aux.order);
    _obj.timer = GLOBAL.getNumber(aux.timer);
    _obj.country = GLOBAL.getString(aux.country);
    _obj.status = GLOBAL.getBoolean(aux.status);
    _obj.registration = GLOBAL.getString(aux.registration);
    
    return _obj;
}

var updateOrderBanners = function (index, array, res) {
    
    if (index < array.length) {
        
        // VALIDATE IF CONTAINS ID
        if (GLOBAL.getString(array[index]) == "") {
            
            index += 1;
            updateOrderBanners(index, array, res);
        }
        else {
            
            GLOBAL.db_open();
            HomeBanners.update({ _id: array[index] } , { $set: { order : index } } , function (err, item) {
                
                GLOBAL.db_close();
                
                if (err) {
                    error(res);
                }
                else {
                    index += 1;
                    updateOrderBanners(index, array, res);
                }
            });
        }
        
    }
    else {
        
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(App_Message.SUCESS_IN_PROCESS);
    }

}