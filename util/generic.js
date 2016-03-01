/* global obj */

var config = require('../config/config');
var CryptoJS = require('crypto-js');
var path = require('path');
var fs = require('fs'); 

// RETURN NAME OF THE COUNTRY, BUT REQUIRED ID AND JSON LIST WITH ALL COUNTRIES
GLOBAL.findCountry = function (code, countries) { var country = null; for (var i = 0; i < countries.length; i++) { if (countries[i].code == code) { country = countries[i].name; break; } } return country; }
// RETURN ID OF THE COUNTRY, BUT REQUIRED ID AND JSON LIST WITH ALL COUNTRIES
GLOBAL.findCountryId = function (name, countries) { var country = null; for (var i = 0; i < countries.length; i++) { if (countries[i].name == name) { country = countries[i].code; break; } } return country; }
// RETURN NAME OF THE CATEGORY VIDEO, BUT REQUIRED ID AND JSON LIST WITH ALL CATEGORIES
GLOBAL.findCategory = function (id, categories) { var category = null; for (var i = 0; i < categories.length; i++) { if (categories[i].id == id) { category = categories[i].title; break; } } return category; }
// GET THE JSON IF ALL VIDEO CATEOGRIES
GLOBAL.getCategories = function (params, callback) { var pathCategories = path.join(__dirname, "../public/json/video.category.json"); fs.readFile(pathCategories, 'utf8', function (err, data) { if (err) { params.res.writeHead(200, { "Content-Type": "text/plain" }); params.res.end(App_Message.ERROR_IN_PROCESS); } else { var json = (new Function('return ' + data))(); params.categories = json; callback(params); } }); };
// GET THE JSON IF ALL VIDEO CATEOGRIES
GLOBAL.getCommunityCategories = function (params, callback) { var pathCategories = path.join(__dirname, "../public/json/community.category.json"); fs.readFile(pathCategories, 'utf8', function (err, data) { if (err) { params.res.writeHead(200, { "Content-Type": "text/plain" }); params.res.end;(App_Message.ERROR_IN_PROCESS); } else { var json = (new Function('return ' + data))(); params.categories = json; callback(params); } }); };
// GET THE JSON IF ALL COUNTRIES
GLOBAL.getCountries = function (params, callback) { var fs = require('fs'); var path = require('path');var pathCountries = path.join(__dirname, '../public/json/countries.json');fs.readFile(pathCountries, 'utf8', function (err, data) { if (err) { params.res.writeHead(200, { "Content-Type": "text/plain" }); params.res.end(App_Message.ERROR_IN_PROCESS); } else { var json = (new Function('return ' + data))(); params.countries = json; callback(params); } }); };
// SAVE ANY KIND OF FILE ON THE ESPECIFIC DIRECTORY
GLOBAL.saveFile = function (file, thumbName, path, callback) {
    try {
        var fs = require('fs');
        
        fs.readFile(file.path, function (err, data) {
            
            fs.writeFile((path + thumbName), data, function (err) {
                if (err) {callback(false, null);}
                else{ 
                    
                    GLOBAL.minifyImages((path + thumbName));
                    callback(true, thumbName); 
                }
            });
            
        });
    }
    catch (e){
        callback(false, null);
    }
};
// GET MAC ADDRESS
GLOBAL.getMac = function (callback){require('getmac').getMac(function (err, macAddress) {if (err) { callback(null); }else{ callback(macAddress);}})}
// CREATE DIRECTORY
GLOBAL.createPath = function (path) { var mkdirp = require('mkdirp'); mkdirp(path, function (err) { console.log(err); }); }
// ENCRYPT DATA
GLOBAL.encrypter = function (pass) { return CryptoJS.AES.encrypt(pass, config.password, { mode: CryptoJS.mode.CBC }).toString(); }
// DECRYPT DATA
GLOBAL.decrypter = function (pass) { return CryptoJS.AES.decrypt(pass, config.password, { mode: CryptoJS.mode.CBC }).toString(CryptoJS.enc.Utf8); }
// DELETE FILE, IT DOENS'T CARE THE EXTENSION
GLOBAL.deleteFile = function (filePath) { var fs = require('fs'); try { fs.unlinkSync(filePath); } catch (ex) { } };
// DOWNLOAD FILE FROM THE INTERNET
GLOBAL.download = function (url, dest, cb) { 
    var fs = require('fs'), http = require('http'); 
    try { 
        
        url = url.replace('https:', 'http:'); 
        var file = fs.createWriteStream(dest); 
    
        http.get(url, function (response) { 
            
            response.pipe(file); 
            file.on('finish', function () { 
                file.close(); 
            }); 
            
            GLOBAL.minifyImages(dest);
            cb();
            
        }).on('error', function (err) { 
            
            fs.unlink(dest); 
            if (cb){ cb(err.message); }
            
        }); 
    } catch (e) { 
        console.log(e); 
    } 
}

// MINIFY IMAGE WITH THE EXTENSION .jpg
GLOBAL.minifyImages = function(path) {
    
    try{
        
        if(path.indexOf('.jpg') == -1){
            return;
        }
        
    }catch(ex){
        console.log("error validate jpeg: " + ex.message);
    }
    
    var Imagemin = require('imagemin');
 
    new Imagemin()
    .use(Imagemin.jpegtran({progressive: true}))
	.src(path)
	.run(function (err, files) {
		//console.log(files[0]);
		// => {path: 'build/images/foo.jpg', contents: <Buffer 89 50 4e ...>} 
	});
}

// GENERATE A COMPLEX STRING
GLOBAL.guid = function () { function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); } return String(s4() + s4() + s4() + s4() + s4()); }
// GENERATE AN IMAGE NAME TO IMAGE, IT DOESNT CARE THE EXTENSION
GLOBAL.imageName = function (file) {var path = require('path');var ext = path.extname(file);if (ext.indexOf(".jpg") == -1 && ext.indexOf(".png") == -1) {ext += ".jpg";}return GLOBAL.guid() + ext;}
// CONVERT OBJECT REFERENCED IN AN ARRAY
GLOBAL.getArray = function (obj1, key) {try{if (obj1[key] != undefined) {var y; try { y = JSON.parse(obj1[key]); } catch (e) { y = obj1[key]; } if (y instanceof Array) { return y; } else if (y.indexOf("\r") > -1 || y.indexOf("\n") > -1) {y = replaceAll(' ', '', y);y = replaceAll('\r', '', y); y = replaceAll('\n', '|', y); return y.split("|");} else { return obj1[key].split(','); }} return [];}catch(e){return [];}}
// CONVERT OBJECT REFERENCED IN A STRING
GLOBAL.getString = function (val){ if (val == undefined) { return ""; } if (val == null) { return ""; } else if (val == '') { return ""; } else { return val; }; };
// CONVERT OBJECT REFERENCED IN A NUMBER(INTEGER)
GLOBAL.getNumber = function (val) { if (val == undefined) { return 0; } else if (val == null) { return 0; } else if (isNaN(val)) { return 0; } else { return parseInt(val); } };
// CONVERT OBJECT REFERENCED IN A BOOLEAN
GLOBAL.getBoolean = function (val) {if (val == undefined) { return false; } else if (val == null) { return false; }switch (String(val).toLowerCase().trim()) {case "true": case "yes": case "1":return true;case "false": case "no": case "0": case null: return false;default: return false;}};
// CHECK IF THE STRING REFERENCED IS A VALID OBJECTID (MONGODB)
GLOBAL.isObjectId = function (s){var check = new RegExp("^[0-9a-fA-F]{24}$");return check.test(s);}
// JUST A SUPER REPLACE
GLOBAL.replaceAll = function (find, replace, str) { return str.replace(new RegExp(find, 'g'), replace); }
// ORDERING A ARRAY IN A RANDOM SEQUENCE
GLOBAL.shuffleArray = function(array) {var copy = [], n = array.length, i;while (n) {i = Math.floor(Math.random() * array.length);if (i in array) {copy.push(array[i]);delete array[i];n--;}}return copy;}
// RETURN THE CUSTOMER'S COUNTRY IF IT DOESNT EXIST RETURN DEFAULT COUNTRY
GLOBAL.getCountryFilter = function (customer, total) {var filter = { country: GLOBAL.defaultCountry };if (total != undefined) {if (total == 0) {return filter;}}if (customer) {if (customer.address.country) {filter.country = customer.address.country;return filter;}else {return filter;}} else {return filter;}}
// CONVERT OBJECT REFERENCED IN A JSON STRUCTURE
GLOBAL.getJson = function(obj){try{obj = JSON.stringify(obj);obj = JSON.parse(obj);return obj;}catch(ex){return {};}}
// JUST TO SEND EMAIL OUT SUCH AS ERRORS, RESET PASSWORD AND SO ON
GLOBAL.sendEmail = function(to, from, subject, message){
      
    try{
        if(!to){
            to = "Golive <app@ntvc.tv>";
        }
        if(!from){
            from = "Golive <noreply@ntvc.tv>";
        }
        
        var email   = require("emailjs/email");
        var server  = email.server.connect({
            user:    "app@ntvc.tv", 
            password:"ntvc_123@", 
            host:    "smtp.ntvc.tv", 
            tls: {ciphers: "SSLv3"}
        });
        server.send({
            from:    "Golive - backend <app@ntvc.tv>", 
            to:      to,
            subject: subject,
            attachment: 
            [
                {data:message, alternative:true},
            ]
        }, function(err, message) { 
            if(err){ console.log(err);}
           
        });
    }
    catch(ex){
        
    }
    
}
