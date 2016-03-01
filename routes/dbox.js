var StringDecoder = require('string_decoder').StringDecoder;

var encryptUtil = require('../util/EncryptUtil');
var validateUtil = require('../util/ValidateUtil');
var autenticateUtil = require('../util/AutenticateUtil');
var returnUtil = require('../util/ReturnUtil');

var DBoxController = require('../controllers/DBoxController');

module.exports = function (app) {
   
    // ======================================= =======================================  
    // GET REQUEST
    // ======================================= ======================================= 
    app.get('/dbox', function (req, res) {
        
        if(GLOBAL.environment == "production"){
            returnUtil.generateReturn(null, 101, null, 999, null, req, res);
        }
        else{
            
            // IT WILL WORK ONLY DEVELOPMENT AND HOMOLOGATION ENVIRONMENT
            var testJson = { DBox : { 
                Query : { 'nexturl': req.query.next }, 
                Customer: {firstname:"Everton", mail: "emattos@ntvc.tv", address : { country: 'CA' }},
                Device: {"_id":"564253ec94f2adc80eb29bfc","registration":"2015-11-10T20:30:36.281Z","status":true,"uid":"4f2064bfc195dbd3","version_code":"563bbc6afc6457c801c73921","model_number":"D-BoxD110","ethMac":"78:44:76:f5:d4:fd","wMac":"04:e6:76:75:42:28","__v":0,"log":[],"customer":{"name":"Everto mattos","id":"564229663ace4c600da7ccd9"}}
            } };
            
            DBoxController.mainFlow(req, res, testJson);
            
        }
        
    });
    
    // ======================================= =======================================  
    // GET BODY
    // ======================================= ======================================= 
    app.post('/dbox', function (req, res) {
        
        var decryptedJson;
        var encryptedText;

        try {

            var decoder = new StringDecoder('utf8');    
            var txt = null;
            
            try{
                //VALUES COMES FROM FORM DATA
                if(GLOBAL.getString(req.body.data) != "")
                {
                    txt = req.body.data; 
                }
                // IT COMES FROM QUERY
                else{
                    txt = req.query.data;
                }
            }
            catch(ex){
                txt = req.query.data;
            }
            
            var textChunk = decoder.write(txt);
            encryptedText = textChunk;
            
            try{
                
                encryptUtil.decrypt(function uncompress(decryptCallback, decryptedJsonReturn) {
                    if (decryptCallback == null) {
                        decryptedJson = decryptedJsonReturn;
                        validateFields(req, res, decryptedJson);
                    } else {
                        returnUtil.generateReturn(null, 600, null, null, null, req, res);
                    }
                }, encryptedText);
                
            }
            catch(ex){
                
                returnUtil.generateReturn(null, 600, null, null, null, req, res);
            }

        }
        catch (ex) {
            error(req, res, ex);
        }

    });
    
    // ======================================= =======================================  
    // VALIDATE FIELDS
    // ======================================= =======================================
    var validateFields = function (req, res, decryptedJson) {
        
        try {

            validateUtil.validateDboxTag(function uncompress(validateCallback) {
                if (validateCallback == null) {
                    authenticateBox(req, res, decryptedJson);
                } else {
                    res.json(validateCallback);
                }
            }, decryptedJson);

        }
        catch (ex) {
            error(req, res, ex);
        }

    };
    
    // ======================================= =======================================  
    // AUTHENTICATE BOX
    // ======================================= ======================================= 
    var authenticateBox = function (req, res, decryptedJson) {
        
        try {
            autenticateUtil.autenticateBox(function(box) {
                decryptedJson.DBox.Device = box;
                customer(req, res, decryptedJson);

            }, decryptedJson.DBox, req, res);
        }
        catch (ex) {
            error(req, res, ex);
        }

    };
    // ======================================= =======================================  
    // GET CUSTOMER
    // ======================================= ======================================= 
    var customer =  function (req, res, decryptedJson) {
        
        try {

            if (decryptedJson.DBox.Device.customer.id) {

                require('../controllers/CustomerController').findOne(decryptedJson.DBox.Device.customer.id, function (data) {

                    if (data) {
                        decryptedJson.DBox.Customer = data;
                    }

                    mainFlow(req, res, decryptedJson);

                }, req, res);
            }
            else {
                mainFlow(req, res, decryptedJson);
            }
        
        }
        catch (ex) {
            error(req, res, ex);
        }

    };

    // ======================================= =======================================  
    // SEND FLOW TO MAIN DBOX CONTROLLER
    // ======================================= ======================================= 
    var mainFlow =  function (req, res, decryptedJson) {
        DBoxController.mainFlow(req, res, decryptedJson);
    };
};

// ======================================= =======================================  
// ERROR MESSAGE
// ======================================= ======================================= 
function error(req, res, ex){
    GLOBAL.log(ex.message, ex.stack);
    returnUtil.generateReturn(null, 101, null, 999, null, req, res);
}