var port = 3000;
var serverip =  'localhost';

module.exports = {
    version: "1.0.1",
    port: port,
    serverip: serverip,
    wsDash: 'http://192.168.1.102:3002/log',
    db: 'mongodb://192.168.1.102:27017/dbox',
    algorithm: 'aes-256-cbc',
    password:       'd41d8cd98f00b204e9800998ecf8427e',
    passwordJson:   '8c83eaf2790dd0f6729709815e0f11f8',
    passwordDash:   '0a1577439e744868c74904c214c1582a',
    passwordAkamai: '57A360C2FDE2101E35274EE082816CDF',
    server: {
        socketOptions: {
            connectTimeoutMS: 500
        }
    }

};