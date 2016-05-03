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
                    dbUser = formDBUser(user, userPageUrl);

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

var formDBUser = function formDBUser(user, url) {
    user._id = user.hash_id;
    delete user.hash_id;
    user.updateTime = now();
    user.url = url;
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
//# sourceMappingURL=data:application/json;base64,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QUtBLFdBQU8sSUFBUCxDQUFZLFFBQVosRUFBc0IsMkJBQTJCLFFBQVEsSUFBUixHQUFlLFFBQTFDLENBQXRCLENBTmtEO0FBT2xELFlBQVEsR0FBUixDQUFZLDJCQUEyQixRQUFRLElBQVIsR0FBZSxRQUExQyxDQUFaLENBUGtEO0FBUWxELFdBQU8sV0FBVyxPQUFYLEVBQW9CLE1BQXBCLEVBQ0YsSUFERSxDQUNHLHlCQUFpQjtBQUNuQixZQUFJLGNBQWMsRUFBZCxDQURlO0FBRW5CLGdCQUFRLEdBQVIsQ0FBWSxrQkFBa0IsUUFBUSxJQUFSLEdBQWUsUUFBakMsQ0FBWixDQUZtQjtBQUduQixzQkFBYyxPQUFkLENBQXNCLHdCQUFnQjtBQUNsQyxzQkFBVSxPQUFWLENBQWtCLG9CQUFZO0FBQzFCLG9CQUFJLGFBQWEsT0FBYixLQUF5QixTQUFTLE9BQVQsRUFBa0I7QUFDM0MsZ0NBQVksSUFBWixDQUFpQixZQUFqQixFQUQyQztpQkFBL0M7YUFEYyxDQUFsQixDQURrQztTQUFoQixDQUF0QixDQUhtQjtBQVVuQixnQkFBUSxHQUFSLENBQVksNENBQTRDLFFBQVEsSUFBUixHQUFlLElBQTNELENBQVosQ0FWbUI7QUFXbkIsZUFBTyxJQUFQLENBQVksYUFBWixFQUEyQjtBQUN2QixxQkFBUyxRQUFRLE9BQVI7QUFDVCx5QkFBYSxXQUFiO1NBRkosRUFYbUI7QUFlbkIsZ0JBQVEsR0FBUixDQUFZLFdBQVosRUFmbUI7QUFnQm5CLGdCQUFRLEdBQVIsQ0FBWSxNQUFaLEVBaEJtQjs7QUFrQm5CLGVBQU87QUFDSCxrQkFBTSxPQUFOO0FBQ0EseUJBQWEsV0FBYjtTQUZKLENBbEJtQjtLQUFqQixDQURWLENBUmtEO0NBQXREIiwiZmlsZSI6IlNwaWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmZXRjaEZvbGx3ZXJPckZvbGx3ZWUgZnJvbSAnLi9mZXRjaEZvbGx3ZXJPckZvbGx3ZWUnO1xuaW1wb3J0IGdldFVzZXIgZnJvbSAnLi9nZXRVc2VyJztcbmltcG9ydCBjb25maWcgZnJvbSAnLi4vc3BpZGVyLmNvbmZpZyc7XG5pbXBvcnQgY28gZnJvbSAnY28nO1xuaW1wb3J0IGRiQ29uZmlnIGZyb20gJy4uL2RhdGFiYXNlLmNvbmZpZy5qcyc7XG5pbXBvcnQgJ2JhYmVsLXBvbHlmaWxsJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcblxudmFyIGNvbGxlY3Rpb247XG5leHBvcnQgZnVuY3Rpb24gU3BpZGVyKHVzZXJQYWdlVXJsLCBzb2NrZXQsIGRhdGFiYXNlKSB7XG4gICAgaWYoIWNvbGxlY3Rpb24pe1xuICAgICAgICBjb2xsZWN0aW9uID0gZGF0YWJhc2UuY29sbGVjdGlvbihkYkNvbmZpZy5jb2xsZWN0aW9uKTtcbiAgICB9XG4gICAgY28oU3BpZGVyTWFpbih1c2VyUGFnZVVybCwgc29ja2V0LCAwKSk7XG59XG5cblxuZnVuY3Rpb24qIFNwaWRlck1haW4odXNlclBhZ2VVcmwsIHNvY2tldCwgZGVwdGgpIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgdXNlcjtcbiAgICAgICAgXG4gICAgICAgIHZhciB1c2VyRnJvbURCID0geWllbGQgZ2V0VXNlckZyb21EQih1c2VyUGFnZVVybCk7XG4gICAgICAgIFxuICAgICAgICB2YXIgaXNVcGRhdGUsIGlzRnJvbURCO1xuICAgICAgICBpZih1c2VyRnJvbURCKXtcbiAgICAgICAgICAgIGlzVXBkYXRlID0gc2hvdWxkVXBkYXRlKHVzZXJGcm9tREIpXG4gICAgICAgICAgICBpc0Zyb21EQiA9ICFpc1VwZGF0ZTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBpc1VwZGF0ZSA9IGlzRnJvbURCID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCBpc0Zyb21EQiApe1xuICAgICAgICAgICAgdXNlciA9IHVzZXJGcm9tREI7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgLy89PT09PT3mipPlj5bnm67moIfnlKjmiLfkv6Hmga89PT09PT0vL1xuICAgICAgICAgICAgLy9VUkwgLT4gdXNlcntpZCwgbmFtZSwgZm9sbG93ZXJBbW91bnQsIGZvbGxvd2VlQW1vdW50fVxuICAgICAgICAgICAgdXNlciA9IHlpZWxkIGdldFVzZXIodXNlclBhZ2VVcmwpO1xuICAgICAgICAgICAgc29ja2V0LmVtaXQoJ25vdGljZScsICfmipPlj5bnlKjmiLfkv6Hmga/miJDlip8nKTtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KCdnZXQgdXNlcicsIHVzZXIpO1xuICAgICAgICB9XG4gICAgICAgIFxuXG4gICAgICAgIC8vIHNob3VsZCBncmVwIG5leHQgbGV2ZWxcbiAgICAgICAgaWYoZGVwdGggPj0gY29uZmlnLmRlcHRoKXtcbiAgICAgICAgICAgIHJldHVybiB1c2VyO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNhdmUgdXNlciBUT0RPXG4gICAgICAgIHZhciBkYlVzZXIgPSBmb3JtREJVc2VyKHVzZXIsIHVzZXJQYWdlVXJsKTtcbiAgICAgICAgaWYoaXNVcGRhdGUpe1xuICAgICAgICAgICAgeWllbGQgdXBkYXRlVXNlclRvREIodXNlciwgeyRzZXQ6IGRiVXNlcn0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHlpZWxkIGluc2VydFVzZXJUb0RCKGRiVXNlcik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vPT09PT095oqT5LiL5LiA5bGkPT09PT09Ly9cbiAgICAgICAgLy/mipPlj5bnm67moIfnlKjmiLflpb3lj4vliJfooahcbiAgICAgICAgLy91c2VyIC0+IFsgZnJpZW5ke2lkLCBuYW1lLCB1cmx9Li4uIF1cbiAgICAgICAgdmFyIGZyaWVuZHM7XG4gICAgICAgIGlmKGlzVXBkYXRlKXtcbiAgICAgICAgICAgIGZyaWVuZHMgPSB5aWVsZCBnZXRGcmllbmRzRnJvbVdlYih1c2VyLCBzb2NrZXQpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGZyaWVuZHMgPSB5aWVsZCBnZXRGcmllbmRzKHVzZXIsIHNvY2tldCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vWyBmcmllbmQgXSA9PiBbIHVzZXIgfCBncmVwIG1pc3Npb24gXVxuICAgICAgICByZXR1cm4geWllbGQgUHJvbWlzZS5tYXAoZnJpZW5kcyxcbiAgICAgICAgICAgIGZyaWVuZCA9PiBTcGlkZXJNYWluKGZyaWVuZC51cmwsIHNvY2tldCwgZGVwdGgrMSksXG4gICAgICAgICAgICB7IGNvbmN1cnJlbmN5OiBjb25maWcuY29uY3VycmVuY3kgfVxuICAgICAgICApXG4gICAgICAgIC8vIHNvY2tldC5lbWl0KCdkYXRhJywgbXlGcmllbmRzLm1hcChmcmllbmQgPT4gKHtcbiAgICAgICAgLy8gICAgIFwidXNlclwiOiBmcmllbmQsXG4gICAgICAgIC8vICAgICBcInNhbWVGcmllbmRzXCI6IFtdXG4gICAgICAgIC8vIH0pKSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLz09PT09PeaJvuWHuuebuOWQjOWlveWPiz09PT09PS8vXG4gICAgICAgIC8vIHZhciByZXN1bHQgPSB5aWVsZCBQcm9taXNlLm1hcChteUZyaWVuZHMsXG4gICAgICAgIC8vICAgICBteUZyaWVuZCA9PiBzZWFyY2hTYW1lRnJpZW5kKG15RnJpZW5kLCBteUZyaWVuZHMsIHNvY2tldCksXG4gICAgICAgIC8vICAgICB7IGNvbmN1cnJlbmN5OiBjb25maWcuY29uY3VycmVuY3kgfVxuICAgICAgICAvLyApO1xuICAgICAgICAvLyBzb2NrZXQuZW1pdCgnZGF0YScsIHJlc3VsdCk7XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc29ja2V0LmVtaXQoJ25vdGljZScsIGVycik7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG4vLyBpbiBtaWxsaXNlY29uZHNcbmZ1bmN0aW9uIG5vdygpe1xuICAgIHJldHVybiAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xufVxuZnVuY3Rpb24gbmVlZHNVcGRhdGVUaW1lKCl7XG4gICAgcmV0dXJuIG5vdygpIC0gY29uZmlnLnVwZGF0ZVRocmVzaG9sZCAqIDEwMDA7XG59XG4vL3ZhciBuZWVkc1VwZGF0ZVRpbWUgPSAgbm93KCkgLSBjb25maWcudXBkYXRlVGhyZXNob2xkICogMTAwMDtcbmZ1bmN0aW9uIHNob3VsZFVwZGF0ZSh1c2VyKXtcbiAgICByZXR1cm4gdXNlci51cGRhdGVUaW1lIDwgbmVlZHNVcGRhdGVUaW1lKCk7XG59XG5cbnZhciBmb3JtREJVc2VyID0gKHVzZXIsIHVybCkgPT4ge1xuICAgIHVzZXIuX2lkID0gdXNlci5oYXNoX2lkO1xuICAgIGRlbGV0ZSB1c2VyLmhhc2hfaWQ7XG4gICAgdXNlci51cGRhdGVUaW1lID0gbm93KCk7XG4gICAgdXNlci51cmwgPSB1cmw7XG4gICAgcmV0dXJuIHVzZXI7XG59XG5cbmZ1bmN0aW9uKiBnZXRVc2VyRnJvbURCKHVybCl7XG4gICAgcmV0dXJuIHlpZWxkIGNvbGxlY3Rpb24uZmluZE9uZSh7dXJsOiB1cmx9KTtcbn1cbmZ1bmN0aW9uKiB1cGRhdGVVc2VyVG9EQih1c2VyLCB1cGRhdGVzKXtcbiAgICByZXR1cm4geWllbGQgY29sbGVjdGlvbi5maW5kT25lQW5kVXBkYXRlKHtfaWQ6dXNlci5oYXNoX2lkfSwgdXBkYXRlcyk7XG59XG5mdW5jdGlvbiogaW5zZXJ0VXNlclRvREIodXNlcil7XG4gICAgcmV0dXJuIHlpZWxkIGNvbGxlY3Rpb24uaW5zZXJ0T25lKHVzZXIpO1xufVxuXG5mdW5jdGlvbiogZ2V0RnJpZW5kcyh1c2VyLCBzb2NrZXQpe1xuICAgIGlmKHVzZXIuZm9sbG93ZXJzKXtcbiAgICAgICAgcmV0dXJuIHVzZXIuZm9sbG93ZXJzLmNvbmNhdCh1c2VyLmZvbGxvd2Vlcyk7XG4gICAgfVxuICAgIHJldHVybiB5aWVsZCBnZXRGcmllbmRzRnJvbVdlYih1c2VyLCBzb2NrZXQpO1xufVxuXG5mdW5jdGlvbiogZ2V0RnJpZW5kc0Zyb21XZWIodXNlciwgc29ja2V0KSB7XG4gICAgaWYgKCFzb2NrZXQpIHtcbiAgICAgICAgc29ja2V0ID0ge1xuICAgICAgICAgICAgZW1pdDogKCkgPT4ge31cbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIHdvcmtzID0geWllbGQgWyAgIFxuICAgICAgICBmZXRjaEZvbGx3ZXJPckZvbGx3ZWUoe1xuICAgICAgICAgICAgaXNGb2xsb3dlZXM6IHRydWUsXG4gICAgICAgICAgICB1c2VyOiB1c2VyXG4gICAgICAgIH0sIHNvY2tldCksXG4gICAgICAgIGZldGNoRm9sbHdlck9yRm9sbHdlZSh7XG4gICAgICAgICAgICB1c2VyOiB1c2VyXG4gICAgICAgIH0sIHNvY2tldClcbiAgICBdO1xuICAgIFxuICAgIHZhciBmb2xsb3dlZXMgPSB3b3Jrc1swXTtcbiAgICB2YXIgZm9sbG93ZXJzID0gd29ya3NbMV07XG4gICAgXG4gICAgeWllbGQgdXBkYXRlVXNlclRvREIodXNlciwgeyRzZXQ6IHtmb2xsb3dlcnM6IGZvbGxvd2VycywgZm9sbG93ZWVzOiBmb2xsb3dlZXN9fSk7XG4gICAgXG4gICAgdmFyIGZyaWVuZHMgPSBmb2xsb3dlcnMubWFwKGZvbGxvd2VyID0+IGZvbGxvd2Vlcy5maWx0ZXIoZm9sbG93ZWUgPT4gZm9sbG93ZXIuaGFzaF9pZCA9PT0gZm9sbG93ZWUuaGFzaF9pZCkpO1xuICAgIHJldHVybiBmcmllbmRzO1xufVxuXG5mdW5jdGlvbiBzZWFyY2hTYW1lRnJpZW5kKGFGcmllbmQsIG15RnJpZW5kcywgc29ja2V0KSB7XG4gICAgaWYgKCFzb2NrZXQpIHtcbiAgICAgICAgc29ja2V0ID0ge1xuICAgICAgICAgICAgZW1pdDogKCkgPT4ge31cbiAgICAgICAgfTtcbiAgICB9XG4gICAgc29ja2V0LmVtaXQoXCJub3RpY2VcIiwgXCJzZWFyY2hTYW1lRnJpZW5kIHdpdGggXCIgKyBhRnJpZW5kLm5hbWUgKyBcIi4uLi4uLlwiKTtcbiAgICBjb25zb2xlLmxvZyhcInNlYXJjaFNhbWVGcmllbmQgd2l0aCBcIiArIGFGcmllbmQubmFtZSArIFwiLi4uLi4uXCIpO1xuICAgIHJldHVybiBnZXRGcmllbmRzKGFGcmllbmQsIHNvY2tldClcbiAgICAgICAgLnRoZW4odGFyZ2V0RnJpZW5kcyA9PiB7XG4gICAgICAgICAgICB2YXIgc2FtZUZyaWVuZHMgPSBbXTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb3VudGluZyBmb3IgJyArIGFGcmllbmQubmFtZSArICcuLi4uLi4nKVxuICAgICAgICAgICAgdGFyZ2V0RnJpZW5kcy5mb3JFYWNoKHRhcmdldEZyaWVuZCA9PiB7XG4gICAgICAgICAgICAgICAgbXlGcmllbmRzLmZvckVhY2gobXlGcmllbmQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0RnJpZW5kLmhhc2hfaWQgPT09IG15RnJpZW5kLmhhc2hfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbWVGcmllbmRzLnB1c2godGFyZ2V0RnJpZW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG5cXG49PT09PT09PT09PT09PVxcbiBTYW1lIEZyaWVuZHMgd2l0aCBcIiArIGFGcmllbmQubmFtZSArIFwiXFxuXCIpO1xuICAgICAgICAgICAgc29ja2V0LmVtaXQoJ3NhbWUgZnJpZW5kJywge1xuICAgICAgICAgICAgICAgIGhhc2hfaWQ6IGFGcmllbmQuaGFzaF9pZCxcbiAgICAgICAgICAgICAgICBzYW1lRnJpZW5kczogc2FtZUZyaWVuZHNcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzYW1lRnJpZW5kcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlxcblxcblwiKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1c2VyOiBhRnJpZW5kLFxuICAgICAgICAgICAgICAgIHNhbWVGcmllbmRzOiBzYW1lRnJpZW5kc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSlcbn1cbiJdfQ==
//# sourceMappingURL=Spider.js.map
