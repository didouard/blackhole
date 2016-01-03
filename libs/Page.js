var fs = require("fs");
var mUrl = require('url');
var path = require('path');
var async = require("myasync-eferrari");
var mkdirp = require("mkdirp");

var request = require("./request.js");
var config = require("../config.json");

var regex = /(https?:\/\/[\da-z\.-]+\.[a-z\.]{2,6}[\/\w \.-]*\/?)/g;
var pages = [];

var Page = function (data) {
  var url = mUrl.parse(data.url);
  var depth = data.depth;
  //console.log("new", data.url, "depth:", depth);
  var content;
  
  pages.push(this);
  
  this.getUrl = function () {
    return url.format();
  };
  
  var download = function (callback) {
    var index = request.add(url, function (err, data) {
      if (err) 
        return callback(err);
      if (!data) data = "";
      if (index == data.index) return callback(null, data);
    });
  };
  
  var parse = function (data, callback) {
    content = data;
    
    var match = data.match(regex);
    return callback(null, (match) ? match : []);
  };
  
  var launchChild = function (data, callback) {
    async.map(data, function (match, callback) {
      if (!match) return callback();
      
      for (var i = 0; i < pages.length; i++) {
        if (match == pages[i].getUrl()) return callback();
      }
      
      var data = {
        url: match
        , depth: depth - 1
      };
      var page = new Page(data);

      page.start(null, function () {});
      return callback();
    }, callback);
  };
  
  var save = function (data, callback) {
    var buildPath = function (callback) {
      var data = {};
      data.filename = path.join(config.output, url.host, (url.pathname == '/') ? '/index' : url.pathname);
      data.directory = path.dirname(data.filename);
      return callback(null, data);
    };
    
    /*var isDirectoryExist = function (data, callback) {
      return fs.stat(data.directory, function (err, stat) {
        if (err) return callback(err);
        data.isDirectoryExist = stat.isDirectory();
        return callback(null, data);
      });
    };*/
    
    var mkdir = function (data, callback) {
      return mkdirp(data.directory, function () {
        return callback(null, data);
      });
    };
    
    var writeFile = function (data, callback) {
      return fs.writeFile(data.filename, content, callback);
    };
    
    var jobs = [buildPath, mkdir, writeFile];
    return async.waterfall(jobs, callback);
  };
  
  this.start = function (data, callback) {
    if (depth < 1) return callback(null, null);
    
    var jobs = [download, parse, launchChild, save];
    //var jobs = [download, parse, launchChild];
    if (!callback) callback = function () {};
    async.waterfall(jobs, callback);
  };

};

module.exports = Page;