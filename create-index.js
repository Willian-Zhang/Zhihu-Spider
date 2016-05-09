var MongoClient = require('mongodb').MongoClient
    ,co = require('co')
    ,dbConfig = require('./database.config.js')
    
function* main(){
    try {
        var db = yield MongoClient.connect(`mongodb://${dbConfig.address}:${dbConfig.port}/${dbConfig.dbname}`);
        var collection = db.collection('users');
        console.time('creat index');
        yield collection.createIndex({avatarUrl:1});
        yield collection.createIndex({username:1});
        console.timeEnd("creat index");
        yield db.close();
    } catch (err) {
        console.error(err.message); // "boom" 
    }   
}

co(main);