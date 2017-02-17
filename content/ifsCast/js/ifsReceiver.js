'use strict';

var MESSAGE_BUS_NAMESPACE = 'urn:x-cast:io.mainframe.ifsCast';

var IfsReceiver = function (isDebug) {
  this._debug = isDebug;

  if (!this.isLiveSystem()) {
    this.log('Local testing mode');
    var playlistCommand = JSON.stringify({
      "type": "playlist",
      "obj": {
        metaUrl: "https://www.kreativitaet-trifft-technik.de/media/ifs-images/meta_cc.jsonp.js",
        thumbUrl: "https://www.kreativitaet-trifft-technik.de/media/ifs-images/",
        startIndex: 100
      }
    });
    var msg = {
      senderId: 'demo',
      data: playlistCommand
    };

    setTimeout((function () {
      this.handleMessage(msg);
    }).bind(this), 500);
  } else {
    this.initCastReceiver();
  }
};

IfsReceiver.prototype.log = function log(/* var args */) {
  if (!this._debug) {
    return;
  }
  var args = Array.from(arguments);
  console.log.apply(this, args);
};

IfsReceiver.prototype.initCastReceiver = function () {
  if (this._debug) {
    cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
  }

  this.log('Starting Receiver Manager');
  this._castReceiverManager = cast.receiver.CastReceiverManager.getInstance();

  // handler for the 'ready' event
  this._castReceiverManager.onReady = (function (event) {
    this.log('Received Ready event: ' + JSON.stringify(event.data));
    this._castReceiverManager.setApplicationState("Application status is ready...");
  }).bind(this);

  // handler for 'senderconnected' event
  this._castReceiverManager.onSenderConnected = (function (event) {
    this.log('Received Sender Connected event: ' + event.data);
    this.log(this._castReceiverManager.getSender(event.data).userAgent);
  }).bind(this);

  // handler for 'senderdisconnected' event
  this._castReceiverManager.onSenderDisconnected = (function (event) {
    this.log('Received Sender Disconnected event: ' + event.data);
  }).bind(this);

  // handler for 'systemvolumechanged' event
  this._castReceiverManager.onSystemVolumeChanged = (function (event) {
    this.log('Received System Volume Changed event: ' + event.data['level'] + ' ' + event.data['muted']);
  }).bind(this);

  // create a CastMessageBus to handle messages for a custom namespace
  this._messageBus = this._castReceiverManager.getCastMessageBus(MESSAGE_BUS_NAMESPACE);

  // handler for the CastMessageBus message event
  this._messageBus.onMessage = this.handleMessage.bind(this);

  // initialize the CastReceiverManager with an application status message
  // https://developers.google.com/cast/docs/reference/receiver/cast.receiver.CastReceiverManager.Config
  this._castReceiverManager.start({
    statusText: "Application is starting"
    // in sec
    // , maxInactivity: 60 * 60 * 4
  });
  this.log('Receiver Manager started');
};


IfsReceiver.prototype.handleMessage = function (event) {
  this.log('Message [' + event.senderId + ']: ', event.data);
  var message = JSON.parse(event.data);

  if (message.type == 'playlist') {
    return this.displayPhotosFromPlaylist(message.obj);
  }

  console.warn("Unable to handle message: ", message);
};

IfsReceiver.prototype.displayPhotosFromPlaylist = function (options) {
  $.ajax({
    url: options.metaUrl,
    jsonp: false,
    jsonpCallback: 'ifsImagesDataCallback',
    dataType: 'jsonp',
    context: this,
    success: function (response) {
      // this.log('got from server:', response); // server response

      var photoData = response.map(function (image) {
        return {
          url: options.thumbUrl + image.filename,
          title: this.formatTs(image.time),
          subtitle: ''
        };
      }, this);

      if (options.startIndex) {
        var withNexIndex = photoData.slice(options.startIndex).concat(photoData.slice(0, options.startIndex));
        photoData = withNexIndex;
      }

      this.displayPhotos(photoData);
    }
  });
};

IfsReceiver.prototype.displayPhotos = function (photos) {
  var width = $(window).width();
  var height = $(window).height();
  $('#slideShow')
    .append($('<canvas id="kenburns" width="' + width + 'px" height="' + height + 'px"></canvas>'))
    .show();

  var imagesUrls = photos.map(function (photo) {
    return photo.url;
  });

  var lastIndex = -1;
  var currentTitle = null;

  var self = this;

  $('#kenburns').kenburns({
    images: imagesUrls,
    frames_per_second: 24,
    display_time: 10000,
    fade_time: 2000,
    zoom: 1.05,
    background_color: '#ffffff',
    post_render_callback: function ($canvas, context, imageIndex) {
      // Called after the effect is rendered
      // Draw anything you like on to of the canvas
      if (imageIndex !== lastIndex) {
        currentTitle = photos[imageIndex].title;
        lastIndex = imageIndex;
      }

      if (currentTitle) {
        context.save();
        var titleWidth = self.drawText(context, currentTitle, 'bold 30px sans-serif', 10, height - 10);
        context.restore();
      }
    }
  });

  if (this._castReceiverManager) {
    this._castReceiverManager.setApplicationState("Playing slideshow");
  }
};

IfsReceiver.prototype.drawText = function (context, text, font, x, y) {
  context.globalAlpha = 0.6;
  // font
  context.fillStyle = '#000';
  context.font = font;
  var metric = context.measureText(text);

  // shdow
  context.fillStyle = '#fff';
  context.shadowOffsetX = 3;
  context.shadowOffsetY = 3;
  context.shadowBlur = 4;
  context.shadowColor = 'rgba(0, 0, 0, 0.5)';

  // draw text
  context.fillText(text, 0 + x, y);
  context.globalAlpha = 1;
  return metric.width;
};

IfsReceiver.prototype.isLiveSystem = function () {
  return location.hostname !== 'localhost';
};

IfsReceiver.prototype.zeroFill = function (number) {
  if (number >= 10) {
    return '' + number;
  }
  return '0' + number;
};

IfsReceiver.prototype.formatTs = function (ts) {
  if (!ts) {
    return '';
  }
  var d = new Date(ts);
  return this.zeroFill(d.getDate()) + '.' + this.zeroFill(d.getMonth() + 1) + '.' + d.getFullYear() + ' '
    + this.zeroFill(d.getHours()) + ':' + this.zeroFill(d.getMinutes()) + ':' + this.zeroFill(d.getSeconds());
};
