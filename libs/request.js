var http = require("http");

var request = function (data, callback) {
  http.get(data.url, function(response) {
   var body = '';
      response.on('data', function(d) {
          body += d;
      });
      response.on('end', function() {
        console.log("Finish", data.url, "size : " + body.length);
        return callback(null, body);
      });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

module.exports = request;