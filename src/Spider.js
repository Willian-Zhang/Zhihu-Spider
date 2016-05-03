import fetchFollwerOrFollwee from './fetchFollwerOrFollwee';
import getUser from './getUser';
import config from '../spider.config';
import co from 'co';
import dbConfig from '../database.config.js';
import 'babel-polyfill';
import Promise from 'bluebird';

var collection;
export function Spider(userPageUrl, socket, database) {
    if(!collection){
        collection = database.collection(dbConfig.collection);
    }
    co(SpiderMain(userPageUrl, socket, 0));
}


function* SpiderMain(userPageUrl, socket, depth) {
    try {
        var user;
        
        var userFromDB = yield getUserFromDB(userPageUrl);
        
        var isUpdate, isFromDB;
        if(userFromDB){
            isUpdate = shouldUpdate(userFromDB)
            isFromDB = !isUpdate;
        }else{
            isUpdate = isFromDB = false;
        }
        
        if( isFromDB ){
            user = userFromDB;
        }else{
            //======抓取目标用户信息======//
            //URL -> user{id, name, followerAmount, followeeAmount}
            user = yield getUser(userPageUrl);
            socket.emit('notice', '抓取用户信息成功');
            socket.emit('get user', user);
        }
        

        // should grep next level
        if(depth >= config.depth){
            return user;
        }
        // save user TODO
        var dbUser = formDBUser(user, userPageUrl);
        if(isUpdate){
            yield updateUserToDB(user, {$set: dbUser});
        }else{
            yield insertUserToDB(dbUser);
        }
        
        //======抓下一層======//
        //抓取目标用户好友列表
        //user -> [ friend{id, name, url}... ]
        var friends;
        if(isUpdate){
            friends = yield getFriendsFromWeb(user, socket);
        }else{
            friends = yield getFriends(user, socket);
        }
        
        //[ friend ] => [ user | grep mission ]
        return yield Promise.map(friends,
            friend => SpiderMain(friend.url, socket, depth+1),
            { concurrency: config.concurrency }
        )
        // socket.emit('data', myFriends.map(friend => ({
        //     "user": friend,
        //     "sameFriends": []
        // })));
        
        
        
        
        //======找出相同好友======//
        // var result = yield Promise.map(myFriends,
        //     myFriend => searchSameFriend(myFriend, myFriends, socket),
        //     { concurrency: config.concurrency }
        // );
        // socket.emit('data', result);

    } catch (err) {
        socket.emit('notice', err);
        console.log(err);
    }
}

// in milliseconds
function now(){
    return (new Date()).getTime();
}
function needsUpdateTime(){
    return now() - config.updateThreshold * 1000;
}
//var needsUpdateTime =  now() - config.updateThreshold * 1000;
function shouldUpdate(user){
    return user.updateTime < needsUpdateTime();
}

var formDBUser = (user, url) => {
    user._id = user.hash_id;
    delete user.hash_id;
    user.updateTime = now();
    user.url = url;
    return user;
}

function* getUserFromDB(url){
    return yield collection.findOne({url: url});
}
function* updateUserToDB(user, updates){
    return yield collection.findOneAndUpdate({_id:user.hash_id}, updates);
}
function* insertUserToDB(user){
    return yield collection.insertOne(user);
}

function* getFriends(user, socket){
    if(user.followers){
        return user.followers.concat(user.followees);
    }
    return yield getFriendsFromWeb(user, socket);
}

function* getFriendsFromWeb(user, socket) {
    if (!socket) {
        socket = {
            emit: () => {}
        };
    }
    var works = yield [   
        fetchFollwerOrFollwee({
            isFollowees: true,
            user: user
        }, socket),
        fetchFollwerOrFollwee({
            user: user
        }, socket)
    ];
    
    var followees = works[0];
    var followers = works[1];
    
    yield updateUserToDB(user, {$set: {followers: followers, followees: followees}});
    
    var friends = followers.map(follower => followees.filter(followee => follower.hash_id === followee.hash_id));
    return friends;
}

function searchSameFriend(aFriend, myFriends, socket) {
    if (!socket) {
        socket = {
            emit: () => {}
        };
    }
    socket.emit("notice", "searchSameFriend with " + aFriend.name + "......");
    console.log("searchSameFriend with " + aFriend.name + "......");
    return getFriends(aFriend, socket)
        .then(targetFriends => {
            var sameFriends = [];
            console.log('counting for ' + aFriend.name + '......')
            targetFriends.forEach(targetFriend => {
                myFriends.forEach(myFriend => {
                    if (targetFriend.hash_id === myFriend.hash_id) {
                        sameFriends.push(targetFriend);
                    }
                })
            })
            console.log("\n\n==============\n Same Friends with " + aFriend.name + "\n");
            socket.emit('same friend', {
                hash_id: aFriend.hash_id,
                sameFriends: sameFriends
            })
            console.log(sameFriends);
            console.log("\n\n");

            return {
                user: aFriend,
                sameFriends: sameFriends
            };
        })
}
