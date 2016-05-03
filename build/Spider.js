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

require('babel-polyfill');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _Storage = require('./Storage');

var _Storage2 = _interopRequireDefault(_Storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [SpiderMain, getFriends, getFriendsFromWeb].map(regeneratorRuntime.mark);

var storage;
function Spider(userPageUrl, socket, database) {
    if (!storage) storage = (0, _Storage2.default)(database);
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
                    return storage.getUser(userPageUrl);

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
                    return storage.updateUser(user, { $set: dbUser });

                case 20:
                    _context.next = 24;
                    break;

                case 22:
                    _context.next = 24;
                    return storage.insertUser(dbUser);

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
    user.updateTime = now();
    user.url = url;
    return user;
};

function getFriends(user, socket) {
    return regeneratorRuntime.wrap(function getFriends$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    if (!user.followers) {
                        _context2.next = 2;
                        break;
                    }

                    return _context2.abrupt('return', user.followers.concat(user.followees));

                case 2:
                    _context2.next = 4;
                    return getFriendsFromWeb(user, socket);

                case 4:
                    return _context2.abrupt('return', _context2.sent);

                case 5:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked[1], this);
}

function getFriendsFromWeb(user, socket) {
    var works, followees, followers, friends;
    return regeneratorRuntime.wrap(function getFriendsFromWeb$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    if (!socket) {
                        socket = {
                            emit: function emit() {}
                        };
                    }
                    _context3.next = 3;
                    return [(0, _fetchFollwerOrFollwee2.default)({
                        isFollowees: true,
                        user: user
                    }, socket), (0, _fetchFollwerOrFollwee2.default)({
                        user: user
                    }, socket)];

                case 3:
                    works = _context3.sent;
                    followees = works[0];
                    followers = works[1];
                    _context3.next = 8;
                    return storage.updateUser(user, { $set: { followers: followers, followees: followees } });

                case 8:
                    friends = followers.map(function (follower) {
                        return followees.filter(function (followee) {
                            return follower.hash_id === followee.hash_id;
                        });
                    });
                    return _context3.abrupt('return', friends);

                case 10:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked[2], this);
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
//# sourceMappingURL=data:application/json;base64,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QVYsQ0FBa0Isb0JBQVk7QUFDMUIsb0JBQUksYUFBYSxPQUFiLEtBQXlCLFNBQVMsT0FBVCxFQUFrQjtBQUMzQyxnQ0FBWSxJQUFaLENBQWlCLFlBQWpCLEVBRDJDO2lCQUEvQzthQURjLENBQWxCLENBRGtDO1NBQWhCLENBQXRCLENBSG1CO0FBVW5CLGdCQUFRLEdBQVIsQ0FBWSw0Q0FBNEMsUUFBUSxJQUFSLEdBQWUsSUFBM0QsQ0FBWixDQVZtQjtBQVduQixlQUFPLElBQVAsQ0FBWSxhQUFaLEVBQTJCO0FBQ3ZCLHFCQUFTLFFBQVEsT0FBUjtBQUNULHlCQUFhLFdBQWI7U0FGSixFQVhtQjtBQWVuQixnQkFBUSxHQUFSLENBQVksV0FBWixFQWZtQjtBQWdCbkIsZ0JBQVEsR0FBUixDQUFZLE1BQVosRUFoQm1COztBQWtCbkIsZUFBTztBQUNILGtCQUFNLE9BQU47QUFDQSx5QkFBYSxXQUFiO1NBRkosQ0FsQm1CO0tBQWpCLENBRFYsQ0FSa0Q7Q0FBdEQiLCJmaWxlIjoiU3BpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZldGNoRm9sbHdlck9yRm9sbHdlZSBmcm9tICcuL2ZldGNoRm9sbHdlck9yRm9sbHdlZSc7XG5pbXBvcnQgZ2V0VXNlciBmcm9tICcuL2dldFVzZXInO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9zcGlkZXIuY29uZmlnJztcbmltcG9ydCBjbyBmcm9tICdjbyc7XG5pbXBvcnQgJ2JhYmVsLXBvbHlmaWxsJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBTdG9yYWdlIGZyb20gJy4vU3RvcmFnZSc7XG5cbnZhciBzdG9yYWdlO1xuZXhwb3J0IGZ1bmN0aW9uIFNwaWRlcih1c2VyUGFnZVVybCwgc29ja2V0LCBkYXRhYmFzZSkge1xuICAgIGlmKCFzdG9yYWdlKVxuICAgICAgICBzdG9yYWdlID0gU3RvcmFnZShkYXRhYmFzZSk7XG4gICAgY28oU3BpZGVyTWFpbih1c2VyUGFnZVVybCwgc29ja2V0LCAwKSk7XG59XG5cblxuZnVuY3Rpb24qIFNwaWRlck1haW4odXNlclBhZ2VVcmwsIHNvY2tldCwgZGVwdGgpIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgdXNlcjtcbiAgICAgICAgXG4gICAgICAgIHZhciB1c2VyRnJvbURCID0geWllbGQgc3RvcmFnZS5nZXRVc2VyKHVzZXJQYWdlVXJsKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBpc1VwZGF0ZSwgaXNGcm9tREI7XG4gICAgICAgIGlmKHVzZXJGcm9tREIpe1xuICAgICAgICAgICAgaXNVcGRhdGUgPSBzaG91bGRVcGRhdGUodXNlckZyb21EQilcbiAgICAgICAgICAgIGlzRnJvbURCID0gIWlzVXBkYXRlO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGlzVXBkYXRlID0gaXNGcm9tREIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIGlzRnJvbURCICl7XG4gICAgICAgICAgICB1c2VyID0gdXNlckZyb21EQjtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAvLz09PT09PeaKk+WPluebruagh+eUqOaIt+S/oeaBrz09PT09PS8vXG4gICAgICAgICAgICAvL1VSTCAtPiB1c2Vye2lkLCBuYW1lLCBmb2xsb3dlckFtb3VudCwgZm9sbG93ZWVBbW91bnR9XG4gICAgICAgICAgICB1c2VyID0geWllbGQgZ2V0VXNlcih1c2VyUGFnZVVybCk7XG4gICAgICAgICAgICBzb2NrZXQuZW1pdCgnbm90aWNlJywgJ+aKk+WPlueUqOaIt+S/oeaBr+aIkOWKnycpO1xuICAgICAgICAgICAgc29ja2V0LmVtaXQoJ2dldCB1c2VyJywgdXNlcik7XG4gICAgICAgIH1cbiAgICAgICAgXG5cbiAgICAgICAgLy8gc2hvdWxkIGdyZXAgbmV4dCBsZXZlbFxuICAgICAgICBpZihkZXB0aCA+PSBjb25maWcuZGVwdGgpe1xuICAgICAgICAgICAgcmV0dXJuIHVzZXI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2F2ZSB1c2VyIFRPRE9cbiAgICAgICAgdmFyIGRiVXNlciA9IGZvcm1EQlVzZXIodXNlciwgdXNlclBhZ2VVcmwpO1xuICAgICAgICBpZihpc1VwZGF0ZSl7XG4gICAgICAgICAgICB5aWVsZCBzdG9yYWdlLnVwZGF0ZVVzZXIodXNlciwgeyRzZXQ6IGRiVXNlcn0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHlpZWxkIHN0b3JhZ2UuaW5zZXJ0VXNlcihkYlVzZXIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLz09PT09PeaKk+S4i+S4gOWxpD09PT09PS8vXG4gICAgICAgIC8v5oqT5Y+W55uu5qCH55So5oi35aW95Y+L5YiX6KGoXG4gICAgICAgIC8vdXNlciAtPiBbIGZyaWVuZHtpZCwgbmFtZSwgdXJsfS4uLiBdXG4gICAgICAgIHZhciBmcmllbmRzO1xuICAgICAgICBpZihpc1VwZGF0ZSl7XG4gICAgICAgICAgICBmcmllbmRzID0geWllbGQgZ2V0RnJpZW5kc0Zyb21XZWIodXNlciwgc29ja2V0KTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBmcmllbmRzID0geWllbGQgZ2V0RnJpZW5kcyh1c2VyLCBzb2NrZXQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvL1sgZnJpZW5kIF0gPT4gWyB1c2VyIHwgZ3JlcCBtaXNzaW9uIF1cbiAgICAgICAgcmV0dXJuIHlpZWxkIFByb21pc2UubWFwKGZyaWVuZHMsXG4gICAgICAgICAgICBmcmllbmQgPT4gU3BpZGVyTWFpbihmcmllbmQudXJsLCBzb2NrZXQsIGRlcHRoKzEpLFxuICAgICAgICAgICAgeyBjb25jdXJyZW5jeTogY29uZmlnLmNvbmN1cnJlbmN5IH1cbiAgICAgICAgKVxuICAgICAgICAvLyBzb2NrZXQuZW1pdCgnZGF0YScsIG15RnJpZW5kcy5tYXAoZnJpZW5kID0+ICh7XG4gICAgICAgIC8vICAgICBcInVzZXJcIjogZnJpZW5kLFxuICAgICAgICAvLyAgICAgXCJzYW1lRnJpZW5kc1wiOiBbXVxuICAgICAgICAvLyB9KSkpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy89PT09PT3mib7lh7rnm7jlkIzlpb3lj4s9PT09PT0vL1xuICAgICAgICAvLyB2YXIgcmVzdWx0ID0geWllbGQgUHJvbWlzZS5tYXAobXlGcmllbmRzLFxuICAgICAgICAvLyAgICAgbXlGcmllbmQgPT4gc2VhcmNoU2FtZUZyaWVuZChteUZyaWVuZCwgbXlGcmllbmRzLCBzb2NrZXQpLFxuICAgICAgICAvLyAgICAgeyBjb25jdXJyZW5jeTogY29uZmlnLmNvbmN1cnJlbmN5IH1cbiAgICAgICAgLy8gKTtcbiAgICAgICAgLy8gc29ja2V0LmVtaXQoJ2RhdGEnLCByZXN1bHQpO1xuXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNvY2tldC5lbWl0KCdub3RpY2UnLCBlcnIpO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn1cblxuLy8gaW4gbWlsbGlzZWNvbmRzXG5mdW5jdGlvbiBub3coKXtcbiAgICByZXR1cm4gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbn1cbmZ1bmN0aW9uIG5lZWRzVXBkYXRlVGltZSgpe1xuICAgIHJldHVybiBub3coKSAtIGNvbmZpZy51cGRhdGVUaHJlc2hvbGQgKiAxMDAwO1xufVxuLy92YXIgbmVlZHNVcGRhdGVUaW1lID0gIG5vdygpIC0gY29uZmlnLnVwZGF0ZVRocmVzaG9sZCAqIDEwMDA7XG5mdW5jdGlvbiBzaG91bGRVcGRhdGUodXNlcil7XG4gICAgcmV0dXJuIHVzZXIudXBkYXRlVGltZSA8IG5lZWRzVXBkYXRlVGltZSgpO1xufVxuXG52YXIgZm9ybURCVXNlciA9ICh1c2VyLCB1cmwpID0+IHtcbiAgICB1c2VyLl9pZCA9IHVzZXIuaGFzaF9pZDtcbiAgICB1c2VyLnVwZGF0ZVRpbWUgPSBub3coKTtcbiAgICB1c2VyLnVybCA9IHVybDtcbiAgICByZXR1cm4gdXNlcjtcbn1cblxuZnVuY3Rpb24qIGdldEZyaWVuZHModXNlciwgc29ja2V0KXtcbiAgICBpZih1c2VyLmZvbGxvd2Vycyl7XG4gICAgICAgIHJldHVybiB1c2VyLmZvbGxvd2Vycy5jb25jYXQodXNlci5mb2xsb3dlZXMpO1xuICAgIH1cbiAgICByZXR1cm4geWllbGQgZ2V0RnJpZW5kc0Zyb21XZWIodXNlciwgc29ja2V0KTtcbn1cblxuZnVuY3Rpb24qIGdldEZyaWVuZHNGcm9tV2ViKHVzZXIsIHNvY2tldCkge1xuICAgIGlmICghc29ja2V0KSB7XG4gICAgICAgIHNvY2tldCA9IHtcbiAgICAgICAgICAgIGVtaXQ6ICgpID0+IHt9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciB3b3JrcyA9IHlpZWxkIFsgICBcbiAgICAgICAgZmV0Y2hGb2xsd2VyT3JGb2xsd2VlKHtcbiAgICAgICAgICAgIGlzRm9sbG93ZWVzOiB0cnVlLFxuICAgICAgICAgICAgdXNlcjogdXNlclxuICAgICAgICB9LCBzb2NrZXQpLFxuICAgICAgICBmZXRjaEZvbGx3ZXJPckZvbGx3ZWUoe1xuICAgICAgICAgICAgdXNlcjogdXNlclxuICAgICAgICB9LCBzb2NrZXQpXG4gICAgXTtcbiAgICBcbiAgICB2YXIgZm9sbG93ZWVzID0gd29ya3NbMF07XG4gICAgdmFyIGZvbGxvd2VycyA9IHdvcmtzWzFdO1xuICAgIFxuICAgIHlpZWxkIHN0b3JhZ2UudXBkYXRlVXNlcih1c2VyLCB7JHNldDoge2ZvbGxvd2VyczogZm9sbG93ZXJzLCBmb2xsb3dlZXM6IGZvbGxvd2Vlc319KTtcbiAgICBcbiAgICB2YXIgZnJpZW5kcyA9IGZvbGxvd2Vycy5tYXAoZm9sbG93ZXIgPT4gZm9sbG93ZWVzLmZpbHRlcihmb2xsb3dlZSA9PiBmb2xsb3dlci5oYXNoX2lkID09PSBmb2xsb3dlZS5oYXNoX2lkKSk7XG4gICAgcmV0dXJuIGZyaWVuZHM7XG59XG5cbmZ1bmN0aW9uIHNlYXJjaFNhbWVGcmllbmQoYUZyaWVuZCwgbXlGcmllbmRzLCBzb2NrZXQpIHtcbiAgICBpZiAoIXNvY2tldCkge1xuICAgICAgICBzb2NrZXQgPSB7XG4gICAgICAgICAgICBlbWl0OiAoKSA9PiB7fVxuICAgICAgICB9O1xuICAgIH1cbiAgICBzb2NrZXQuZW1pdChcIm5vdGljZVwiLCBcInNlYXJjaFNhbWVGcmllbmQgd2l0aCBcIiArIGFGcmllbmQubmFtZSArIFwiLi4uLi4uXCIpO1xuICAgIGNvbnNvbGUubG9nKFwic2VhcmNoU2FtZUZyaWVuZCB3aXRoIFwiICsgYUZyaWVuZC5uYW1lICsgXCIuLi4uLi5cIik7XG4gICAgcmV0dXJuIGdldEZyaWVuZHMoYUZyaWVuZCwgc29ja2V0KVxuICAgICAgICAudGhlbih0YXJnZXRGcmllbmRzID0+IHtcbiAgICAgICAgICAgIHZhciBzYW1lRnJpZW5kcyA9IFtdO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NvdW50aW5nIGZvciAnICsgYUZyaWVuZC5uYW1lICsgJy4uLi4uLicpXG4gICAgICAgICAgICB0YXJnZXRGcmllbmRzLmZvckVhY2godGFyZ2V0RnJpZW5kID0+IHtcbiAgICAgICAgICAgICAgICBteUZyaWVuZHMuZm9yRWFjaChteUZyaWVuZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRGcmllbmQuaGFzaF9pZCA9PT0gbXlGcmllbmQuaGFzaF9pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FtZUZyaWVuZHMucHVzaCh0YXJnZXRGcmllbmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlxcblxcbj09PT09PT09PT09PT09XFxuIFNhbWUgRnJpZW5kcyB3aXRoIFwiICsgYUZyaWVuZC5uYW1lICsgXCJcXG5cIik7XG4gICAgICAgICAgICBzb2NrZXQuZW1pdCgnc2FtZSBmcmllbmQnLCB7XG4gICAgICAgICAgICAgICAgaGFzaF9pZDogYUZyaWVuZC5oYXNoX2lkLFxuICAgICAgICAgICAgICAgIHNhbWVGcmllbmRzOiBzYW1lRnJpZW5kc1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNhbWVGcmllbmRzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiXFxuXFxuXCIpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVzZXI6IGFGcmllbmQsXG4gICAgICAgICAgICAgICAgc2FtZUZyaWVuZHM6IHNhbWVGcmllbmRzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KVxufVxuIl19
//# sourceMappingURL=Spider.js.map
