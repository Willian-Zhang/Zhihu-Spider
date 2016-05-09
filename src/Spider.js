import fetchFollwerOrFollwee from './fetchFollwerOrFollwee';
const zhihuAPI = require('zhihu');
import config from '../spider.config';
import co from 'co';
import 'babel-polyfill';
import Promise from 'bluebird';
import Storage from './Storage';
import Queue from 'promise-queue';

var storage;
var SpiderControl;
var event;

var queue = new Queue(config.concurrency, Infinity);

export function Spider(username, overallEvent, database) {
    if(!storage)
        storage = Storage(database);
    if(!SpiderControl)
        SpiderControl  = {
            usernames: new Set(),
            lastDepthJobCount : 0,
            lastDepthJobEnd : 0
        }
    if(!event)
        event = overallEvent;
    console.time('fetch');
    co(SpiderMain(username, 0));
}

var merge = (s1, s2) => s1.concat(s2.filter(ele => !s1.includes(ele)));

var spiderPromiseGenerator = (username, depth) => {
    return co(SpiderMain, username, depth);
}
function* SpiderMain(username, depth) {
    try {
        //console.log(`captureing : ${username}`);
        var notInQueue = !SpiderControl.usernames.has(username);
        if(notInQueue){
            SpiderControl.usernames.add(username);
        }else{
            detectIfLastOne();
            return null;
        }
        
        var user;

        var userFromDB = yield storage.getUser(username);

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
            event.emit('notice', `獲取用户信息成功(from DB): ${username}`);
            event.emit('get user', user);
        }else{
            //======抓取目标用户信息======//
            //username -> user{id, name, ...(see zhihu api)}
            user = yield zhihuAPI.User.getUserByName(username).catch(
                (e)=>zhihuAPI.User.getUserByName(username).catch(
                    (e)=>{
                        event.emit('error', `抓取用户信息失敗: ${username}, QAQ`);
                        return null;
                    }
                )
            );
            event.emit('notice', `獲取用户信息成功(from Web): ${username}`);
            event.emit('get user', user);
        }

        if(!user){
            event.emit('error', `抓取用户信息失敗: ${username}, 用戶名正確嗎？`);
        }

        // save user TODO
        if(shouldSave && user){
            var dbUser = formDBUser(user, username);
            if(isUpdate){
                yield storage.updateUser(user, {$set: dbUser});
            }else{
                yield storage.insertUser(dbUser);
            }
        }
    }catch(e){
        event.emit('error', err);
        detectIfLastOne();
    }
    try{
        if(depth >= config.depth){
            detectIfLastOne();
            // should grep next level
            return user;
        }
        if(user == null){
            return;
        }


        //======抓下一層======//
        //抓取目标用户好友列表
        //user -> [ friend-username ]
        var friends;
        if(isUpdate){
            friends = yield getFriendsFromWeb(user);
        }else{
            friends = yield getFriends(user);
        }
        if(depth == config.depth-1){
            SpiderControl.lastDepthJobEnd += friends.length;
        }

        //[ friend ] => ??
        friends.map(friend => () => spiderPromiseGenerator(friend, depth+1) ).map(gen => queue.add(gen));

        return ;


        // event.emit('data', myFriends.map(friend => ({
        //     "user": friend,
        //     "sameFriends": []
        // })));


        //======找出相同好友======//
        // var result = yield Promise.map(myFriends,
        //     myFriend => searchSameFriend(myFriend, myFriends),
        //     { concurrency: config.concurrency }
        // );
        // event.emit('data', result);

    } catch (err) {
        event.emit('error', err);
    }
}
function detectIfLastOne(){
    SpiderControl.lastDepthJobCount++;
    if(SpiderControl.lastDepthJobCount == SpiderControl.lastDepthJobEnd){
        // THE END
        event.emit('notice', `capture ended with last level counting: ${SpiderControl.lastDepthJobCount}`);
        event.emit('finish', SpiderControl.lastDepthJobCount);
        console.timeEnd('fetch');
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

var formDBUser = (user, username) => {
    user.updateTime = now();
    user.username = username;
    return user;
}

function* getFriends(user){
    if(user.followers){
        event.emit('info', `${user.name} 的好友不用抓取`);
        return user.followers;
        //return merge(user.followers, user.followees);
    }
    return yield getFriendsFromWeb(user);
}

function* getFriendsFromWeb(user) {
    var works = yield [
        fetchFollwerOrFollwee({
            user: user
        }, event),
        // fetchFollwerOrFollwee({
        //     isFollowees: true,
        //     user: user
        // }, event),
    ];

    var followers = works[0].map(f=>f.username);
    // var followees = works[1].map(f=>f.username);

    yield storage.updateUser(user, {$set: {followers: followers}});
    return followers;
    // yield storage.updateUser(user, {$set: {followers: followers, followees: followees}});
    //
    // var friends = merge(followers,followees);
    // return friends;
}

// not used
// function searchSameFriend(aFriend, myFriends) {
//     event.emit("notice", "searchSameFriend with " + aFriend.name + "......");
//     console.log("searchSameFriend with " + aFriend.name + "......");
//     return getFriends(aFriend)
//         .then(targetFriends => {
//             var sameFriends = [];
//             console.log('counting for ' + aFriend.name + '......')
//             targetFriends.forEach(targetFriend => {
//                 myFriends.forEach(myFriend => {
//                     if (targetFriend.hash_id === myFriend.hash_id) {
//                         sameFriends.push(targetFriend);
//                     }
//                 })
//             })
//             console.log("\n\n==============\n Same Friends with " + aFriend.name + "\n");
//             event.emit('same friend', {
//                 hash_id: aFriend.hash_id,
//                 sameFriends: sameFriends
//             })
//             console.log(sameFriends);
//             console.log("\n\n");

//             return {
//                 user: aFriend,
//                 sameFriends: sameFriends
//             };
//         })
// }
