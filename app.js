var express = require('express');
var config = require('config');
var app = express();

app.configure(function (){
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
  app.enable('trust proxy');
});

/**
 * ROUTES
 */
app.get('/', function (req, res){
  res.send('Everything is fine.');
});

/**
 * LET'S GO
 */
var server = app.listen(3000);
console.log('Listening on port 3000');

/**
 * SOCKET.IO
 */
var io = require('socket.io').listen(server);
io.configure(function () {
  io.set('log level', 1);
});
io.sockets.on('connection', function (socket) {
  socket.emit('tweets', tweets);
});

/**
 * TWITTER
 */
var twitter = require('ntwitter');
var t = new twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});

var search = 'coupure courant,coupure electricite';
var tweets = [];
t.stream('statuses/filter', { track: search}, function (stream) {
  stream.on('data', function (tweet) {
    tweets = [tweet].concat(tweets).slice(0, 50);
    io.sockets.emit('tweet', tweet);
 });
});
