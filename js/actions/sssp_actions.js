var actionsWidth = 150;
var statusCodetraceWidth = 410;

var isCreateOpen = false;
var isSamplesOpen = false;
var isBFSOpen = false;
var isBellmanFordsOpen = false;
var isDijkstrasOpen = false;

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
function openBFS() {
	if(!isBFSOpen) {
		$('.bfs').fadeIn('fast');
		isBFSOpen = true;
	}
}
function closeBFS() {
	if(isBFSOpen) {
		$('.bfs').fadeOut('fast');
		$('#bfs-err').html("");
		isBFSOpen = false;
	}
}
function openBellmanFords() {
	if(!isBellmanFordsOpen) {
		$('.bellmanford').fadeIn('fast');
		isBellmanFordsOpen = true;
	}
}
function closeBellmanFords() {
	if(isBellmanFordsOpen) {
		$('.bellmanford').fadeOut('fast');
		$('#bellmanford-err').html("");
		isBellmanFordsOpen = false;
	}
}
function openDijkstras() {
	if(!isDijkstrasOpen) {
		$('.dijkstra').fadeIn('fast');
		isDijkstrasOpen = true;
	}
}
function closeDijkstras() {
	if(isDijkstrasOpen) {
		$('.dijkstra').fadeOut('fast');
		$('#dijkstra-err').html("");
		isDijkstrasOpen = false;
	}
}

function hideEntireActionsPanel() {
	closeCreate();
	closeSamples();
	closeBFS();
	closeBellmanFords();
	closeDijkstras();
	hideActionsPanel();
}

$( document ).ready(function() {
	$('#create').click(function() {
		openCreate();
		closeSamples();
		closeBFS();
		closeBellmanFords();
		closeDijkstras();
	});

	$('#sample').click(function() {
		closeCreate();
		openSamples();
		closeBFS();
		closeBellmanFords();
		closeDijkstras();
	});
	
	$('#bfs').click(function() {
		closeCreate();
		closeSamples();
		openBFS();
		closeBellmanFords();
		closeDijkstras();
	});

	$('#bellmanford').click(function() {
		closeCreate();
		closeSamples();
		closeBFS();
		openBellmanFords();
		closeDijkstras();
	});
	
	$('#dijkstra').click(function() {
		closeCreate();
		closeSamples();
		closeBFS();
		closeBellmanFords();
		openDijkstras();
	});
		
	//tutorial mode
	$('#sssp-tutorial-1 .tutorial-next').click(function() {
		showActionsPanel();
	});
	$('#sssp-tutorial-2 .tutorial-next').click(function() {
		hideEntireActionsPanel();
	});
	$('#sssp-tutorial-3 .tutorial-next').click(function() {
		showStatusPanel();
	});
	$('#sssp-tutorial-4 .tutorial-next').click(function() {
		hideStatusPanel();
		showCodetracePanel();
	});
	$('#sssp-tutorial-5 .tutorial-next').click(function() {
		hideCodetracePanel();
	});
});