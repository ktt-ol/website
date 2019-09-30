/* JS helpers for Space Status Widget */

'use strict';

var SpaceStatus = (function () {
  var baseUrl = '//status.kreativitaet-trifft-technik.de/';
  // var baseUrl = 'http://localhost:9000/';
  
  // default
  var language = 'de';
  var theme = 'light';

  var BASE = {
    "open+": {
      "class": "bg-success",
      "de": "Offen",
      "en": "Open House"
    },
    "open": {
      "class": "bg-success",
      "de": "Offen",
      "en": "Open"
    },
    "member": {
      "class": "bg-warning",
      "de": "Nur Mitglieder",
      "en": "Members Only"
    },
    "keyholder": {
      "class": "bg-warning",
      "de": "Nur Keyholder",
      "en": "Keyholder Only"
    },
    "none": {
      "class": "bg-danger",
      "de": "Geschlossen",
      "en": "Closed"
    },
    "closing": {
      "class": "bg-warning",
      "de": "Am Schließen",
      "en": "Closing"
    }
  };

  var SPACE = $.extend(true, {}, BASE, {
    "domId": 'statusLine',
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
    "domId": 'radLine',
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

  var MACHINING = $.extend(true, {}, BASE, {
    "domId": 'machiningLine',
    "open": {
      "logo": "/media/img/machining-room-open.svg"
    },
    "none": {
      "logo": "/media/img/machining-room-closed.svg"
    }
  });

  var LAB3D = $.extend(true, {}, BASE, {
    "domId": 'lab3Line',
    "open": {
      "logo": "/media/img/3d-lab-open.svg"
    },
    "none": {
      "logo": "/media/img/3d-lab-closed.svg"
    }
  });

  function statusSet(place, status) {
    var cls = place[status]["class"];
    var msg = place[status][language];

    var id = $('#' + place.domId);

    id.removeClass("bg-danger bg-success bg-warning");
    id.addClass(cls);
    $('.status', id).text(msg);
  }

  function firstPoll() {
    $.getJSON(baseUrl + "api/openState", function (data) {
      statusSet(SPACE, data.space.state);
      statusSet(RADSTELLE, data.radstelle.state);
      statusSet(MACHINING, data.machining.state);
      statusSet(LAB3D, data.lab3d.state);
    });
  }

  function spaceStatusPush() {
    var CHECK_INTERVAL = 5 * 60 * 1000;
    var connectionError, lastkeepalive;

    var source = new EventSource(baseUrl + "api/statusStream?spaceOpen=1&radstelleOpen=1&machining=1&lab3dOpen=1");
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

    source.addEventListener('machining', function (e) {
      listen(MACHINING, e);
    }, false);

    source.addEventListener('lab3d', function (e) {
      listen(LAB3D, e);
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
    init: function (lang, style) {
      language = lang;
	  theme = style;

      firstPoll();
      spaceStatusPush();
    }
  };
}());
