'use strict';
var http = require("http");
var https = require("https");
const util = require('util');
const events = require('events');

var config = require("../config.json");

var Request = function () {
  var self = this;
  var index = 0;
  var queue = [];
  var current = [];
  var done = [];
  
  events.call(this);
  
  this.add = function (data, callback) {
    var item = {
      url: data
      , callback: callback
      , index: index++
    };
    queue.push(item);
    this.emit('processQueue');
    this.display('queue', item.url);
  };
  
  this.on('processQueue', function() {
    while (current.length < config.requestMax && queue.length > 0) {
      var item = queue.shift();
      current.push(item);
      this.display('current', item.url);
      
      var moduleHttp = (/https/.test(item.url.protocol)) ? https : http;
      moduleHttp.get(item.url, function(response) {
        var body = '';
        response.setEncoding("utf8");
        response.on('data', function(d) {
          body += d;
        });
        response.on('end', function() {
          current.splice(current.indexOf(item));
          self.emit('processQueue');
          done.push(item);
          self.display('done', item.url);
          return item.callback(null, body);
        });
      }).on('error', function(e) {
        return item.callback(e);
      });
    }
  });
  
  this.display = function (action, url) {
    //process.stdout.clearLine();  // clear current text
    //process.stdout.cursorTo(0);  // move cursor to beginning of line
    process.stdout.write('Request:' + queue.length 
      + '/' + current.length 
      + '/' + done.length
      + ', last action:' + action 
      + ', url:' + url.format()
      + "\n"
    );
  };
};

// Inherit functions from `EventEmitter`'s prototype
util.inherits(Request, events);

module.exports = new Request;