import fetchFollwerOrFollwee from './fetchFollwerOrFollwee';
import getUser from './getUser';
import config from '../spider.config';
import co from 'co';
import 'babel-polyfill';
import Promise from 'bluebird';
import Storage from './Storage';
import Queue from 'promise-queue';

var storage;
var SpiderControl = {
    urls: new Set(),
    lastDepthJobCount : 0,
    lastDepthJobEnd : 0
}

var queue = new Queue(config.concurrency, Infinity);

export function Spider(userPageUrl, socket, database) {
    if(!storage)
        storage = Storage(database);
    co(SpiderMain(userPageUrl, socket, 0));
}

var merge = (s1, s2) => s1.concat(s2.filter(ele => !s1.includes(ele)));

var spiderPromiseGenerator = (userPageUrl, socket, depth) => {
    return co(SpiderMain,userPageUrl, socket, depth);
}
function* SpiderMain(userPageUrl, socket, depth) {
    try {
        //console.log(`captureing : ${userPageUrl}`);
        if(SpiderControl.urls.has(userPageUrl)){
            return
        }else{
            SpiderControl.urls.add(userPageUrl);
        }
        
        var user;
        
        var userFromDB = yield storage.getUser(userPageUrl);
        
        var isUpdate, isFromDB, shouldSave;
        if(userFromDB){
            shouldSave = isUpdate = shouldUpdate(userFromDB)
            isFromDB = !isUpdate;
        }else{
            isUpdate = isFromDB = false;
            shouldSave = true;
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
        if(shouldSave){
            var dbUser = formDBUser(user, userPageUrl);
            if(isUpdate){
                yield storage.updateUser(user, {$set: dbUser});
            }else{
                yield storage.insertUser(dbUser);
            }
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
        
        //[ friend ] => ??
        friends.map(friend => () => spiderPromiseGenerator(friend, socket, depth+1) ).map(gen => queue.add(gen));

        return ;
        
        
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
    user.updateTime = now();
    user.url = url;
    return user;
}

function* getFriends(user, socket){
    if(user.followers){
        return merge(user.followers, user.followees);
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
    
    var followees = works[0].map(f=>f.url);
    var followers = works[1].map(f=>f.url);
    
    yield storage.updateUser(user, {$set: {followers: followers, followees: followees}});
    
    var friends = merge(followers,followees);
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
