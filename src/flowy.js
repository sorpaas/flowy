var express = require('express');
var app = express();

app.all("*", function(req, res) {
  
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});