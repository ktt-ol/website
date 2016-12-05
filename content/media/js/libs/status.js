/* JS helpers for Space Status Widget */

'use strict';

var SpaceStatus = (function () {
  var baseUrl = '//status.kreativitaet-trifft-technik.de/';
  // var baseUrl = 'http://localhost:9000/';
  
  // default
  var language = 'de';

  var BASE = {
    "open+": {
      "class": "panel-success",
      "de": "Hochgefahren",
      "en": "Open House"
    },
    "open": {
      "class": "panel-success",
      "de": "Hochgefahren",
      "en": "Open"
    },
    "member": {
      "class": "panel-warning",
      "de": "Nur Mitglieder",
      "en": "Members Only"
    },
    "keyholder": {
      "class": "panel-warning",
      "de": "Nur Keyholder",
      "en": "Keyholder Only"
    },
    "none": {
      "class": "panel-danger",
      "de": "Runtergefahren",
      "en": "Closed"
    },
    "closing": {
      "class": "panel-warning",
      "de": "Am Schließen",
      "en": "Closing"
    }
  };

  var SPACE = $.extend(true, {}, BASE, {
    "domId": 'statusBox',
    "open+": {
      "logo": "/media/img/mainframe-open-plus.svg"
    },
    "open": {
      "logo": "/media/img/mainframe-open.svg"
    },
    "member": {
      "logo": "/media/img/mainframe-member.svg"
    },
    "keyholder": {
      "logo": "/media/img/mainframe-keyholder.svg"
    },
    "none": {
      "logo": "/media/img/mainframe-closed.svg"
    },
    "closing": {
      "logo": "/media/img/mainframe-closing.svg"
    }
  });

  var RADSTELLE = $.extend(true, {}, BASE, {
    "domId": 'radBox',
    "open": {
      "logo": "/media/img/Radstelle_open.svg"
    },
    "none": {
      "logo": "/media/img/Radstelle_closed.svg"
    },
    "closing": {
      "logo": "/media/img/Radstelle_closed.svg"
    }
  });

  function statusSet(place, status) {
    var img = place[status]["logo"];
    var cls = place[status]["class"];
    var msg = place[status][language];

    var id = '#' + place.domId;

    $(id).removeClass("panel-danger panel-success panel-warning");
    $(id).addClass(cls);
    $(id + '_text').html('<a href="' + baseUrl + '"><img src="' + img + '" alt="' + msg + '!" title="' + msg + '!" style="width: 100%" /></a>');
  }

  function firstPoll() {
    $.getJSON(baseUrl + "api/openState", function (data) {
      statusSet(SPACE, data.space.state);
      statusSet(RADSTELLE, data.radstelle.state);
    });
  }

  function spaceStatusPush() {
    var CHECK_INTERVAL = 5 * 60 * 1000;
    var connectionError, lastkeepalive;

    var source = new EventSource(baseUrl + "api/statusStream?spaceOpen=1&radstelleOpen=1");
    source.onopen = function () {
      console.log('EventSource: connection established');
      connectionError = false;
      lastkeepalive = new Date().getTime();
    };

    source.onerror = function (err) {
      connectionError = true;
      console.log('EventSource: connected failed:', err);
    };

    source.addEventListener('spaceOpen', function (e) {
      listen(SPACE, e);
    }, false);

    source.addEventListener('radstelleOpen', function (e) {
      listen(RADSTELLE, e);
    }, false);

    source.addEventListener('keepalive', function (e) {
      lastkeepalive = new Date().getTime();
    }, false);

    function listen(place, event) {
      var data = jQuery.parseJSON(event.data);
      console.log('EventSource: ' + data.state);
      statusSet(place, data.state);
    }

    function checkConnection() {
      console.log('Checking connection...');
      var now = new Date().getTime();
      if ((now - lastkeepalive > 65 * 60 * 1000) || source.readyState === 2) {
        source.close();
        setTimeout(init, 3000);
        return;
      }
      setTimeout(checkConnection, CHECK_INTERVAL);
    }

    setTimeout(checkConnection, CHECK_INTERVAL);
  }

  return {
    init: function (lang) {
      language = lang;

      firstPoll();
      spaceStatusPush();
    }
  };
}());
