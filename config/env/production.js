var port = 3000;
var serverip = '104.243.43.245';

module.exports = {
    version: "1.0.1",
    port: port,
    serverip: serverip,
    wsDash: 'http://104.243.43.245:3001',
    db: 'mongodb://ntvcdbadm:ntvc_dbadm@dataserver.ntvc.tv:27017/dbox',
    algorithm: 'aes-256-cbc',
    password:       'd41d8cd98f00b204e9800998ecf8427e',
    passwordJson:   '8c83eaf2790dd0f6729709815e0f11f8',
    passwordDash:   '0a1577439e744868c74904c214c1582a',
    passwordAkamai: 'akab-64yhmco2bmlbj5fh-4gw75hfnnhdi237v',
    server: {
        socketOptions: {
            connectTimeoutMS: 500
        }
    }
};