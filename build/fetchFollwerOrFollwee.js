'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = fetchFollwerOrFollwee;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _spider = require('../spider.config');

var _spider2 = _interopRequireDefault(_spider);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fetchFollwerOrFollwee(options, socket) {
    var user = options.user;
    var isFollowees = options.isFollowees;
    var grounpAmount = isFollowees ? Math.ceil(user.followeeAmount / 20) : Math.ceil(user.followerAmount / 20);
    var offsets = [];
    for (var i = 0; i < grounpAmount; i++) {
        offsets.push(i * 20);
    }
    return _bluebird2.default.map(offsets, function (offset) {
        return getFollwerOrFollwee(user, offset, isFollowees, socket);
    }, { concurrency: _spider2.default.concurrency ? _spider2.default.concurrency : 3 }).then(function (array) {
        return _lodash2.default.flatten(array);
    });
}

function getFollwerOrFollwee(user, offset, isFollowees, socket) {
    socket.emit('notice', '开始抓取 ' + user.name + ' 的第 ' + offset + '-' + (offset + 20) + ' 位' + (isFollowees ? '关注的人' : '关注者'));
    console.log('开始抓取 ' + user.name + ' 的第 ' + offset + '-' + (offset + 20) + ' 位' + (isFollowees ? '关注的人' : '关注者'));
    var params = "{\"offset\":{{counter}},\"order_by\":\"created\",\"hash_id\":\"{{hash_id}}\"}".replace(/{{counter}}/, offset).replace(/{{hash_id}}/, user.hash_id);
    return new _bluebird2.default(function (resolve, reject) {
        (0, _request2.default)({
            method: 'POST',
            url: isFollowees ? 'https://www.zhihu.com/node/ProfileFolloweesListV2' : 'https://www.zhihu.com/node/ProfileFollowersListV2',
            form: {
                method: "next",
                params: params,
                _xsrf: _spider2.default._xsrf
            },
            headers: {
                'cookie': _spider2.default.cookie,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'cache-control': 'no-cache',
                'x-requested-with': 'XMLHttpRequest',
                'accept': 'application/json'
            },
            timeout: 1500
        }, function (err, res, body) {
            var tmp = [];
            try {
                if (body) {
                    tmp = JSON.parse(body).msg.map(parseCard);
                } else {
                    throw 'Body is undefined';
                }
            } catch (e) {
                console.log("\n======ERROR======");
                console.log(e, body);
                console.log("======ERROR======\n");
            }
            if (err) {
                if (err.code == 'ETIMEDOUT' || err.code == 'ESOCKETTIMEDOUT') {
                    resolve(getFollwerOrFollwee(user, offset, isFollowees, socket));
                } else {
                    reject(err);
                }
            } else {
                resolve(tmp);
            }
        });
    });
}

function parseCard(text) {
    var result = {};
    var re1 = /data-id=\"(\S*)\"/g;
    // var re2 = /<h2 class=\"zm-list-content-title\">.*>(.*)<\/a><\/h2>/g
    var re3 = /href=\"(https:\/\/www\.zhihu\.com\/people\/\S*)\"/g;
    re1.exec(text);
    result.hash_id = RegExp.$1;
    // re2.exec(text);
    // result.name = RegExp.$1;
    re3.exec(text);
    result.url = RegExp.$1;
    return result;
}

function consoleLog(x) {
    console.log(x);
    return x;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZldGNoRm9sbHdlck9yRm9sbHdlZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztrQkFLd0I7O0FBTHhCOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFZSxTQUFTLHFCQUFULENBQStCLE9BQS9CLEVBQXdDLE1BQXhDLEVBQWdEO0FBQzNELFFBQUksT0FBTyxRQUFRLElBQVIsQ0FEZ0Q7QUFFM0QsUUFBSSxjQUFjLFFBQVEsV0FBUixDQUZ5QztBQUczRCxRQUFJLGVBQWUsY0FBYyxLQUFLLElBQUwsQ0FBVSxLQUFLLGNBQUwsR0FBc0IsRUFBdEIsQ0FBeEIsR0FBb0QsS0FBSyxJQUFMLENBQVUsS0FBSyxjQUFMLEdBQXNCLEVBQXRCLENBQTlELENBSHdDO0FBSTNELFFBQUksVUFBVSxFQUFWLENBSnVEO0FBSzNELFNBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFlBQUosRUFBa0IsR0FBbEMsRUFBdUM7QUFDbkMsZ0JBQVEsSUFBUixDQUFhLElBQUksRUFBSixDQUFiLENBRG1DO0tBQXZDO0FBR0EsV0FBTyxtQkFBUSxHQUFSLENBQVksT0FBWixFQUNIO2VBQVUsb0JBQW9CLElBQXBCLEVBQTBCLE1BQTFCLEVBQWtDLFdBQWxDLEVBQStDLE1BQS9DO0tBQVYsRUFDQSxFQUFFLGFBQWEsaUJBQU8sV0FBUCxHQUFxQixpQkFBTyxXQUFQLEdBQXFCLENBQTFDLEVBRlosRUFJTixJQUpNLENBSUQ7ZUFBUyxpQkFBRSxPQUFGLENBQVUsS0FBVjtLQUFULENBSk4sQ0FSMkQ7Q0FBaEQ7O0FBZWYsU0FBUyxtQkFBVCxDQUE2QixJQUE3QixFQUFtQyxNQUFuQyxFQUEyQyxXQUEzQyxFQUF3RCxNQUF4RCxFQUFnRTtBQUM1RCxXQUFPLElBQVAsQ0FBWSxRQUFaLEVBQXFCLFVBQVUsS0FBSyxJQUFMLEdBQVksTUFBdEIsR0FBK0IsTUFBL0IsR0FBd0MsR0FBeEMsSUFBK0MsU0FBUyxFQUFULENBQS9DLEdBQThELElBQTlELElBQXNFLGNBQWMsTUFBZCxHQUF1QixLQUF2QixDQUF0RSxDQUFyQixDQUQ0RDtBQUU1RCxZQUFRLEdBQVIsQ0FBWSxVQUFVLEtBQUssSUFBTCxHQUFZLE1BQXRCLEdBQStCLE1BQS9CLEdBQXdDLEdBQXhDLElBQStDLFNBQVMsRUFBVCxDQUEvQyxHQUE4RCxJQUE5RCxJQUFzRSxjQUFjLE1BQWQsR0FBdUIsS0FBdkIsQ0FBdEUsQ0FBWixDQUY0RDtBQUc1RCxRQUFJLFNBQVMsZ0ZBQWdGLE9BQWhGLENBQXdGLGFBQXhGLEVBQXVHLE1BQXZHLEVBQStHLE9BQS9HLENBQXVILGFBQXZILEVBQXNJLEtBQUssT0FBTCxDQUEvSSxDQUh3RDtBQUk1RCxXQUFPLHVCQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDcEMsK0JBQVE7QUFDSixvQkFBUSxNQUFSO0FBQ0EsaUJBQUssY0FBYyxtREFBZCxHQUFvRSxtREFBcEU7QUFDTCxrQkFBTTtBQUNGLHdCQUFRLE1BQVI7QUFDQSx3QkFBUSxNQUFSO0FBQ0EsdUJBQU8saUJBQU8sS0FBUDthQUhYO0FBS0EscUJBQVM7QUFDTCwwQkFBVSxpQkFBTyxNQUFQO0FBQ1YsZ0NBQWdCLGtEQUFoQjtBQUNBLGlDQUFpQixVQUFqQjtBQUNBLG9DQUFvQixnQkFBcEI7QUFDQSwwQkFBVSxrQkFBVjthQUxKO0FBT0EscUJBQVMsSUFBVDtTQWZKLEVBZ0JHLFVBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxJQUFYLEVBQW9CO0FBQ25CLGdCQUFJLE1BQU0sRUFBTixDQURlO0FBRW5CLGdCQUFJO0FBQ0Esb0JBQUksSUFBSixFQUFVO0FBQ04sMEJBQU0sS0FBSyxLQUFMLENBQVcsSUFBWCxFQUFpQixHQUFqQixDQUFxQixHQUFyQixDQUF5QixTQUF6QixDQUFOLENBRE07aUJBQVYsTUFFTztBQUNILDBCQUFPLG1CQUFQLENBREc7aUJBRlA7YUFESixDQU1FLE9BQU8sQ0FBUCxFQUFVO0FBQ1Isd0JBQVEsR0FBUixDQUFZLHFCQUFaLEVBRFE7QUFFUix3QkFBUSxHQUFSLENBQVksQ0FBWixFQUFlLElBQWYsRUFGUTtBQUdSLHdCQUFRLEdBQVIsQ0FBWSxxQkFBWixFQUhRO2FBQVY7QUFLRixnQkFBSSxHQUFKLEVBQVM7QUFDTCxvQkFBSSxJQUFJLElBQUosSUFBWSxXQUFaLElBQTJCLElBQUksSUFBSixJQUFZLGlCQUFaLEVBQStCO0FBQzFELDRCQUFRLG9CQUFvQixJQUFwQixFQUEwQixNQUExQixFQUFrQyxXQUFsQyxFQUErQyxNQUEvQyxDQUFSLEVBRDBEO2lCQUE5RCxNQUVPO0FBQ0gsMkJBQU8sR0FBUCxFQURHO2lCQUZQO2FBREosTUFNTztBQUNILHdCQUFRLEdBQVIsRUFERzthQU5QO1NBYkQsQ0FoQkgsQ0FEb0M7S0FBckIsQ0FBbkIsQ0FKNEQ7Q0FBaEU7O0FBK0NBLFNBQVMsU0FBVCxDQUFtQixJQUFuQixFQUF5QjtBQUNyQixRQUFJLFNBQVMsRUFBVCxDQURpQjtBQUVyQixRQUFJLE1BQU0sb0JBQU47O0FBRmlCLFFBSWpCLE1BQU0sb0RBQU4sQ0FKaUI7QUFLckIsUUFBSSxJQUFKLENBQVMsSUFBVCxFQUxxQjtBQU1yQixXQUFPLE9BQVAsR0FBaUIsT0FBTyxFQUFQOzs7QUFOSSxPQVNyQixDQUFJLElBQUosQ0FBUyxJQUFULEVBVHFCO0FBVXJCLFdBQU8sR0FBUCxHQUFhLE9BQU8sRUFBUCxDQVZRO0FBV3JCLFdBQU8sTUFBUCxDQVhxQjtDQUF6Qjs7QUFjQSxTQUFTLFVBQVQsQ0FBb0IsQ0FBcEIsRUFBdUI7QUFDbkIsWUFBUSxHQUFSLENBQVksQ0FBWixFQURtQjtBQUVuQixXQUFPLENBQVAsQ0FGbUI7Q0FBdkIiLCJmaWxlIjoiZmV0Y2hGb2xsd2VyT3JGb2xsd2VlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlcXVlc3QgZnJvbSAncmVxdWVzdCc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4uL3NwaWRlci5jb25maWcnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmV0Y2hGb2xsd2VyT3JGb2xsd2VlKG9wdGlvbnMsIHNvY2tldCkge1xuICAgIHZhciB1c2VyID0gb3B0aW9ucy51c2VyO1xuICAgIHZhciBpc0ZvbGxvd2VlcyA9IG9wdGlvbnMuaXNGb2xsb3dlZXM7XG4gICAgdmFyIGdyb3VucEFtb3VudCA9IGlzRm9sbG93ZWVzID8gTWF0aC5jZWlsKHVzZXIuZm9sbG93ZWVBbW91bnQgLyAyMCkgOiBNYXRoLmNlaWwodXNlci5mb2xsb3dlckFtb3VudCAvIDIwKTtcbiAgICB2YXIgb2Zmc2V0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdW5wQW1vdW50OyBpKyspIHtcbiAgICAgICAgb2Zmc2V0cy5wdXNoKGkgKiAyMCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLm1hcChvZmZzZXRzLFxuICAgICAgICBvZmZzZXQgPT4gZ2V0Rm9sbHdlck9yRm9sbHdlZSh1c2VyLCBvZmZzZXQsIGlzRm9sbG93ZWVzLCBzb2NrZXQpLFxuICAgICAgICB7IGNvbmN1cnJlbmN5OiBjb25maWcuY29uY3VycmVuY3kgPyBjb25maWcuY29uY3VycmVuY3kgOiAzIH1cbiAgICApXG4gICAgLnRoZW4oYXJyYXkgPT4gXy5mbGF0dGVuKGFycmF5KSlcbn1cblxuZnVuY3Rpb24gZ2V0Rm9sbHdlck9yRm9sbHdlZSh1c2VyLCBvZmZzZXQsIGlzRm9sbG93ZWVzLCBzb2NrZXQpIHtcbiAgICBzb2NrZXQuZW1pdCgnbm90aWNlJywn5byA5aeL5oqT5Y+WICcgKyB1c2VyLm5hbWUgKyAnIOeahOesrCAnICsgb2Zmc2V0ICsgJy0nICsgKG9mZnNldCArIDIwKSArICcg5L2NJyArIChpc0ZvbGxvd2VlcyA/ICflhbPms6jnmoTkuronIDogJ+WFs+azqOiAhScpKTtcbiAgICBjb25zb2xlLmxvZygn5byA5aeL5oqT5Y+WICcgKyB1c2VyLm5hbWUgKyAnIOeahOesrCAnICsgb2Zmc2V0ICsgJy0nICsgKG9mZnNldCArIDIwKSArICcg5L2NJyArIChpc0ZvbGxvd2VlcyA/ICflhbPms6jnmoTkuronIDogJ+WFs+azqOiAhScpKTtcbiAgICB2YXIgcGFyYW1zID0gXCJ7XFxcIm9mZnNldFxcXCI6e3tjb3VudGVyfX0sXFxcIm9yZGVyX2J5XFxcIjpcXFwiY3JlYXRlZFxcXCIsXFxcImhhc2hfaWRcXFwiOlxcXCJ7e2hhc2hfaWR9fVxcXCJ9XCIucmVwbGFjZSgve3tjb3VudGVyfX0vLCBvZmZzZXQpLnJlcGxhY2UoL3t7aGFzaF9pZH19LywgdXNlci5oYXNoX2lkKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZXF1ZXN0KHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiBpc0ZvbGxvd2VlcyA/ICdodHRwczovL3d3dy56aGlodS5jb20vbm9kZS9Qcm9maWxlRm9sbG93ZWVzTGlzdFYyJyA6ICdodHRwczovL3d3dy56aGlodS5jb20vbm9kZS9Qcm9maWxlRm9sbG93ZXJzTGlzdFYyJyxcbiAgICAgICAgICAgIGZvcm06IHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwibmV4dFwiLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgICAgICAgIF94c3JmOiBjb25maWcuX3hzcmZcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ2Nvb2tpZSc6IGNvbmZpZy5jb29raWUsXG4gICAgICAgICAgICAgICAgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLTgnLFxuICAgICAgICAgICAgICAgICdjYWNoZS1jb250cm9sJzogJ25vLWNhY2hlJyxcbiAgICAgICAgICAgICAgICAneC1yZXF1ZXN0ZWQtd2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAgICAgICAgICAgJ2FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDBcbiAgICAgICAgfSwgKGVyciwgcmVzLCBib2R5KSA9PiB7XG4gICAgICAgICAgICB2YXIgdG1wID0gW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IEpTT04ucGFyc2UoYm9keSkubXNnLm1hcChwYXJzZUNhcmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICgnQm9keSBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG49PT09PT1FUlJPUj09PT09PVwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLCBib2R5KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PUVSUk9SPT09PT09XFxuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PSAnRVRJTUVET1VUJyB8fCBlcnIuY29kZSA9PSAnRVNPQ0tFVFRJTUVET1VUJykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGdldEZvbGx3ZXJPckZvbGx3ZWUodXNlciwgb2Zmc2V0LCBpc0ZvbGxvd2Vlcywgc29ja2V0KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodG1wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KVxufVxuXG5mdW5jdGlvbiBwYXJzZUNhcmQodGV4dCkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIgcmUxID0gL2RhdGEtaWQ9XFxcIihcXFMqKVxcXCIvZztcbiAgICAvLyB2YXIgcmUyID0gLzxoMiBjbGFzcz1cXFwiem0tbGlzdC1jb250ZW50LXRpdGxlXFxcIj4uKj4oLiopPFxcL2E+PFxcL2gyPi9nXG4gICAgdmFyIHJlMyA9IC9ocmVmPVxcXCIoaHR0cHM6XFwvXFwvd3d3XFwuemhpaHVcXC5jb21cXC9wZW9wbGVcXC9cXFMqKVxcXCIvZztcbiAgICByZTEuZXhlYyh0ZXh0KTtcbiAgICByZXN1bHQuaGFzaF9pZCA9IFJlZ0V4cC4kMTtcbiAgICAvLyByZTIuZXhlYyh0ZXh0KTtcbiAgICAvLyByZXN1bHQubmFtZSA9IFJlZ0V4cC4kMTtcbiAgICByZTMuZXhlYyh0ZXh0KTtcbiAgICByZXN1bHQudXJsID0gUmVnRXhwLiQxO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGNvbnNvbGVMb2coeCkge1xuICAgIGNvbnNvbGUubG9nKHgpO1xuICAgIHJldHVybiB4O1xufVxuIl19
//# sourceMappingURL=fetchFollwerOrFollwee.js.map
