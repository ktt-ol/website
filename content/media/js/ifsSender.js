'use strict';

var MESSAGE_BUS_NAMESPACE = 'urn:x-cast:io.mainframe.ifsCast';
var APPLICATION_ID = 'BDBCA6CF';

var IfsSender = function (supportCallback, isDebug) {
  this._debug = isDebug;
  this._session = null;
  this._waitingOnSession = false;

  this._tries = 0;
  this._checkForSupport(supportCallback);
};

IfsSender.prototype.log = function log(/* var args */) {
  if (!this._debug) {
    return;
  }
  var args = Array.from(arguments);
  console.log.apply(this, args);
};

IfsSender.prototype._checkForSupport = function (callback) {
  if (!chrome.cast || !chrome.cast.isAvailable) {
    if (this._tries++ > 10) {
      callback(false);
      return;
    }
    setTimeout(this._checkForSupport.bind(this, callback), 1000);
    return;
  }
  callback(true);
};


IfsSender.prototype.init = function (callback) {
  var sessionRequest = new chrome.cast.SessionRequest(APPLICATION_ID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    this._sessionListener.bind(this),
    this._receiverListener.bind(this),
    chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED
  );

  chrome.cast.initialize(apiConfig,
    (function ok() {
      this.log('chrome.cast.initialize... success');
      callback();
    }).bind(this),
    (function error() {
      this.log('chrome.cast.initialize... error!');
    }).bind(this));
};

IfsSender.prototype.play = function (startIndex) {
  this._startIndex = startIndex || 0;

  if (!this._session) {
    this._waitingOnSession = true;
    chrome.cast.requestSession(
      this._sessionListener.bind(this),
      function error(e) {
        console.log('connect error', e);
      });

    return;
  }

  this._sendMessage();
};

IfsSender.prototype._sendMessage = function () {
  this.log('Sending message, session: ', this._session);
  this._waitingOnSession = false;

  var playlist = {
    "type": "playlist",
    "obj": {
      metaUrl: "https://www.kreativitaet-trifft-technik.de/media/ifs-images/meta_cc.jsonp.js",
      thumbUrl: "https://www.kreativitaet-trifft-technik.de/media/ifs-images/",
      startIndex: this._startIndex
    }
  };
  this._session.sendMessage(MESSAGE_BUS_NAMESPACE, playlist);
};


/**
 * @param {!Object} A new session
 * This handles auto-join when a page is reloaded
 * When active session is detected, playback will automatically
 * join existing session and occur in Cast mode and media
 * status gets synced up with current media of the session
 */
IfsSender.prototype._sessionListener = function (session) {
  this._session = session;
  if (session) {
    this.log('Got session:', session);
    session.addUpdateListener(this._sessionUpdateListener.bind(this));

    if (this._waitingOnSession) {
      this._sendMessage();
    }
  }
};

/**
 * @param {string} e Receiver availability
 * This indicates availability of receivers but
 * does not provide a list of device IDs
 */
IfsSender.prototype._receiverListener = function (e) {
  if (e === 'available') {
    this.log("Receiver found.");
  }
  else {
    this.log("Receiver list is empty.");
  }
};


IfsSender.prototype._sessionUpdateListener = function (isAlive) {
  if (!isAlive) {
    this.log('Session ended.');
    this._session = null;
  }
};

