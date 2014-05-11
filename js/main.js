var _debug = true,
	currentlyShowing = 'status',
	keyStrokes = [],
	dialog,
	widgets = {
		status: function(key) {
			switch(key) {
				case 'panel':
					debug('Toggle status panel');
					$('#status').slideToggle(400, function() {
						currentlyShowing = false;
					});
					break;

				default:
					debug('No action');
					break;
			}
		},
		scroller: function(key) {
			switch(key) {
				case 'return':
					debug('Dissmiss message');
					
					break;
				case 'up':
					clearTimeout(scrollerHideTimeout);
					debug('View Message');
					dialog.dialog({
					});
					hideScroller();
					setCurrentlyShowing('message');
					break;

				default:
					debug('No action');
					break;
			}
		},
		message: function(key) {
			var messageId = dialog.data('id');

			switch (key) {
				case 'return':
					// dismiss message
					break;

				case 'right':
				case 'down':
				case 'left':
					try {
						dialog.dialog('destroy');
						dialog.remove();
					} catch(e) {
					}
					resetCurrentlyShowing('message');
					break;
			}
		}
	};

$(document).ready(function() {
	init();
});

function debug(data) {
	if (_debug !== true) {
		return;
	}
	console.log(data);
}

function init() {
	debug('Startup');
	setCurrentTime();
	watchKeyPress();
	checkForMessages();
}

/**
 * Update the time displayed on the screen
 */
function setCurrentTime() {
	debug('Setting Time');
	var today = new Date(),
		padTime = function (i) {
			if (i < 10) {
				i = "0" + i;
			}
			return i;
		}
		h = padTime(today.getHours()),
		m = padTime(today.getMinutes());
		
	$('#time').html(h + ":" + m);
	t = setTimeout(setCurrentTime, 10000);
}

function watchKeyPress() {
	debug('Tracking key strokes');
	$(document).on('keyup', function(e) {
		var key = e.which,
			validKeys = [
				37,		// left
				38,		// up
				39,		// right
				40,		// down
				13,		// return
				33,		// page-up
				34		// page-down
			];

		if ($.inArray(key, validKeys) === -1) {
			debug("Invalid key: " + key);
			return false;
		}

		debug("Key pressed: " + key);
		
		switch(e.which) {
			case 37:
				keyPressEvent('left');
				break;

			case 38:
				keyPressEvent('up');
				break;

			case 39:
				keyPressEvent('right');
				break;

			case 40:
				keyPressEvent('down');
				break;

			case 13:
				keyPressEvent('return');
				break;

			case 33:
				keyPressEvent('config');
				break;

			case 34:
				keyPressEvent('panel');
				break;
		}
	});
}

function keyPressEvent(key) {
	if (!currentlyShowing) {
		currentlyShowing = 'status';
	}

	if (widgets[currentlyShowing] !== 'undefined') {
		debug('Dispatching Widget: ' + currentlyShowing);
		return widgets[currentlyShowing](key);
	}

	debug('Widget not loaded: ' + currentlyShowing);
}

var messageCheckTimer = null;
function checkForMessages() {
	clearTimeout(messageCheckTimer);
	if (currentlyShowing == 'message') {
		messageCheckTimer = setTimeout(checkForMessages, 5000);
		debug('Showing a message, skip message checks');
		return;
	}
	$.get('/src/messages.php', function(data) {
		debug('Checking for messages');
		data = $.parseJSON(data);
		if (data.status) {
			console.log(data.message);
			displayMessage(data.id, data.title, data.message);
		}
		messageCheckTimer = setTimeout(checkForMessages, data.retry);
	});
}

var scrollerHideTimeout = null;
function displayMessage(id, title, message) {
	clearTimeout(scrollerHideTimeout);
	var $scroller = $('#scroller');
	setCurrentlyShowing('scroller');
	debug('Begin message animation');
	debug('Message: ' + message);

	$scroller.animate({opacity: 1}, 1000, 'swing', function() {
		debug('Show message and scroll');

		$scroller.append('<span class="message" id="message-' + id + '"><strong>' + title + '</strong>:' + message + '</span>');
		dialog = $('<div id="#message-view" title="' + title + '" data-id="' + id + '">' + message + '</div>');
		$('.message', $scroller).animate({left: 0}, 10000, 'swing', function() {
			debug('Scrol done, remove message and hide');
			setTimeout(function() {
				$('#message-' +  id).remove();
			});
			scrollerHideTimeout = setTimeout(hideScroller, 15000);
		});
	});
}

function hideScroller() {
	var $scroller = $('#scroller');
	$scroller.animate({
		opacity: 0
	}, 1000);
	resetCurrentlyShowing('scroller');
}

function setCurrentlyShowing(type) {
	if (currentlyShowing == type) {
		debug('Currently showing is already: ' + type);
		return;
	}
	debug('Changed currently showing: ' + type);
	wasShowing = currentlyShowing;
	currentlyShowing = type;
}

function resetCurrentlyShowing(type) {
	if (type != currentlyShowing) {
		debug('Not your turn, buddy');
		return false;
	}
	debug('Changed currently from "' + currentlyShowing + '" back to "' + wasShowing + '"');
	currentlyShowing = wasShowing;
	wasShowing = false;
}