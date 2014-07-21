var actionsWidth = 150;
var statusCodetraceWidth = 410;

var isDrawOpen = false;
var isModelingOpen = false;
var isCreateOpen = false;
var isBipartiteOpen = false;
var isSamplesOpen = false;
var isCountMaximumFlowOpen = false;

function openModeling() {
	$(".modeling").css("bottom","150px");
	$('#rookattack-input').hide();
	$('#baseball-input').hide();
	$('#bipartite-input').hide();
	if(!isModelingOpen) {
		$('.modeling').fadeIn('fast');
		isModelingOpen = true;
	}
}
function closeDraw() {
	if(isDrawOpen) {
		$('.draw').fadeOut('fast');
		isDrawOpen = false;
	}
}
function openDraw() {
	if(!isDrawOpen) {
		$('.draw').fadeIn('fast');
		isDrawOpen = true;
	}
}
function closeModeling() {
	if(isModelingOpen) {
		$('.modeling').fadeOut('fast');
		$('#modeling-err').html("");
		isModelingOpen = false;
	}
}
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
function openCountMaximumFlow() {
	if(!isCountMaximumFlowOpen) {
		$('.countmaxflow').fadeIn('fast');
		$('#countmaxflow-go').show();
		$('#countmaxflow-algorithm').hide();
		isCountMaximumFlowOpen = true;
	}
}
function closeCountMaximumFlow() {
	if(isCountMaximumFlowOpen) {
		$('.countmaxflow').fadeOut('fast');
		$('#countmaxflow-err').html("");
		isCountMaximumFlowOpen = false;
	}
}

function hideEntireActionsPanel() {
	closeDraw()
	closeModeling();
	closeCreate();
	closeSamples();
	closeCountMaximumFlow();
	hideActionsPanel();
}

$( document ).ready(function() {
	$('#draw').click(function() {
		openDraw()
		closeModeling();
		closeCreate();
		closeSamples();
		closeCountMaximumFlow();
	});

	$('#modeling').click(function() {
		closeDraw()
		openModeling();
		closeCreate();
		closeSamples();
		closeCountMaximumFlow();
	});

	$('#create').click(function() {
		closeDraw()
		closeModeling();
		openCreate();
		closeSamples();
		closeCountMaximumFlow();
	});

	$('#sample').click(function() {
		closeDraw()
		closeModeling();
		closeCreate();
		openSamples();
		closeCountMaximumFlow();
	});

	$('#countmaxflow').click(function() {
		closeDraw()
		closeModeling();
		closeCreate();
		closeSamples();
		openCountMaximumFlow();
	});
		
	//tutorial mode
	$('#maxflow-tutorial-1 .tutorial-next').click(function() {
		showActionsPanel();
	});
	$('#maxflow-tutorial-2 .tutorial-next').click(function() {
	});
	$('#maxflow-tutorial-3 .tutorial-next').click(function() {
		showStatusPanel();
	});
	$('#maxflow-tutorial-4 .tutorial-next').click(function() {
		hideStatusPanel();
		showCodetracePanel();
	});
	$('#maxflow-tutorial-5 .tutorial-next').click(function() {
		hideCodetracePanel();
	});
});