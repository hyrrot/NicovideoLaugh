function countW(str){
	var pattern = "wｗWＷ";
	var count = 0;
	for(var i = 0; i < str.length; i++){
		for(var j = 0; j < pattern.length; j++){
			if(str.charAt(i) == pattern.charAt(j)) count ++;
		}
	}
	return count;
}

function groupComments(playerComments, seconds){
	var result = new Array(seconds);
	var i;
	for(i = 0; i<seconds; i++){
		result[i] = 0;
	}

	for(i = 0; i<playerComments.length ; i++){
		//vpos = timing of comment in milliseconds
		var commentMessage = playerComments[i].message;
		var commentPos = playerComments[i].vpos;
		var idx = Math.floor(commentPos / 1000);
		result[idx] += countW(commentMessage);
	}
	return result;
}



var f = document.getElementById("WATCHFOOTER");
var wound = document.getElementById("nicommons");
var html = (wound.innerHTML == null) ? '' : wound.innerHTML;
html += '<button id="button_fire_applause">ｗ</button>';
//html += '<span id="label_cmcount" style="font-size : 8pt">0</span>';
wound.innerHTML = html;

var laughSounds = [
	new Audio(chrome.extension.getURL("sound/people-laughing-4.ogg")),
	new Audio(chrome.extension.getURL("sound/people-laughing-3.ogg")),
	new Audio(chrome.extension.getURL("sound/people-laughing-2.ogg")),
	new Audio(chrome.extension.getURL("sound/people-laughing-1.ogg"))
];

var laughSoundThresholds = [40, 30, 20, 10];

// play correct laughing sound regarding to the count of comments
function playSound(count){
	for(var i = 0; i < laughSoundThresholds.length; i++){
		if(count >= laughSoundThresholds[i]){
			laughSounds[i].play();
			return;
		}
	}
}


var button = document.getElementById("button_fire_applause");


button.onclick = function(){
	var player = document.getElementById("flvplayer");
	var mainThreadId;
	var getThreadInfo = function(p){
		p = JSON.parse(p);
		for(var i = 0; i< p.length; i++)
			if(p[i].type = 'main') mainThreadId=i;
	};
	player.ext_getThreads('getThreadInfo');
	if(isNaN(mainThreadId)) console.log('error: could not get threadid.');
	var comments = player.ext_getComments(mainThreadId); // Standard comments
	var seconds = player.ext_getTotalTime();
	var wArray = groupComments(comments, seconds);
	var laugh = function(){
		var offset = 1;
		if(player.ext_getStatus() != "playing") return;
		var currentTime = (player.ext_getPlayheadTime() + 2) % wArray.length;
		var count = wArray[currentTime];
		playSound(count);
		button.innerText = count;
		console.log(count);
	}
	setInterval(laugh, 1000);
	button.disabled = true;
//	alert(player.ext_getPlayheadTime());
};


