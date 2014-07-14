var actionsWidth = 150;
var statusCodetraceWidth = 430;

var isCreateOpen = false;
var isSamplesOpen = false;
var isKruskalsOpen = false;
var isPrimsOpen = false;

function openCreate() {
	if(!isCreateOpen) {
		$('.create').fadeIn('fast');
		isCreateOpen = true;
	}
}
function closeCreate() {
	if(isCreateOpen) {
		$('.create').fadeOut('fast');
		$('#create-err').html("");
		isCreateOpen = false;
	}
}
function openSamples() {
	if(!isSamplesOpen) {
		$('.samples').fadeIn('fast');
		isSamplesOpen = true;
	}
}
function closeSamples() {
	if(isSamplesOpen) {
		$('.samples').fadeOut('fast');
		$('#samples-err').html("");
		isSamplesOpen = false;
	}
}
function openKruskals() {
	if(!isKruskalsOpen) {
		$('.kruskals').fadeIn('fast');
		isKruskalsOpen = true;
	}
}
function closeKruskals() {
	if(isKruskalsOpen) {
		$('.kruskals').fadeOut('fast');
		$('#kruskals-err').html("");
		isKruskalsOpen = false;
	}
}
function openPrims() {
	if(!isPrimsOpen) {
		$('.prims').fadeIn('fast');
		isPrimsOpen = true;
	}
}
function closePrims() {
	if(isPrimsOpen) {
		$('.prims').fadeOut('fast');
		$('#prims-err').html("");
		isPrimsOpen = false;
	}
}

function hideEntireActionsPanel() {
	closeCreate();
	closeSamples();
	closeKruskals();
	closePrims();
	hideActionsPanel();
}

$( document ).ready(function() {
	
	//action pullouts
	$('#create').click(function() {
		closeSamples();
		closePrims();
		closeKruskals();
		openCreate();
	});

	$('#samples').click(function() {
		closeCreate();
		closePrims();
		closeKruskals();
		openSamples();
	})
	
	$('#prims').click(function() {
		closeCreate();
		closeSamples();
		closeKruskals();
		openPrims();
	});
	
	$('#kruskals').click(function() {
		closeCreate();
		closeSamples();
		closePrims();
		openKruskals();
	});
		
	//tutorial mode
	$('#mst-tutorial-1 .tutorial-next').click(function() {
		showActionsPanel();
	});
	$('#mst-tutorial-2 .tutorial-next').click(function() {
		hideEntireActionsPanel();
	});
	$('#mst-tutorial-3 .tutorial-next').click(function() {
		showStatusPanel();
	});
	$('#mst-tutorial-4 .tutorial-next').click(function() {
		hideStatusPanel();
		showCodetracePanel();
	});
	$('#mst-tutorial-5 .tutorial-next').click(function() {
		hideCodetracePanel();
	});
});