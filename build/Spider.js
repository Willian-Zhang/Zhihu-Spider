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
//# sourceMappingURL=data:application/json;base64,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LEdBQVIsQ0FBWSwyQkFBMkIsUUFBUSxJQUFSLEdBQWUsUUFBMUMsQ0FBWixDQVBrRDtBQVFsRCxXQUFPLFdBQVcsT0FBWCxFQUFvQixNQUFwQixFQUNGLElBREUsQ0FDRyx5QkFBaUI7QUFDbkIsWUFBSSxjQUFjLEVBQWQsQ0FEZTtBQUVuQixnQkFBUSxHQUFSLENBQVksa0JBQWtCLFFBQVEsSUFBUixHQUFlLFFBQWpDLENBQVosQ0FGbUI7QUFHbkIsc0JBQWMsT0FBZCxDQUFzQix3QkFBZ0I7QUFDbEMsc0JBQVUsT0FBVixDQUFrQixvQkFBWTtBQUMxQixvQkFBSSxhQUFhLE9BQWIsS0FBeUIsU0FBUyxPQUFULEVBQWtCO0FBQzNDLGdDQUFZLElBQVosQ0FBaUIsWUFBakIsRUFEMkM7aUJBQS9DO2FBRGMsQ0FBbEIsQ0FEa0M7U0FBaEIsQ0FBdEIsQ0FIbUI7QUFVbkIsZ0JBQVEsR0FBUixDQUFZLDRDQUE0QyxRQUFRLElBQVIsR0FBZSxJQUEzRCxDQUFaLENBVm1CO0FBV25CLGVBQU8sSUFBUCxDQUFZLGFBQVosRUFBMkI7QUFDdkIscUJBQVMsUUFBUSxPQUFSO0FBQ1QseUJBQWEsV0FBYjtTQUZKLEVBWG1CO0FBZW5CLGdCQUFRLEdBQVIsQ0FBWSxXQUFaLEVBZm1CO0FBZ0JuQixnQkFBUSxHQUFSLENBQVksTUFBWixFQWhCbUI7O0FBa0JuQixlQUFPO0FBQ0gsa0JBQU0sT0FBTjtBQUNBLHlCQUFhLFdBQWI7U0FGSixDQWxCbUI7S0FBakIsQ0FEVixDQVJrRDtDQUF0RCIsImZpbGUiOiJTcGlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmV0Y2hGb2xsd2VyT3JGb2xsd2VlIGZyb20gJy4vZmV0Y2hGb2xsd2VyT3JGb2xsd2VlJztcbmltcG9ydCBnZXRVc2VyIGZyb20gJy4vZ2V0VXNlcic7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4uL3NwaWRlci5jb25maWcnO1xuaW1wb3J0IGNvIGZyb20gJ2NvJztcbmltcG9ydCBkYkNvbmZpZyBmcm9tICcuLi9kYXRhYmFzZS5jb25maWcuanMnO1xuaW1wb3J0ICdiYWJlbC1wb2x5ZmlsbCc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdibHVlYmlyZCc7XG5cbnZhciBjb2xsZWN0aW9uO1xuZXhwb3J0IGZ1bmN0aW9uIFNwaWRlcih1c2VyUGFnZVVybCwgc29ja2V0LCBkYXRhYmFzZSkge1xuICAgIGlmKCFjb2xsZWN0aW9uKXtcbiAgICAgICAgY29sbGVjdGlvbiA9IGRhdGFiYXNlLmNvbGxlY3Rpb24oZGJDb25maWcuY29sbGVjdGlvbik7XG4gICAgfVxuICAgIGNvKFNwaWRlck1haW4odXNlclBhZ2VVcmwsIHNvY2tldCwgMCkpO1xufVxuXG5cbmZ1bmN0aW9uKiBTcGlkZXJNYWluKHVzZXJQYWdlVXJsLCBzb2NrZXQsIGRlcHRoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHVzZXI7XG4gICAgICAgIFxuICAgICAgICB2YXIgdXNlckZyb21EQiA9IHlpZWxkIGdldFVzZXJGcm9tREIodXNlclBhZ2VVcmwpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGlzVXBkYXRlLCBpc0Zyb21EQjtcbiAgICAgICAgaWYodXNlckZyb21EQil7XG4gICAgICAgICAgICBpc1VwZGF0ZSA9IHNob3VsZFVwZGF0ZSh1c2VyRnJvbURCKVxuICAgICAgICAgICAgaXNGcm9tREIgPSAhaXNVcGRhdGU7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgaXNVcGRhdGUgPSBpc0Zyb21EQiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggaXNGcm9tREIgKXtcbiAgICAgICAgICAgIHVzZXIgPSB1c2VyRnJvbURCO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIC8vPT09PT095oqT5Y+W55uu5qCH55So5oi35L+h5oGvPT09PT09Ly9cbiAgICAgICAgICAgIC8vVVJMIC0+IHVzZXJ7aWQsIG5hbWUsIGZvbGxvd2VyQW1vdW50LCBmb2xsb3dlZUFtb3VudH1cbiAgICAgICAgICAgIHVzZXIgPSB5aWVsZCBnZXRVc2VyKHVzZXJQYWdlVXJsKTtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KCdub3RpY2UnLCAn5oqT5Y+W55So5oi35L+h5oGv5oiQ5YqfJyk7XG4gICAgICAgICAgICBzb2NrZXQuZW1pdCgnZ2V0IHVzZXInLCB1c2VyKTtcbiAgICAgICAgfVxuICAgICAgICBcblxuICAgICAgICAvLyBzaG91bGQgZ3JlcCBuZXh0IGxldmVsXG4gICAgICAgIGlmKGRlcHRoID49IGNvbmZpZy5kZXB0aCl7XG4gICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgfVxuICAgICAgICAvLyBzYXZlIHVzZXIgVE9ET1xuICAgICAgICB2YXIgZGJVc2VyID0gZm9ybURCVXNlcih1c2VyKTtcbiAgICAgICAgaWYoaXNVcGRhdGUpe1xuICAgICAgICAgICAgeWllbGQgdXBkYXRlVXNlclRvREIodXNlciwgeyRzZXQ6IGRiVXNlcn0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHlpZWxkIGluc2VydFVzZXJUb0RCKGRiVXNlcik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vPT09PT095oqT5LiL5LiA5bGkPT09PT09Ly9cbiAgICAgICAgLy/mipPlj5bnm67moIfnlKjmiLflpb3lj4vliJfooahcbiAgICAgICAgLy91c2VyIC0+IFsgZnJpZW5ke2lkLCBuYW1lLCB1cmx9Li4uIF1cbiAgICAgICAgdmFyIGZyaWVuZHM7XG4gICAgICAgIGlmKGlzVXBkYXRlKXtcbiAgICAgICAgICAgIGZyaWVuZHMgPSB5aWVsZCBnZXRGcmllbmRzRnJvbVdlYih1c2VyLCBzb2NrZXQpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGZyaWVuZHMgPSB5aWVsZCBnZXRGcmllbmRzKHVzZXIsIHNvY2tldCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vWyBmcmllbmQgXSA9PiBbIHVzZXIgfCBncmVwIG1pc3Npb24gXVxuICAgICAgICByZXR1cm4geWllbGQgUHJvbWlzZS5tYXAoZnJpZW5kcyxcbiAgICAgICAgICAgIGZyaWVuZCA9PiBTcGlkZXJNYWluKGZyaWVuZC51cmwsIHNvY2tldCwgZGVwdGgrMSksXG4gICAgICAgICAgICB7IGNvbmN1cnJlbmN5OiBjb25maWcuY29uY3VycmVuY3kgfVxuICAgICAgICApXG4gICAgICAgIC8vIHNvY2tldC5lbWl0KCdkYXRhJywgbXlGcmllbmRzLm1hcChmcmllbmQgPT4gKHtcbiAgICAgICAgLy8gICAgIFwidXNlclwiOiBmcmllbmQsXG4gICAgICAgIC8vICAgICBcInNhbWVGcmllbmRzXCI6IFtdXG4gICAgICAgIC8vIH0pKSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLz09PT09PeaJvuWHuuebuOWQjOWlveWPiz09PT09PS8vXG4gICAgICAgIC8vIHZhciByZXN1bHQgPSB5aWVsZCBQcm9taXNlLm1hcChteUZyaWVuZHMsXG4gICAgICAgIC8vICAgICBteUZyaWVuZCA9PiBzZWFyY2hTYW1lRnJpZW5kKG15RnJpZW5kLCBteUZyaWVuZHMsIHNvY2tldCksXG4gICAgICAgIC8vICAgICB7IGNvbmN1cnJlbmN5OiBjb25maWcuY29uY3VycmVuY3kgfVxuICAgICAgICAvLyApO1xuICAgICAgICAvLyBzb2NrZXQuZW1pdCgnZGF0YScsIHJlc3VsdCk7XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc29ja2V0LmVtaXQoJ25vdGljZScsIGVycik7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG4vLyBpbiBtaWxsaXNlY29uZHNcbmZ1bmN0aW9uIG5vdygpe1xuICAgIHJldHVybiAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xufVxuZnVuY3Rpb24gbmVlZHNVcGRhdGVUaW1lKCl7XG4gICAgcmV0dXJuIG5vdygpIC0gY29uZmlnLnVwZGF0ZVRocmVzaG9sZCAqIDEwMDA7XG59XG4vL3ZhciBuZWVkc1VwZGF0ZVRpbWUgPSAgbm93KCkgLSBjb25maWcudXBkYXRlVGhyZXNob2xkICogMTAwMDtcbmZ1bmN0aW9uIHNob3VsZFVwZGF0ZSh1c2VyKXtcbiAgICByZXR1cm4gdXNlci51cGRhdGVUaW1lIDwgbmVlZHNVcGRhdGVUaW1lKCk7XG59XG5cbmZvcm1EQlVzZXIgPSB1c2VyID0+IHtcbiAgICB1c2VyLl9pZCA9IHVzZXIuaGFzaF9pZDtcbiAgICBkZWxldGUgdXNlci5oYXNoX2lkO1xuICAgIHVzZXIudXBkYXRlVGltZSA9IG5vdygpO1xuICAgIFxuICAgIHJldHVybiB1c2VyO1xufVxuXG5mdW5jdGlvbiogZ2V0VXNlckZyb21EQih1cmwpe1xuICAgIHJldHVybiB5aWVsZCBjb2xsZWN0aW9uLmZpbmRPbmUoe3VybDogdXJsfSk7XG59XG5mdW5jdGlvbiogdXBkYXRlVXNlclRvREIodXNlciwgdXBkYXRlcyl7XG4gICAgcmV0dXJuIHlpZWxkIGNvbGxlY3Rpb24uZmluZE9uZUFuZFVwZGF0ZSh7X2lkOnVzZXIuaGFzaF9pZH0sIHVwZGF0ZXMpO1xufVxuZnVuY3Rpb24qIGluc2VydFVzZXJUb0RCKHVzZXIpe1xuICAgIHJldHVybiB5aWVsZCBjb2xsZWN0aW9uLmluc2VydE9uZSh1c2VyKTtcbn1cblxuZnVuY3Rpb24qIGdldEZyaWVuZHModXNlciwgc29ja2V0KXtcbiAgICBpZih1c2VyLmZvbGxvd2Vycyl7XG4gICAgICAgIHJldHVybiB1c2VyLmZvbGxvd2Vycy5jb25jYXQodXNlci5mb2xsb3dlZXMpO1xuICAgIH1cbiAgICByZXR1cm4geWllbGQgZ2V0RnJpZW5kc0Zyb21XZWIodXNlciwgc29ja2V0KTtcbn1cblxuZnVuY3Rpb24qIGdldEZyaWVuZHNGcm9tV2ViKHVzZXIsIHNvY2tldCkge1xuICAgIGlmICghc29ja2V0KSB7XG4gICAgICAgIHNvY2tldCA9IHtcbiAgICAgICAgICAgIGVtaXQ6ICgpID0+IHt9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciB3b3JrcyA9IHlpZWxkIFsgICBcbiAgICAgICAgZmV0Y2hGb2xsd2VyT3JGb2xsd2VlKHtcbiAgICAgICAgICAgIGlzRm9sbG93ZWVzOiB0cnVlLFxuICAgICAgICAgICAgdXNlcjogdXNlclxuICAgICAgICB9LCBzb2NrZXQpLFxuICAgICAgICBmZXRjaEZvbGx3ZXJPckZvbGx3ZWUoe1xuICAgICAgICAgICAgdXNlcjogdXNlclxuICAgICAgICB9LCBzb2NrZXQpXG4gICAgXTtcbiAgICBcbiAgICB2YXIgZm9sbG93ZWVzID0gd29ya3NbMF07XG4gICAgdmFyIGZvbGxvd2VycyA9IHdvcmtzWzFdO1xuICAgIFxuICAgIHlpZWxkIHVwZGF0ZVVzZXJUb0RCKHVzZXIsIHskc2V0OiB7Zm9sbG93ZXJzOiBmb2xsb3dlcnMsIGZvbGxvd2VlczogZm9sbG93ZWVzfX0pO1xuICAgIFxuICAgIHZhciBmcmllbmRzID0gZm9sbG93ZXJzLm1hcChmb2xsb3dlciA9PiBmb2xsb3dlZXMuZmlsdGVyKGZvbGxvd2VlID0+IGZvbGxvd2VyLmhhc2hfaWQgPT09IGZvbGxvd2VlLmhhc2hfaWQpKTtcbiAgICByZXR1cm4gZnJpZW5kcztcbn1cblxuZnVuY3Rpb24gc2VhcmNoU2FtZUZyaWVuZChhRnJpZW5kLCBteUZyaWVuZHMsIHNvY2tldCkge1xuICAgIGlmICghc29ja2V0KSB7XG4gICAgICAgIHNvY2tldCA9IHtcbiAgICAgICAgICAgIGVtaXQ6ICgpID0+IHt9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHNvY2tldC5lbWl0KFwibm90aWNlXCIsIFwic2VhcmNoU2FtZUZyaWVuZCB3aXRoIFwiICsgYUZyaWVuZC5uYW1lICsgXCIuLi4uLi5cIik7XG4gICAgY29uc29sZS5sb2coXCJzZWFyY2hTYW1lRnJpZW5kIHdpdGggXCIgKyBhRnJpZW5kLm5hbWUgKyBcIi4uLi4uLlwiKTtcbiAgICByZXR1cm4gZ2V0RnJpZW5kcyhhRnJpZW5kLCBzb2NrZXQpXG4gICAgICAgIC50aGVuKHRhcmdldEZyaWVuZHMgPT4ge1xuICAgICAgICAgICAgdmFyIHNhbWVGcmllbmRzID0gW107XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY291bnRpbmcgZm9yICcgKyBhRnJpZW5kLm5hbWUgKyAnLi4uLi4uJylcbiAgICAgICAgICAgIHRhcmdldEZyaWVuZHMuZm9yRWFjaCh0YXJnZXRGcmllbmQgPT4ge1xuICAgICAgICAgICAgICAgIG15RnJpZW5kcy5mb3JFYWNoKG15RnJpZW5kID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldEZyaWVuZC5oYXNoX2lkID09PSBteUZyaWVuZC5oYXNoX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1lRnJpZW5kcy5wdXNoKHRhcmdldEZyaWVuZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiXFxuXFxuPT09PT09PT09PT09PT1cXG4gU2FtZSBGcmllbmRzIHdpdGggXCIgKyBhRnJpZW5kLm5hbWUgKyBcIlxcblwiKTtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KCdzYW1lIGZyaWVuZCcsIHtcbiAgICAgICAgICAgICAgICBoYXNoX2lkOiBhRnJpZW5kLmhhc2hfaWQsXG4gICAgICAgICAgICAgICAgc2FtZUZyaWVuZHM6IHNhbWVGcmllbmRzXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgY29uc29sZS5sb2coc2FtZUZyaWVuZHMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG5cXG5cIik7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXNlcjogYUZyaWVuZCxcbiAgICAgICAgICAgICAgICBzYW1lRnJpZW5kczogc2FtZUZyaWVuZHNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pXG59XG4iXX0=
//# sourceMappingURL=Spider.js.map
