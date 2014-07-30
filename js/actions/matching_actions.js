var actionsWidth = 150;
var statusCodetraceWidth = 410;

var isCreateOpen = false;
var isSampleOpen = false;
var isAugPathOpen = false;
var isGreedyOpen = false;
var isHopcroftOpen = false;

function openCreate() {
    if(!isCreateOpen) {
	$('.create').fadeIn('fast');
	isCreateOpen = true;
    }
}
function closeCreate() {
    if (isCreateOpen) {
	$('.create').fadeOut('fast');
	$('#create-err').html("");
	isCreateOpen = false;
    }
}
function openSample() {
	if(!isSampleOpen) {
		$('.sample').fadeIn('fast');
		isSampleOpen = true;
	}
}
function closeSample() {
	if(isSampleOpen) {
		$('.sample').fadeOut('fast');
		$('#sample-err').html("");
		isSampleOpen = false;
	}
}
function openAugPath() {
	if(!isAugPathOpen) {
		$('.augpath').fadeIn('fast');
		isAugPathOpen = true;
	}
}
function closeAugPath() {
	if(isAugPathOpen) {
		$('.augpath').fadeOut('fast');
		$('#augpath-err').html("");
		isAugPathOpen = false;
	}
}
function openGreedy() {
	if(!isGreedyOpen) {
		$('.greedyaug').fadeIn('fast');
		isGreedyOpen = true;
	}
}
function closeGreedy(){
	if(isGreedyOpen){
		$('.greedyaug').fadeOut('fast');
		$('#greedyaug-err').html("");
		isGreedyOpen = false;
	}
}
function openHopcroft(){
	if(!isHopcroftOpen){
		$('.hopcroftkarp').fadeIn('fast');
		isHopcroftOpen = true;
	}
}
function closeHopcroft(){
	if(isHopcroftOpen){
		$('.hopcroftkarp').fadeOut('fast');
		$('#hopcroftkarp-err').html("");
		isHopcroftOpen = false;
	}
}
function hideEntireActionsPanel(){
    closeCreate();
    closeSample();
    closeAugPath();
    closeGreedy();
    closeHopcroft();
    hideActionsPanel();
}

$(document).ready(function() {
    $('#create').click(function() {
		openCreate();
		closeSample();
		closeAugPath();
		closeGreedy();
		closeHopcroft();
    });
    $('#sample').click(function() {
		closeCreate();
		openSample();
		closeAugPath();
		closeGreedy();
		closeHopcroft();
    });
    $('#augpath').click(function() {
		closeCreate();
		closeSample();
		openAugPath();
		closeGreedy();
		closeHopcroft();
    });
    $('#greedyaug').click(function(){
	    closeCreate();
	    closeSample();
	    closeAugPath();
	    openGreedy();
	    closeHopcroft();
    });
    $('#hopcroftkarp').click(function(){
    	closeCreate();
    	closeSample();
    	closeAugPath();
    	closeGreedy();
    	openHopcroft();
    });
	//tutorial mode
    $('#aug-tutorial-2 .tutorial-next').click(function() {
	showActionsPanel();
    });
    $('#aug-tutorial-3 .tutorial-next').click(function() {
	hideEntireActionsPanel();
    });
    $('#aug-tutorial-4 .tutorial-next').click(function() {
	showStatusPanel();
    });
    $('#aug-tutorial-5 .tutorial-next').click(function() {
	hideStatusPanel();
	showCodetracePanel();
    });
    $('#aug-tutorial-6 .tutorial-next').click(function() {
	hideCodetracePanel();
    });
});
