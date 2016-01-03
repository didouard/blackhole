var Page = require("./libs/Page.js");

var config  = require("./config.json");

var page = new Page(config);
page.start(null, function (err, result) {
  if (err) console.error(err);
  console.log("Fini", page.getUrl());
});