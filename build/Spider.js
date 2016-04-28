'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Spider = Spider;

var _fetchFollwerOrFollwee = require('./fetchFollwerOrFollwee');

var _fetchFollwerOrFollwee2 = _interopRequireDefault(_fetchFollwerOrFollwee);

var _getUser = require('./getUser');

var _getUser2 = _interopRequireDefault(_getUser);

var _spider = require('../spider.config');

var _spider2 = _interopRequireDefault(_spider);

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _databaseConfig = require('../database.config.js');

var _databaseConfig2 = _interopRequireDefault(_databaseConfig);

require('babel-polyfill');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [SpiderMain, fetchFromDB].map(regeneratorRuntime.mark);

var db;
function Spider(userPageUrl, socket, database) {
    if (!db) {
        db = database;
    }
    (0, _co2.default)(SpiderMain(userPageUrl, socket));
}

function SpiderMain(userPageUrl, socket) {
    var depthNow, user, myFriendsTmp, myFriends, result;
    return regeneratorRuntime.wrap(function SpiderMain$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.prev = 0;
                    depthNow = 0;
                    //======抓取目标用户信息======//

                    _context.next = 4;
                    return (0, _getUser2.default)(userPageUrl);

                case 4:
                    user = _context.sent;

                    socket.emit('notice', '抓取用户信息成功');
                    socket.emit('get user', user);

                    //======抓取目标用户好友列表======//
                    _context.next = 9;
                    return getFriends(user, socket);

                case 9:
                    myFriendsTmp = _context.sent;
                    _context.next = 12;
                    return _bluebird2.default.map(myFriendsTmp, function (myFriend) {
                        return (0, _getUser2.default)(myFriend.url);
                    }, { concurrency: _spider2.default.concurrency ? _spider2.default.concurrency : 3 });

                case 12:
                    myFriends = _context.sent;

                    socket.emit('data', myFriends.map(function (friend) {
                        return {
                            "user": friend,
                            "sameFriends": []
                        };
                    }));

                    //======找出相同好友======//
                    _context.next = 16;
                    return _bluebird2.default.map(myFriends, function (myFriend) {
                        return searchSameFriend(myFriend, myFriends, socket);
                    }, { concurrency: _spider2.default.concurrency ? _spider2.default.concurrency : 3 });

                case 16:
                    result = _context.sent;

                    socket.emit('data', result);

                    _context.next = 24;
                    break;

                case 20:
                    _context.prev = 20;
                    _context.t0 = _context['catch'](0);

                    socket.emit('notice', _context.t0);
                    console.log(_context.t0);

                case 24:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked[0], this, [[0, 20]]);
}

// in milliseconds
function now() {
    return new Date().getTime();
}
function needsUpdateTime() {
    return now() - _spider2.default.updateThreshold * 1000;
}
//var needsUpdateTime =  now() - config.updateThreshold * 1000;

function fetchFromDB(url) {
    return regeneratorRuntime.wrap(function fetchFromDB$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    return _context2.abrupt('return', db.collection(_databaseConfig2.default.collection).findOne({ url: url }));

                case 1:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked[1], this);
};

function getFriends(user, socket) {
    if (!socket) {
        socket = {
            emit: function emit() {}
        };
    }
    var works = [(0, _fetchFollwerOrFollwee2.default)({
        isFollowees: true,
        user: user
    }, socket), (0, _fetchFollwerOrFollwee2.default)({
        user: user
    }, socket)];
    return _bluebird2.default.all(works).then(function (result) {
        var followees = result[0];
        var followers = result[1];
        var friends = [];
        followers.forEach(function (follower) {
            followees.forEach(function (followee) {
                if (follower.hash_id === followee.hash_id) {
                    friends.push(follower);
                }
            });
        });
        return friends;
    });
}

function searchSameFriend(aFriend, myFriends, socket) {
    if (!socket) {
        socket = {
            emit: function emit() {}
        };
    }
    socket.emit("notice", "searchSameFriend with " + aFriend.name + "......");
    console.log("searchSameFriend with " + aFriend.name + "......");
    return getFriends(aFriend, socket).then(function (targetFriends) {
        var sameFriends = [];
        console.log('counting for ' + aFriend.name + '......');
        targetFriends.forEach(function (targetFriend) {
            myFriends.forEach(function (myFriend) {
                if (targetFriend.hash_id === myFriend.hash_id) {
                    sameFriends.push(targetFriend);
                }
            });
        });
        console.log("\n\n==============\n Same Friends with " + aFriend.name + "\n");
        socket.emit('same friend', {
            hash_id: aFriend.hash_id,
            sameFriends: sameFriends
        });
        console.log(sameFriends);
        console.log("\n\n");

        return {
            user: aFriend,
            sameFriends: sameFriends
        };
    });
}