'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Storage;

var _databaseConfig = require('../database.config.js');

var _databaseConfig2 = _interopRequireDefault(_databaseConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [getUser, updateUser, insertUser].map(regeneratorRuntime.mark);

var collection;
function Storage(database) {
    collection = database.collection(_databaseConfig2.default.collection);
    return {
        getUser: getUser,
        updateUser: updateUser,
        insertUser: insertUser
    };
}

function getUser(url) {
    return regeneratorRuntime.wrap(function getUser$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return collection.findOne({ url: url });

                case 2:
                    return _context.abrupt('return', _context.sent);

                case 3:
                case 'end':
                    return _context.stop();
            }
        }
    }, _marked[0], this);
}
function updateUser(user, updates) {
    return regeneratorRuntime.wrap(function updateUser$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.next = 2;
                    return collection.findOneAndUpdate({ _id: user.hash_id }, updates);

                case 2:
                    return _context2.abrupt('return', _context2.sent);

                case 3:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked[1], this);
}
function insertUser(user) {
    return regeneratorRuntime.wrap(function insertUser$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.next = 2;
                    return collection.insertOne(user);

                case 2:
                    return _context3.abrupt('return', _context3.sent);

                case 3:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked[2], this);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7a0JBR3dCOztBQUh4Qjs7Ozs7O2VBWVUsU0FHQSxZQUdBOztBQWhCVixJQUFJLFVBQUo7QUFDZSxTQUFTLE9BQVQsQ0FBaUIsUUFBakIsRUFBMEI7QUFDckMsaUJBQWEsU0FBUyxVQUFULENBQW9CLHlCQUFTLFVBQVQsQ0FBakMsQ0FEcUM7QUFFckMsV0FBTztBQUNILGlCQUFTLE9BQVQ7QUFDQSxvQkFBWSxVQUFaO0FBQ0Esb0JBQVksVUFBWjtLQUhKLENBRnFDO0NBQTFCOztBQVNmLFNBQVUsT0FBVixDQUFrQixHQUFsQjs7Ozs7OzJCQUNpQixXQUFXLE9BQVgsQ0FBbUIsRUFBQyxLQUFLLEdBQUwsRUFBcEI7Ozs7Ozs7Ozs7O0NBRGpCO0FBR0EsU0FBVSxVQUFWLENBQXFCLElBQXJCLEVBQTJCLE9BQTNCOzs7Ozs7MkJBQ2lCLFdBQVcsZ0JBQVgsQ0FBNEIsRUFBQyxLQUFJLEtBQUssT0FBTCxFQUFqQyxFQUFnRCxPQUFoRDs7Ozs7Ozs7Ozs7Q0FEakI7QUFHQSxTQUFVLFVBQVYsQ0FBcUIsSUFBckI7Ozs7OzsyQkFDaUIsV0FBVyxTQUFYLENBQXFCLElBQXJCOzs7Ozs7Ozs7OztDQURqQiIsImZpbGUiOiJTdG9yYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRiQ29uZmlnIGZyb20gJy4uL2RhdGFiYXNlLmNvbmZpZy5qcyc7XG5cbnZhciBjb2xsZWN0aW9uO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU3RvcmFnZShkYXRhYmFzZSl7XG4gICAgY29sbGVjdGlvbiA9IGRhdGFiYXNlLmNvbGxlY3Rpb24oZGJDb25maWcuY29sbGVjdGlvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0VXNlcjogZ2V0VXNlcixcbiAgICAgICAgdXBkYXRlVXNlcjogdXBkYXRlVXNlcixcbiAgICAgICAgaW5zZXJ0VXNlcjogaW5zZXJ0VXNlclxuICAgIH1cbn1cblxuZnVuY3Rpb24qIGdldFVzZXIodXJsKXtcbiAgICByZXR1cm4geWllbGQgY29sbGVjdGlvbi5maW5kT25lKHt1cmw6IHVybH0pO1xufVxuZnVuY3Rpb24qIHVwZGF0ZVVzZXIodXNlciwgdXBkYXRlcyl7XG4gICAgcmV0dXJuIHlpZWxkIGNvbGxlY3Rpb24uZmluZE9uZUFuZFVwZGF0ZSh7X2lkOnVzZXIuaGFzaF9pZH0sIHVwZGF0ZXMpO1xufVxuZnVuY3Rpb24qIGluc2VydFVzZXIodXNlcil7XG4gICAgcmV0dXJuIHlpZWxkIGNvbGxlY3Rpb24uaW5zZXJ0T25lKHVzZXIpO1xufSJdfQ==
//# sourceMappingURL=Storage.js.map
