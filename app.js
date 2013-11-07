var express = require('express');
var config = require('config');
var app = express();

$MAX_TWEETS_NB = 50;

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
var Twit = require('twit');
var t = new Twit({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token: config.access_token_key,
  access_token_secret: config.access_token_secret
});

var tweets;
initSearch(function (statuses) {
  tweets = statuses;
});

function initSearch(callback) {
  var search = 'coupure+courant OR coupure+courrant OR coupure+electricite';
  t.get('search/tweets', { q: search, result_type: 'recent', count: $MAX_TWEETS_NB }, function (err, reply) {
    if (err) return console.log(err);

    var statuses = [];
    reply.statuses.forEach(function (status) {
      statuses.push(formatTweet(status));
    });

    callback(statuses);
  });
}

var track = 'coupure courant,coupure courrant,coupure lectricit';
var stream = t.stream('statuses/filter', { track: track });
stream.on('tweet', function (tweet) {
  tweet = formatTweet(tweet);
  tweets = [tweet].concat(tweets).slice(0, $MAX_TWEETS_NB);
  io.sockets.emit('tweet', tweet);
});

function formatTweet(tweet) {
  return {
    id: tweet.id_str,
    text: tweet.text,
    created_at: tweet.created_at,
    user_id: tweet.user.id_str,
    user_name: tweet.user.screen_name,
    user_img: tweet.user.profile_image_url,
    coords: tweet.coordinates
  };
}
