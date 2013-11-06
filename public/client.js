var socket = io.connect('http://'+window.location.host);

var tweets = [];
socket.on('tweets', function (ts) {
  tweets = ts;
  drawTweets(tweets);
});
socket.on('tweet', function (tweet) {
  tweets = [tweet].concat(tweets).slice(0, 50);
  drawTweets(tweets);
});

function drawTweets(tweets) {
  var html = '';
  tweets.forEach(function (tweet) {
    html += ''+
      '<div class="media tweet">\n'+
        '<a class="pull-right" href="//twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id_str+'" target="_blank">\n'+
          '<img class="media-object thumbnail" src="'+tweet.user.profile_image_url+'">\n'+
        '</a>\n'+
        '<div class="media-body">\n'+
          '<h4 class="media-heading">'+tweet.text+'</h4>\n'+
          '<a href="//twitter.com/'+tweet.user.screen_name+'" class="author" target="_blank">@'+tweet.user.screen_name+'</a>\n'+
          '<a href="//twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id_str+'" class="date" target="_blank">'+timeSince(new Date(tweet.created_at))+'</a>\n';

    if (tweet.coordinates) {
      var coords = tweet.coordinates.coordinates;
      html += '<a href="//maps.google.com/maps?q='+coords[1]+','+coords[0]+'" class="mapmarker" target="_blank"><i class="glyphicon glyphicon-map-marker"></i></a>\n';
    }

    html += '</div>\n</div>';
  });

  $('#tweets').html(html);
}

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);
  if (interval > 1) return date;

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return date;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return date;

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' hours';

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' minutes';

  if (seconds >= 30) return Math.floor(seconds) + ' seconds';
  return 'now';
}
