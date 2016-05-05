import request from 'request';
import cheerio from 'cheerio';
import Promise from 'bluebird';
import config from '../spider.config';
import _ from 'lodash';

export default function fetchFollwerOrFollwee(options, socket) {
    var user = options.user;
    var isFollowees = options.isFollowees;
    var grounpAmount = isFollowees ? Math.ceil(user.followee||0 / 20) : Math.ceil(user.follower||0 / 20);
    var offsets = [];
    for (var i = 0; i < grounpAmount; i++) {
        offsets.push(i * 20);
    }
    return Promise.map(offsets,
        offset => getFollwerOrFollwee(user, offset, isFollowees, socket),
        { concurrency: config.concurrency ? config.concurrency : 3 }
    )
    .then(array => _.flatten(array))
}

function getFollwerOrFollwee(user, offset, isFollowees, socket) {
    socket.emit('notice','开始抓取 ' + user.name + ' 的第 ' + offset + '-' + (offset + 20) + ' 位' + (isFollowees ? '关注的人' : '关注者'));
    console.log('开始抓取 ' + user.name + ' 的第 ' + offset + '-' + (offset + 20) + ' 位' + (isFollowees ? '关注的人' : '关注者'));
    var params = JSON.stringify({offset: offset, order_by: "created", hash_id: user.id});
    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: isFollowees ? 'https://www.zhihu.com/node/ProfileFolloweesListV2' : 'https://www.zhihu.com/node/ProfileFollowersListV2',
            form: {
                method: "next",
                params: params,
                _xsrf: config._xsrf
            },
            headers: {
                'cookie': config.cookie,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'cache-control': 'no-cache',
                'x-requested-with': 'XMLHttpRequest'
            },
            timeout: 1500
        }, (err, res, body) => {
            var tmp = [];
            try {
                if (body) {
                    tmp = JSON.parse(body).msg.map(parseCard);
                } else {
                    throw ('Body is undefined');
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
                    reject(err)
                }
            } else {
                resolve(tmp);
            }
        })
    })
}

function parseCard(text) {
    var $ = cheerio.load(text);
    return {
        username: $('a[title][href]').attr('href').replace(/^\/people\//,'')
    };
}

function consoleLog(x) {
    console.log(x);
    return x;
}
