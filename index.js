var async   = require("myasync-eferrari");
var request = require("./libs/request.js");

var config  = require("./config.json");

var downloadImage = function (data, callback) {
  if (!data.url) return callback(new Error("Insert image url in data.url"));
  console.log("Start :", data.url);
  
  request(data, callback);
};

async.parallel(config.images, downloadImage, function (err, results) {
  if (err) console.error(err);
    console.log("All Download ended, results : ", results.length);
});