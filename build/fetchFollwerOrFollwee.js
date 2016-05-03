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
                'x-requested-with': 'XMLHttpRequest'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZldGNoRm9sbHdlck9yRm9sbHdlZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztrQkFLd0I7O0FBTHhCOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFZSxTQUFTLHFCQUFULENBQStCLE9BQS9CLEVBQXdDLE1BQXhDLEVBQWdEO0FBQzNELFFBQUksT0FBTyxRQUFRLElBQVIsQ0FEZ0Q7QUFFM0QsUUFBSSxjQUFjLFFBQVEsV0FBUixDQUZ5QztBQUczRCxRQUFJLGVBQWUsY0FBYyxLQUFLLElBQUwsQ0FBVSxLQUFLLGNBQUwsR0FBc0IsRUFBdEIsQ0FBeEIsR0FBb0QsS0FBSyxJQUFMLENBQVUsS0FBSyxjQUFMLEdBQXNCLEVBQXRCLENBQTlELENBSHdDO0FBSTNELFFBQUksVUFBVSxFQUFWLENBSnVEO0FBSzNELFNBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFlBQUosRUFBa0IsR0FBbEMsRUFBdUM7QUFDbkMsZ0JBQVEsSUFBUixDQUFhLElBQUksRUFBSixDQUFiLENBRG1DO0tBQXZDO0FBR0EsV0FBTyxtQkFBUSxHQUFSLENBQVksT0FBWixFQUNIO2VBQVUsb0JBQW9CLElBQXBCLEVBQTBCLE1BQTFCLEVBQWtDLFdBQWxDLEVBQStDLE1BQS9DO0tBQVYsRUFDQSxFQUFFLGFBQWEsaUJBQU8sV0FBUCxHQUFxQixpQkFBTyxXQUFQLEdBQXFCLENBQTFDLEVBRlosRUFJTixJQUpNLENBSUQ7ZUFBUyxpQkFBRSxPQUFGLENBQVUsS0FBVjtLQUFULENBSk4sQ0FSMkQ7Q0FBaEQ7O0FBZWYsU0FBUyxtQkFBVCxDQUE2QixJQUE3QixFQUFtQyxNQUFuQyxFQUEyQyxXQUEzQyxFQUF3RCxNQUF4RCxFQUFnRTtBQUM1RCxXQUFPLElBQVAsQ0FBWSxRQUFaLEVBQXFCLFVBQVUsS0FBSyxJQUFMLEdBQVksTUFBdEIsR0FBK0IsTUFBL0IsR0FBd0MsR0FBeEMsSUFBK0MsU0FBUyxFQUFULENBQS9DLEdBQThELElBQTlELElBQXNFLGNBQWMsTUFBZCxHQUF1QixLQUF2QixDQUF0RSxDQUFyQixDQUQ0RDtBQUU1RCxZQUFRLEdBQVIsQ0FBWSxVQUFVLEtBQUssSUFBTCxHQUFZLE1BQXRCLEdBQStCLE1BQS9CLEdBQXdDLEdBQXhDLElBQStDLFNBQVMsRUFBVCxDQUEvQyxHQUE4RCxJQUE5RCxJQUFzRSxjQUFjLE1BQWQsR0FBdUIsS0FBdkIsQ0FBdEUsQ0FBWixDQUY0RDtBQUc1RCxRQUFJLFNBQVMsZ0ZBQWdGLE9BQWhGLENBQXdGLGFBQXhGLEVBQXVHLE1BQXZHLEVBQStHLE9BQS9HLENBQXVILGFBQXZILEVBQXNJLEtBQUssT0FBTCxDQUEvSSxDQUh3RDtBQUk1RCxXQUFPLHVCQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDcEMsK0JBQVE7QUFDSixvQkFBUSxNQUFSO0FBQ0EsaUJBQUssY0FBYyxtREFBZCxHQUFvRSxtREFBcEU7QUFDTCxrQkFBTTtBQUNGLHdCQUFRLE1BQVI7QUFDQSx3QkFBUSxNQUFSO0FBQ0EsdUJBQU8saUJBQU8sS0FBUDthQUhYO0FBS0EscUJBQVM7QUFDTCwwQkFBVSxpQkFBTyxNQUFQO0FBQ1YsZ0NBQWdCLGtEQUFoQjtBQUNBLGlDQUFpQixVQUFqQjtBQUNBLG9DQUFvQixnQkFBcEI7YUFKSjtBQU1BLHFCQUFTLElBQVQ7U0FkSixFQWVHLFVBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxJQUFYLEVBQW9CO0FBQ25CLGdCQUFJLE1BQU0sRUFBTixDQURlO0FBRW5CLGdCQUFJO0FBQ0Esb0JBQUksSUFBSixFQUFVO0FBQ04sMEJBQU0sS0FBSyxLQUFMLENBQVcsSUFBWCxFQUFpQixHQUFqQixDQUFxQixHQUFyQixDQUF5QixTQUF6QixDQUFOLENBRE07aUJBQVYsTUFFTztBQUNILDBCQUFPLG1CQUFQLENBREc7aUJBRlA7YUFESixDQU1FLE9BQU8sQ0FBUCxFQUFVO0FBQ1Isd0JBQVEsR0FBUixDQUFZLHFCQUFaLEVBRFE7QUFFUix3QkFBUSxHQUFSLENBQVksQ0FBWixFQUFlLElBQWYsRUFGUTtBQUdSLHdCQUFRLEdBQVIsQ0FBWSxxQkFBWixFQUhRO2FBQVY7QUFLRixnQkFBSSxHQUFKLEVBQVM7QUFDTCxvQkFBSSxJQUFJLElBQUosSUFBWSxXQUFaLElBQTJCLElBQUksSUFBSixJQUFZLGlCQUFaLEVBQStCO0FBQzFELDRCQUFRLG9CQUFvQixJQUFwQixFQUEwQixNQUExQixFQUFrQyxXQUFsQyxFQUErQyxNQUEvQyxDQUFSLEVBRDBEO2lCQUE5RCxNQUVPO0FBQ0gsMkJBQU8sR0FBUCxFQURHO2lCQUZQO2FBREosTUFNTztBQUNILHdCQUFRLEdBQVIsRUFERzthQU5QO1NBYkQsQ0FmSCxDQURvQztLQUFyQixDQUFuQixDQUo0RDtDQUFoRTs7QUE4Q0EsU0FBUyxTQUFULENBQW1CLElBQW5CLEVBQXlCO0FBQ3JCLFFBQUksU0FBUyxFQUFULENBRGlCO0FBRXJCLFFBQUksTUFBTSxvQkFBTjs7QUFGaUIsUUFJakIsTUFBTSxvREFBTixDQUppQjtBQUtyQixRQUFJLElBQUosQ0FBUyxJQUFULEVBTHFCO0FBTXJCLFdBQU8sT0FBUCxHQUFpQixPQUFPLEVBQVA7OztBQU5JLE9BU3JCLENBQUksSUFBSixDQUFTLElBQVQsRUFUcUI7QUFVckIsV0FBTyxHQUFQLEdBQWEsT0FBTyxFQUFQLENBVlE7QUFXckIsV0FBTyxNQUFQLENBWHFCO0NBQXpCOztBQWNBLFNBQVMsVUFBVCxDQUFvQixDQUFwQixFQUF1QjtBQUNuQixZQUFRLEdBQVIsQ0FBWSxDQUFaLEVBRG1CO0FBRW5CLFdBQU8sQ0FBUCxDQUZtQjtDQUF2QiIsImZpbGUiOiJmZXRjaEZvbGx3ZXJPckZvbGx3ZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0JztcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBjb25maWcgZnJvbSAnLi4vc3BpZGVyLmNvbmZpZyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmZXRjaEZvbGx3ZXJPckZvbGx3ZWUob3B0aW9ucywgc29ja2V0KSB7XG4gICAgdmFyIHVzZXIgPSBvcHRpb25zLnVzZXI7XG4gICAgdmFyIGlzRm9sbG93ZWVzID0gb3B0aW9ucy5pc0ZvbGxvd2VlcztcbiAgICB2YXIgZ3JvdW5wQW1vdW50ID0gaXNGb2xsb3dlZXMgPyBNYXRoLmNlaWwodXNlci5mb2xsb3dlZUFtb3VudCAvIDIwKSA6IE1hdGguY2VpbCh1c2VyLmZvbGxvd2VyQW1vdW50IC8gMjApO1xuICAgIHZhciBvZmZzZXRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91bnBBbW91bnQ7IGkrKykge1xuICAgICAgICBvZmZzZXRzLnB1c2goaSAqIDIwKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UubWFwKG9mZnNldHMsXG4gICAgICAgIG9mZnNldCA9PiBnZXRGb2xsd2VyT3JGb2xsd2VlKHVzZXIsIG9mZnNldCwgaXNGb2xsb3dlZXMsIHNvY2tldCksXG4gICAgICAgIHsgY29uY3VycmVuY3k6IGNvbmZpZy5jb25jdXJyZW5jeSA/IGNvbmZpZy5jb25jdXJyZW5jeSA6IDMgfVxuICAgIClcbiAgICAudGhlbihhcnJheSA9PiBfLmZsYXR0ZW4oYXJyYXkpKVxufVxuXG5mdW5jdGlvbiBnZXRGb2xsd2VyT3JGb2xsd2VlKHVzZXIsIG9mZnNldCwgaXNGb2xsb3dlZXMsIHNvY2tldCkge1xuICAgIHNvY2tldC5lbWl0KCdub3RpY2UnLCflvIDlp4vmipPlj5YgJyArIHVzZXIubmFtZSArICcg55qE56ysICcgKyBvZmZzZXQgKyAnLScgKyAob2Zmc2V0ICsgMjApICsgJyDkvY0nICsgKGlzRm9sbG93ZWVzID8gJ+WFs+azqOeahOS6uicgOiAn5YWz5rOo6ICFJykpO1xuICAgIGNvbnNvbGUubG9nKCflvIDlp4vmipPlj5YgJyArIHVzZXIubmFtZSArICcg55qE56ysICcgKyBvZmZzZXQgKyAnLScgKyAob2Zmc2V0ICsgMjApICsgJyDkvY0nICsgKGlzRm9sbG93ZWVzID8gJ+WFs+azqOeahOS6uicgOiAn5YWz5rOo6ICFJykpO1xuICAgIHZhciBwYXJhbXMgPSBcIntcXFwib2Zmc2V0XFxcIjp7e2NvdW50ZXJ9fSxcXFwib3JkZXJfYnlcXFwiOlxcXCJjcmVhdGVkXFxcIixcXFwiaGFzaF9pZFxcXCI6XFxcInt7aGFzaF9pZH19XFxcIn1cIi5yZXBsYWNlKC97e2NvdW50ZXJ9fS8sIG9mZnNldCkucmVwbGFjZSgve3toYXNoX2lkfX0vLCB1c2VyLmhhc2hfaWQpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IGlzRm9sbG93ZWVzID8gJ2h0dHBzOi8vd3d3LnpoaWh1LmNvbS9ub2RlL1Byb2ZpbGVGb2xsb3dlZXNMaXN0VjInIDogJ2h0dHBzOi8vd3d3LnpoaWh1LmNvbS9ub2RlL1Byb2ZpbGVGb2xsb3dlcnNMaXN0VjInLFxuICAgICAgICAgICAgZm9ybToge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJuZXh0XCIsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgX3hzcmY6IGNvbmZpZy5feHNyZlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnY29va2llJzogY29uZmlnLmNvb2tpZSxcbiAgICAgICAgICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOCcsXG4gICAgICAgICAgICAgICAgJ2NhY2hlLWNvbnRyb2wnOiAnbm8tY2FjaGUnLFxuICAgICAgICAgICAgICAgICd4LXJlcXVlc3RlZC13aXRoJzogJ1hNTEh0dHBSZXF1ZXN0J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDE1MDBcbiAgICAgICAgfSwgKGVyciwgcmVzLCBib2R5KSA9PiB7XG4gICAgICAgICAgICB2YXIgdG1wID0gW107XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IEpTT04ucGFyc2UoYm9keSkubXNnLm1hcChwYXJzZUNhcmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICgnQm9keSBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJcXG49PT09PT1FUlJPUj09PT09PVwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLCBib2R5KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PUVSUk9SPT09PT09XFxuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PSAnRVRJTUVET1VUJyB8fCBlcnIuY29kZSA9PSAnRVNPQ0tFVFRJTUVET1VUJykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGdldEZvbGx3ZXJPckZvbGx3ZWUodXNlciwgb2Zmc2V0LCBpc0ZvbGxvd2Vlcywgc29ja2V0KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodG1wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KVxufVxuXG5mdW5jdGlvbiBwYXJzZUNhcmQodGV4dCkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIgcmUxID0gL2RhdGEtaWQ9XFxcIihcXFMqKVxcXCIvZztcbiAgICAvLyB2YXIgcmUyID0gLzxoMiBjbGFzcz1cXFwiem0tbGlzdC1jb250ZW50LXRpdGxlXFxcIj4uKj4oLiopPFxcL2E+PFxcL2gyPi9nXG4gICAgdmFyIHJlMyA9IC9ocmVmPVxcXCIoaHR0cHM6XFwvXFwvd3d3XFwuemhpaHVcXC5jb21cXC9wZW9wbGVcXC9cXFMqKVxcXCIvZztcbiAgICByZTEuZXhlYyh0ZXh0KTtcbiAgICByZXN1bHQuaGFzaF9pZCA9IFJlZ0V4cC4kMTtcbiAgICAvLyByZTIuZXhlYyh0ZXh0KTtcbiAgICAvLyByZXN1bHQubmFtZSA9IFJlZ0V4cC4kMTtcbiAgICByZTMuZXhlYyh0ZXh0KTtcbiAgICByZXN1bHQudXJsID0gUmVnRXhwLiQxO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGNvbnNvbGVMb2coeCkge1xuICAgIGNvbnNvbGUubG9nKHgpO1xuICAgIHJldHVybiB4O1xufVxuIl19
//# sourceMappingURL=fetchFollwerOrFollwee.js.map
