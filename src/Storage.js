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

function* getUser(username){
    return yield collection.findOne({username: username});
}
function* updateUser(user, updates){
    return yield collection.findOneAndUpdate({username:user.username}, updates);
}
function* insertUser(user){
    return yield collection.insertOne(user);
}