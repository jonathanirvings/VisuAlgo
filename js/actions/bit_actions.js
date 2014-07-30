var actionsWidth = 150;
var statusCodetraceWidth = 410;

var isUpdateOpen = false;
var isQueryOpen = false;
var isCreateOpen = false;

function openCreate() {
	if(!isCreateOpen) {
		randomize();
		$('.create').fadeIn('fast');
		isCreateOpen = true;
	}
}
function closeCreate() {
	if(isCreateOpen) {
		$('.create').fadeOut('fast');
		$(actions[BITType] + '#create-err').html("");
		isCreateOpen = false;
	}
}

function openUpdate() {
	if(!isUpdateOpen) {
		$('.update').fadeIn('fast');
		isUpdateOpen = true;
	}
}
function closeUpdate() {
	if(isUpdateOpen) {
		$('.update').fadeOut('fast');
		$(actions[BITType] + '#update-err').html("");
		isUpdateOpen = false;
	}
}

function openQuery() {
	if(!isQueryOpen) {
		$('.query').fadeIn('fast');
		isQueryOpen = true;
	}
}
function closeQuery() {
	if(isQueryOpen) {
		$('.query').fadeOut('fast');
		$(actions[BITType] + '#query-err').html("");
		isQueryOpen = false;
	}
}

function hideEntireActionsPanel() {
	closeUpdate();
	closeQuery();
	closeCreate();
	hideActionsPanel();
}

$( document ).ready(function() {
	$('#update').click(function(){
		closeQuery();
		closeCreate();
		openUpdate();
	});

	$('#query').click(function(){
		closeUpdate();
		closeCreate();
		openQuery();
	});

	$('#create').click(function(){
		closeUpdate();
		closeQuery();
		openCreate();
	});
		
	//tutorial mode
	$('#bit-tutorial-1 .tutorial-next').click(function() {

	});
	$('#bit-tutorial-2 .tutorial-next').click(function() {
		$('#point-update-range-query').click();
		showActionsPanel();
	});
	$('#bit-tutorial-3 .tutorial-next').click(function() {
		hideEntireActionsPanel();
	});
	$('#bit-tutorial-4 .tutorial-next').click(function() {
	});
	$('#bit-tutorial-5 .tutorial-next').click(function() {
		$('#range-update-point-query').click();
		showActionsPanel();
	});
	$('#bit-tutorial-6 .tutorial-next').click(function() {
		hideEntireActionsPanel();
	});
	$('#bit-tutorial-7 .tutorial-next').click(function() {
	});
	$('#bit-tutorial-8 .tutorial-next').click(function() {
		$('#range-update-range-query').click();
		showActionsPanel();
	});
	$('#bit-tutorial-9 .tutorial-next').click(function() {
		hideEntireActionsPanel();
	});
	$('#bit-tutorial-10 .tutorial-next').click(function() {
		showStatusPanel();
	});
	$('#bit-tutorial-11 .tutorial-next').click(function() {
		hideStatusPanel();
		showCodetracePanel();
	});
	$('#bit-tutorial-12 .tutorial-next').click(function() {
		hideCodetracePanel();
	});
});