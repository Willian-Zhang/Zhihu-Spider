import dbConfig from '../database.config.js';

var collection;
export default function Storage(database){
    collection = database.collection(dbConfig.collection);
    return {
        getUser: getUser,
        updateUser: updateUser,
        insertUser: insertUser
    }
}

function* getUser(url){
    return yield collection.findOne({url: url});
}
function* updateUser(user, updates){
    return yield collection.findOneAndUpdate({_id:user.hash_id}, updates);
}
function* insertUser(user){
    return yield collection.insertOne(user);
}