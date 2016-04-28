var Spider = require('./build/Spider').Spider;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var dbConfig = require('./database.config.js');
var serverConfig = require('./server.config');
var co = require('co');
var MongoClient = require('mongodb').MongoClient;

var db;
io.on('connection', function(socket) {
    co(function *(){
      try {
        //======打開數據庫======//
        if(!db){
          var db = yield MongoClient.connect(`mongodb://${dbConfig.address}:${dbConfig.port}/${dbConfig.dbname}`);
          socket.emit('notice', '數據庫 ready');
        }
        socket.on('fetch start', function(data) {
            Spider(data.url, socket, db);
        });
      } catch (e) {
        console.log(e);
      }
    });
});
server.listen(serverConfig.socketPort);


app.use(bodyParser());// WARNING
app.use('/js', express.static('./client/build'));
app.use('/css', express.static('./client/build'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.get('/fetch', function(req, res) {
    res.sendFile(__dirname + '/client/fetch.html');
});
app.get('/display', function(req, res) {
    res.sendFile(__dirname + '/client/display.html');
});

app.listen(serverConfig.httpPort,function(){
	console.log('server start at 127.0.0.1:%s',this.address().port)
});
