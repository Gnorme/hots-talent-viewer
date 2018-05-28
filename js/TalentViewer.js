var timeout;
var talentLvl;
var talentX
var talentY
var Heroes;
var HeroSlot;
var hero;
var offsetY
var player
var videos
var video

function GetCurrentDocument()
{
	return window.document;
}

function pixelmatch(img1, img2, output, width, height, options) {

    if (img1.length !== img2.length) throw new Error('Image sizes do not match.');

    var threshold = options.threshold === undefined ? 0.1 : options.threshold;

    // maximum acceptable square distance between two colors;
    // 35215 is the maximum possible value for the YIQ difference metric
    var maxDelta = 35215 * threshold * threshold,
        diff = 0;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var pos = (y * width + x) * 4;
            // squared YUV distance between colors at this pixel position
            var delta = colorDelta(img1, img2, pos, pos);
            if (delta > maxDelta) {diff++}
        }
    }

    return diff;
}


// calculate color difference according to the paper "Measuring perceived color difference
// using YIQ NTSC transmission color space in mobile applications" by Y. Kotsarenko and F. Ramos

function colorDelta(img1, img2, k, m) {
    var a1 = img1[k + 3] / 255,
        a2 = img2[m + 3] / 255,

        r1 = blend(img1[k + 0], a1),
        g1 = blend(img1[k + 1], a1),
        b1 = blend(img1[k + 2], a1),

        r2 = blend(img2[m + 0], a2),
        g2 = blend(img2[m + 1], a2),
        b2 = blend(img2[m + 2], a2),

        y = rgb2y(r1, g1, b1) - rgb2y(r2, g2, b2);

    var i = rgb2i(r1, g1, b1) - rgb2i(r2, g2, b2),
        q = rgb2q(r1, g1, b1) - rgb2q(r2, g2, b2);

    return 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q;
}

function rgb2y(r, g, b) { return r * 0.29889531 + g * 0.58662247 + b * 0.11448223; }
function rgb2i(r, g, b) { return r * 0.59597799 - g * 0.27417610 - b * 0.32180189; }
function rgb2q(r, g, b) { return r * 0.21147017 - g * 0.52261711 + b * 0.31114694; }

// blend semi-transparent color with white
function blend(c, a) {
    return 255 + (c - 255) * a;
}
function ViewerMouseOut(e)
{
	var block = document.getElementById('Talent');
	if (block) {
		block.style.display = "none";
	} else {
		player.removeEventListener("mouseout", ViewerMouseOut, false);
		return;
	}
	console.log("mouseout")
	e.stopPropagation();
	player.removeEventListener("mouseout", ViewerMouseOut, false);
}
function ViewerMouseOver(e) {
	var block = document.getElementById('Talent');
	if( ! block ){
		return;
	}

	block.firstChild.innerHTML = "Talent Info";
	
	e.stopPropagation();
	
	player.addEventListener("mouseout", ViewerMouseOut, false);
}

function ViewerMouseMove(e) {
	var block = document.getElementById('Talent');

	if( ! block ){
		return;
	}
	
	if(window.lastX !== e.clientX || window.lastY !== e.clientY){	
		block.style.display = "none";
		
		var pageWidth = window.innerWidth;
		var pageHeight = window.innerHeight;
		var blockWidth = 312;
		var blockHeight = document.defaultView.getComputedStyle(block, null).getPropertyValue('height');

		blockHeight = blockHeight.substr(0, blockHeight.length - 2) * 1;

		if ((e.pageX + blockWidth) > pageWidth) {
			if ((e.pageX - blockWidth - 10) > 0)
				block.style.left = e.pageX - blockWidth - 40 + 'px';
			else
				block.style.left = 0 + 'px';
		}
		else
			block.style.left = (e.pageX + 20) + 'px';

		if ((e.pageY + blockHeight) > pageHeight) {
			if ((e.pageY - blockHeight - 10) > 0)
				block.style.top = e.pageY - blockHeight - 20 + 'px';
			else
				block.style.top = 0 + 'px';
		}
		else
			block.style.top = (e.pageY + 20) + 'px';

		// adapt block top to screen offset
		inView = ViewerIsElementInViewport(block);

		if( ! inView )
			block.style.top = ( window.pageYOffset  + 20 ) + 'px';

		var rect = video[0].getBoundingClientRect();
		var ratioX = rect.width / video[0].videoWidth;
		var ratioY = rect.height / video[0].videoHeight;
		var correctX = Math.round((e.clientX - rect.left)/ratioX);
		var correctY = Math.round((e.clientY - rect.top)/ratioY);

		clearInterval(timeout);
		timeout = setTimeout(function(){
			if (correctY > 40 && correctY < 64 && correctX > 104 && correctX < 1174) {
				CheckTop();
				CheckTalentLevel(correctX,correctY);
				CheckHero();
				FindTalent(talentX,talentY);
			}
		}, 400);
	}
	
	window.lastX = e.clientX
	window.lastY = e.clientY

	e.stopPropagation();	
}

function CheckHero(){
	var ctx = document.getElementById("Hero_canvas").getContext('2d');
	//142,221,300,379,458
	//849,928,1007,1086,1165
	var dist = 79;
	var blueStart = 19;
	var redStart = 726;
	var diff;
	var lowest = 300;
	var keys = 5;
	var keySize = 3;
	var y = 3 + offsetY
	
	if (HeroSlot >= 6){
		var x = redStart + (HeroSlot - 5) * dist;	
	} else if (HeroSlot >= 1){
		var x = blueStart + HeroSlot * dist;
	}
	ctx.drawImage(video[0],x,y,54,31,0,0,54,31);
	//DownloadImg(document.getElementById("Hero_canvas"), "test.png")
	for (var i = 0; i < Heroes.length;i++){
		diff = 0;
		for (var j = 0; j < keys; j++){
			var pix = ctx.getImageData(Heroes[i].Keyholes[j][0],Heroes[i].Keyholes[j][1],keySize,keySize);
			diff += pixelmatch(Heroes[i].Keys[j], pix.data, null, keySize, keySize, {threshold: 0.2})
		}
		if (diff < lowest) {
			lowest = diff;
			console.log(lowest)
			hero = Heroes[i].Name;
		}
	}
	console.log(hero)
}
function FindTalent(x,y){
	var tolerance = 0
	var keyMatches = new Array()
	var tal
	var keys
	var size
	var keyholes
	var block = document.getElementById('Talent');
	var t = block.childNodes;

	var ctx = document.getElementById('Hero_canvas').getContext('2d');
	if (talentLvl == 10) {
		width = 12;
		height = 18;
		y = 40;
	} else {
		width = 10;
		height = 10;
	}
	//drawImage(img,sx,sy,sw,sh,x,y,w,h)
	ctx.drawImage(video[0],x - tolerance,y + offsetY,width + tolerance*2,height,0,0,width + tolerance*2,height);	
	//DownloadImg(document.getElementById('Hero_canvas'), "talent.png")
	//DownloadFrame();
	
	GetTalents(hero, talentLvl, function(talents) {
		keys = talents.Talents
		keyholes = talents.Keyholes
		size = Math.sqrt(keys[0].Keys[0].length / 4)
		console.log(keys)
		console.log(keyholes)
		CheckKeys(0,0)
	})
	
	function CheckKeys(keyhole, key){
		console.log(keyhole,key)
		if (keyholes[keyhole]){
			var lows = new Array(keys.length).fill(size*size)
			var keyX = keyholes[keyhole][0]
			var keyY = keyholes[keyhole][1]
			
			for (var x = keyX; x <= keyX + tolerance*size; x++){
				//for (var y = keyY; y <= keyY; y++){
				var pix = ctx.getImageData(x,keyY,size,size)
				for (var i=0; i < keys.length; i++){
					var diff = pixelmatch(keys[i].Keys[key], pix.data, null, size, size, {threshold: 0.15})			
					if (diff < lows[i]){
						lows[i] = diff
					}				
				}
				//}
			}
			keyMatches.push(lows)
			keyhole++
			key++
			CheckKeys(keyhole, key)
		} else {
			console.log(keyMatches)
			var keyDiff = 0
			var lowest = size*size*2
			for (var j = 0; j < keys.length; j++){
				keyDiff  = keyMatches[0][j] + keyMatches[1][j]
				if (keyDiff  < lowest){
					lowest = keyDiff
					tal = keys[j]
				}
			}
			t[0].innerHTML = tal.Name
			t[1].innerHTML = tal.Description
			block.style.display = 'block';
		}	
	}
}
//835,914,993,1072,1151
//167,246,325,404,483
function CheckTalentLevel(x,y){
	var red_t_keys = [369,351,334,317,290,272,255,237,211,193,175,158,132,114,96,79,53,34,17,0];
	var red_b_keys = [377,350,334,317,298,272,255,237,219,193,176,158,140,113,96,79,61,34,17,0];
	var bl_t_keys = [375,353,335,316,296,274,256,237,217,195,176,158,138,116,98,79,59,36,18,0];
	var bl_b_keys = [368,354,336,318,289,275,257,238,210,196,178,159,131,116,98,79,52,37,19,0];
	var red_t_talents = {369: "10", 351: "7", 334: "4", 317: "1", 290: "10", 272: "7", 255: "4", 237: "1", 211: "10", 193: "7", 175: "4", 158: "1", 132: "10", 114: "7", 96: "4", 79: "1", 53: "10", 34: "7", 17: "4", 0: "1"};
	var red_b_talents = {377: "10", 350: "20", 334: "16", 317: "13", 298: "10", 283: "20", 255: "16", 237: "13", 219: "10", 193: "20", 176: "16", 158: "13", 140: "10", 113: "20", 96: "16", 79: "13", 61: "10", 34: "20", 17: "16", 0: "13"};
	var bl_t_talents = {375: "10", 353: "7", 335: "4", 316: "1", 296: "10", 274: "7", 256: "4", 237: "1", 217: "10", 195: "7", 176: "4", 158: "1", 138: "10", 116: "7", 98: "4", 79: "1", 59: "10", 36: "7", 18: "4", 0: "1"};
	var bl_b_talents = {368: "10", 354: "20", 336: "16", 318: "13", 289: "10", 275: "20", 257: "16", 238: "13", 210: "10", 196: "20", 178: "16", 159: "13", 131: "10", 116: "20", 98: "16", 79: "13", 52: "10", 37: "20", 19: "16", 0: "13"};	
	var t_redStart = 778;
	var t_blueStart = 104;
	var b_redStart = 770;
	var b_blueStart = 111;
	
	var b_Start = 52;
	var size = 400;

	function CheckLevel(tal,offset, keys){
		var talentLevel;
		for (var i=0;i < keys.length; i++){
			if (x > keys[i] + offset) {
				talentLvl = tal[keys[i]];
				talentX = keys[i] + offset + 4
				break;
			}
		}
	}
	if (y > b_Start) {
		if (x > b_redStart){
			HeroSlot = Math.ceil((x - b_redStart + 0.1) / 79) + 5;
			talentY = 54
			CheckLevel(red_b_talents, b_redStart, red_b_keys);
		} else if (x < b_blueStart + size){
			HeroSlot = Math.ceil((x - b_blueStart + 0.1) / 79);
			talentY = 54
			CheckLevel(bl_b_talents, b_blueStart, bl_b_keys);
		}
	} else {
		if (x > t_redStart){
			HeroSlot = Math.ceil((x - t_redStart + 0.1) / 79) + 5;
			talentY = 40
			CheckLevel(red_t_talents, t_redStart, red_t_keys);
		} else if (x < t_blueStart + size){
			HeroSlot = Math.ceil((x - t_blueStart + 0.1) / 79);
			talentY = 40
			CheckLevel(bl_t_talents, t_blueStart, bl_t_keys);		
		}
	}
}

function ViewerIsElementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
function InfoViewer()
{
	this.CreateBlock =  function() {
		var document = GetCurrentDocument();
		
		if (document) {
			block = document.createElement('div');
			block.id = 'Talent';
			block.style.display = 'none';
			
			var header = document.createElement('h1');
			
			header.appendChild(document.createTextNode(''));
			block.appendChild(header);
		
			var h2 = document.createElement('h2');

			h2.appendChild(document.createTextNode('Desc'));
			block.appendChild(h2);
			
			var h_canvas = document.createElement('canvas');
			h_canvas.id = 'Hero_canvas';
			h_canvas.width = 54;
			h_canvas.height = 32;
			h_canvas.style.display = "none";

			block.appendChild(h_canvas);

			var link = document.createElement('a');
			link.id = 'download';
			block.appendChild(link);
			
		}
		return block;
	}	
}

InfoViewer.prototype.Enable = function()
{
	var document = GetCurrentDocument();
	var block = document.getElementById('Talent');
	player = document.getElementById("player")

	if (!block){
		block = this.CreateBlock();
		document.body.appendChild(block);
	}
	
	if (player) {
		videos = document.getElementsByClassName('player-video');
		video = videos[0].childNodes;
		player.addEventListener("mouseover", ViewerMouseOver, false);
		player.addEventListener("mousemove", ViewerMouseMove, false);
		GetHeroes();		
	}
}

function GetHeroes(){
	chrome.runtime.sendMessage({
		method: 'GET',
		action: 'xhttp',
		url: 'http://192.168.1.105:8080/heroes'
	}, function(responseText) {
		Heroes = responseText.Heroes
		console.log(Heroes);
		//Heroes  = responseText;
	});
}
function GetAllTalents(){
	chrome.runtime.sendMessage({
		method: 'GET',
		action: 'xhttp',
		url: 'http://192.168.1.105:8080/talents'
	}, function(responseText) {
		console.log(responseText);
		//talents = responseText;
	});	
}
function GetTalents(hero, lvl, callback){
	chrome.runtime.sendMessage({
		method: 'GET',
		action: 'xhttp',
		url: 'http://192.168.1.105:8080/talents/'+hero+'/'+lvl
	}, function(responseText) {
		console.log(responseText.data)
		callback(responseText.data);
		//talents = responseText;
	});	
}
function CheckTop(){
	var ctx = document.getElementById("Hero_canvas").getContext('2d');
	ctx.drawImage(video[0], 80, 0, 10, 2, 0, 0, 10,2)
	var t_pix = ctx.getImageData(0,0,10,1)
	var b_pix = ctx.getImageData(0,1,10,1)
	var diff = pixelmatch(t_pix.data, b_pix.data, null, 10, 1, {threshold:0.2})
	console.log("Top diff: " + diff)
	if (diff < 2) {
		offsetY = 0
	} else {
		offsetY = 1
	}
}
function DownloadImg(canvas, file){
	var link = document.getElementById('download');
	link.href = canvas.toDataURL();
	link.download = file;
	link.click();

}
function DownloadFrame(){
	var link = document.getElementById('download');
	var canvas = document.createElement('canvas');
	canvas.width = 1280;
	canvas.height = 720;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(video[0],0,0)
	link.href = canvas.toDataURL();
	link.download = "full.png";
	link.click();
}
Info = new InfoViewer();
Info.Enable();
document.onkeydown = function(e){
	e.stopPropagation()
};
