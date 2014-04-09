/* JS helpers for Space Status Widget */

function spaceStatusPoll() {
	$.getJSON("//status.kreativitaet-trifft-technik.de/api/spaceInfo", function( data ) {
		if(data["state"]["open"]) {
			$('#status').html("<b>Hochgefahren!</b>");
			$('#status').parent().parent().addClass("panel-success")
		} else {
			$('#status').html("<b>Runtergefahren!</b>");
			$('#status').parent().parent().addClass("panel-danger")
		}
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
			$('#status').html("<b>Runtergefahren!</b>");
			$('#status').parent().parent().removeClass("panel-success panel-warning")
			$('#status').parent().parent().addClass("panel-danger")
			break;
		case 'on':
			console.log('EventSource: Space is on');
			$('#status').html("<b>Hochgefahren!</b>");
			$('#status').parent().parent().removeClass("panel-danger panel-warning")
			$('#status').parent().parent().addClass("panel-success")
			break;
		case 'closing':
			console.log('EventSource: Space is closing');
			$('#status').parent().parent().removeClass("panel-danger panel-success")
			$('#status').parent().parent().addClass("panel-warning")
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
