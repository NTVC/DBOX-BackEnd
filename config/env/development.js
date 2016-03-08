var port = 1024;
var serverip =  '127.0.0.1';

module.exports = {
    version: "1.0.1",
    port: port,
    serverip: serverip,
    wsDash: 'http://192.168.1.102:3002/log',
    db: 'mongodb://localhost:27017/dbox',
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