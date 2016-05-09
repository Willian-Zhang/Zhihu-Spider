var MongoClient = require('mongodb').MongoClient
    ,co = require('co')
    ,dbConfig = require('./database.config.js')
    
function* main(){
    try {
        var db = yield MongoClient.connect(`mongodb://${dbConfig.address}:${dbConfig.port}/${dbConfig.dbname}`);
        var collection = db.collection('users');
        var result;
        console.time('creat index');
        var result = yield collection.createIndex({avatarUrl:1});
        console.log(result);
        var result = yield collection.createIndex({username:1},{unique:true});
        console.log(result);
        console.timeEnd("creat index");
        yield db.close();
    } catch (err) {
        console.error(err.message); // "boom" 
    }   
}

co(main);