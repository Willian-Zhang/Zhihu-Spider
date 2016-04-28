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

var _marked = [SpiderMain, getUserFromDB, updateUserToDB, insertUserToDB, getFriends, getFriendsFromWeb].map(regeneratorRuntime.mark);

var collection;
function Spider(userPageUrl, socket, database) {
    if (!collection) {
        collection = database.collection(_databaseConfig2.default.collection);
    }
    (0, _co2.default)(SpiderMain(userPageUrl, socket, 0));
}

function SpiderMain(userPageUrl, socket, depth) {
    var user, userFromDB, isUpdate, isFromDB, dbUser, friends;
    return regeneratorRuntime.wrap(function SpiderMain$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.prev = 0;
                    _context.next = 3;
                    return getUserFromDB(userPageUrl);

                case 3:
                    userFromDB = _context.sent;

                    if (userFromDB) {
                        isUpdate = shouldUpdate(userFromDB);
                        isFromDB = !isUpdate;
                    } else {
                        isUpdate = isFromDB = false;
                    }

                    if (!isFromDB) {
                        _context.next = 9;
                        break;
                    }

                    user = userFromDB;
                    _context.next = 14;
                    break;

                case 9:
                    _context.next = 11;
                    return (0, _getUser2.default)(userPageUrl);

                case 11:
                    user = _context.sent;

                    socket.emit('notice', '抓取用户信息成功');
                    socket.emit('get user', user);

                case 14:
                    if (!(depth >= _spider2.default.depth)) {
                        _context.next = 16;
                        break;
                    }

                    return _context.abrupt('return', user);

                case 16:
                    // save user TODO
                    dbUser = formDBUser(user);

                    if (!isUpdate) {
                        _context.next = 22;
                        break;
                    }

                    _context.next = 20;
                    return updateUserToDB(user, { $set: dbUser });

                case 20:
                    _context.next = 24;
                    break;

                case 22:
                    _context.next = 24;
                    return insertUserToDB(dbUser);

                case 24:
                    if (!isUpdate) {
                        _context.next = 30;
                        break;
                    }

                    _context.next = 27;
                    return getFriendsFromWeb(user, socket);

                case 27:
                    friends = _context.sent;
                    _context.next = 33;
                    break;

                case 30:
                    _context.next = 32;
                    return getFriends(user, socket);

                case 32:
                    friends = _context.sent;

                case 33:
                    _context.next = 35;
                    return _bluebird2.default.map(friends, function (friend) {
                        return SpiderMain(friend.url, socket, depth + 1);
                    }, { concurrency: _spider2.default.concurrency });

                case 35:
                    return _context.abrupt('return', _context.sent);

                case 38:
                    _context.prev = 38;
                    _context.t0 = _context['catch'](0);

                    socket.emit('notice', _context.t0);
                    console.log(_context.t0);

                case 42:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked[0], this, [[0, 38]]);
}

// in milliseconds
function now() {
    return new Date().getTime();
}
function needsUpdateTime() {
    return now() - _spider2.default.updateThreshold * 1000;
}
//var needsUpdateTime =  now() - config.updateThreshold * 1000;
function shouldUpdate(user) {
    return user.updateTime < needsUpdateTime();
}

formDBUser = function formDBUser(user) {
    user._id = user.hash_id;
    delete user.hash_id;
    user.updateTime = now();

    return user;
};

function getUserFromDB(url) {
    return regeneratorRuntime.wrap(function getUserFromDB$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.next = 2;
                    return collection.findOne({ url: url });

                case 2:
                    return _context2.abrupt('return', _context2.sent);

                case 3:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked[1], this);
}
function updateUserToDB(user, updates) {
    return regeneratorRuntime.wrap(function updateUserToDB$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.next = 2;
                    return collection.findOneAndUpdate({ _id: user.hash_id }, updates);

                case 2:
                    return _context3.abrupt('return', _context3.sent);

                case 3:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked[2], this);
}
function insertUserToDB(user) {
    return regeneratorRuntime.wrap(function insertUserToDB$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    _context4.next = 2;
                    return collection.insertOne(user);

                case 2:
                    return _context4.abrupt('return', _context4.sent);

                case 3:
                case 'end':
                    return _context4.stop();
            }
        }
    }, _marked[3], this);
}

function getFriends(user, socket) {
    return regeneratorRuntime.wrap(function getFriends$(_context5) {
        while (1) {
            switch (_context5.prev = _context5.next) {
                case 0:
                    if (!user.followers) {
                        _context5.next = 2;
                        break;
                    }

                    return _context5.abrupt('return', user.followers.concat(user.followees));

                case 2:
                    _context5.next = 4;
                    return getFriendsFromWeb(user, socket);

                case 4:
                    return _context5.abrupt('return', _context5.sent);

                case 5:
                case 'end':
                    return _context5.stop();
            }
        }
    }, _marked[4], this);
}

function getFriendsFromWeb(user, socket) {
    var works, followees, followers, friends;
    return regeneratorRuntime.wrap(function getFriendsFromWeb$(_context6) {
        while (1) {
            switch (_context6.prev = _context6.next) {
                case 0:
                    if (!socket) {
                        socket = {
                            emit: function emit() {}
                        };
                    }
                    _context6.next = 3;
                    return [(0, _fetchFollwerOrFollwee2.default)({
                        isFollowees: true,
                        user: user
                    }, socket), (0, _fetchFollwerOrFollwee2.default)({
                        user: user
                    }, socket)];

                case 3:
                    works = _context6.sent;
                    followees = works[0];
                    followers = works[1];
                    _context6.next = 8;
                    return updateUserToDB(user, { $set: { followers: followers, followees: followees } });

                case 8:
                    friends = followers.map(function (follower) {
                        return followees.filter(function (followee) {
                            return follower.hash_id === followee.hash_id;
                        });
                    });
                    return _context6.abrupt('return', friends);

                case 10:
                case 'end':
                    return _context6.stop();
            }
        }
    }, _marked[5], this);
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