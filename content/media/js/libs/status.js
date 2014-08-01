/* JS helpers for Space Status Widget */

var statusmsg = {
	"open": {
		"logo": "/media/img/mainframe-open.svg",
		"class": "panel-success",
		"de": "Hochgefahren",
		"en": "Open"
	},
	"closed": {
		"logo": "/media/img/mainframe-closed.svg",
		"class": "panel-danger",
		"de": "Runtergefahren",
		"en": "Closed"
	}
}

function spaceStatusSet(status) {
	img = statusmsg[status]["logo"];
	cls = statusmsg[status]["class"];
	msg = statusmsg[status][language];

	$('#status').html("<a href=\"//status.kreativitaet-trifft-technik.de/\"><img src=\""+img+"\" alt=\""+msg+"!\" title=\""+msg+"!\" style='width: 100%' /></a>");
	$('#status').parent().parent().removeClass("panel-danger panel-success panel-warning");
	$('#status').parent().parent().addClass(cls)
}

function spaceStatusPoll() {
	$.getJSON("//status.kreativitaet-trifft-technik.de/api/spaceInfo", function( data ) {
		spaceStatusSet(data["state"]["open"] ? "open" : "closed");
	});
}

function spaceStatusPush() {
	var CHECK_INTERVAL = 5 * 60 * 1000;
	var source = new EventSource("//status.kreativitaet-trifft-technik.de/api/statusStream?spaceOpen=1");

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
		var data = jQuery.parseJSON(e.data);
		switch (data.state) {
		case 'off':
			console.log('EventSource: Space is off');
			spaceStatusSet("closed");
			break;
		case 'on':
			console.log('EventSource: Space is on');
			spaceStatusSet("open");
			break;
		case 'closing':
			console.log('EventSource: Space is closing');
			spaceStatusSet("closing");
			break;
		}
	}, false);

	source.addEventListener('keepalive', function (e) {
		lastkeepalive = new Date().getTime();
	}, false);

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
