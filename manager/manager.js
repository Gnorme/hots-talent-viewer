var talents;
chrome.storage.local.get('talents', function(result){
	talents = result.talents;
	console.log(talents);
})
function DownloadImg(canvas, file){
	var link = document.getElementById('download');
	link.href = canvas.toDataURL();
	link.download = file;
	link.click();

}
function DownloadFrame(){
	var videos = document.getElementsByClassName('player-video');
	var video = videos[0].childNodes;
	var rect = video[0].getBoundingClientRect();
	var b_canvas = document.createElement("canvas");
	b_canvas.id = "Whole_canvas";
	b_canvas.width = video[0].videoWidth;
	b_canvas.height = video[0].videoHeight;
	document.body.appendChild(b_canvas);
	var b_ctx = b_canvas.getContext('2d');
	b_ctx.drawImage(video[0],0,0,video[0].videoWidth, video[0].videoHeight);
	DownloadImg(b_canvas, "whole.png");	
}
function CreateTextFile(name,content){
	var data = new Blob([content],{type:'text/plain'});
	var textFile = window.URL.createObjectURL(data);
	var link = document.createElement("a");
	link.download = name;
	link.href = textFile;
	link.onclick = destroyClickedElement;
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();	
}
function GenBatchHeroHashes(names,hashes){
	var name = names.shift()
	if (name){
		getImageHash(chrome.extension.getURL('/heroes/'+name+'.png'),10,30).then(function(hash){
			hashes += '"'+name+'":"'+hash+'",';
			GenBatchHeroHashes(names,hashes);
		}).catch(function(url){
			console.log(url)
			GenBatchHeroHashes(names,hashes);
		})
	} else {
		hashes = hashes.slice(0, -1) + "}";
		CreateTextFile("Heroes.txt",hashes);
	}		
}
function DownloadData(h_names){
	for (var i = 0; i < h_names.length; i++){
		CreateTextFile(h_names[i]+".txt",JSON.stringify(talents.Hero[h_names[i]]))
	}
}
function GenTalentKeyHoles(hero, level, numKeys, save){
	var width = 10
	var height = 10
	var keySize = 2
	var keys
	var pos
	var tal
	var data = []

	getData(ReadFile('/talents/'+hero+'/'+level+'/names.txt'))

	function getData(t_names){
		talent = t_names.shift()
		if (talent) {
			getImgData(chrome.extension.getURL('/talents/'+hero+'/'+level+'/'+talent+'.png'),0,0,width,height).then(function(imgData){
				data.push(imgData)
				getData(t_names)
			}).catch(function(url){
				console.log(url)
				getData(t_names)
			})
		} else {
			var keyhole = FindLargestDiff(data,width,height,keySize,3)
			if (save){
				var talentNames = ReadFile('/talents/'+hero+'/'+level+'/names.txt')
				talentData = JSON.parse('{"Talents":[],"KeyHole":[]}')
				for (var l = 0; l < talentNames.length; l++){
					tal = JSON.parse('{"Name":"'+talentNames[l]+'","Key":[],"Description":"..."}')
					for (var m = 0; m < numKeys; m++){
						pos = (keyhole[m][1] * width + keyhole[m][0]) * 4
						tal.Key.push(JSON.parse('['+ConcatImgData(pos,data[l],keySize)+']'))					
					}
					talentData.Talents.push(tal)
				}			
				talentData.KeyHole.push(keyhole[0])
				talentData.KeyHole.push(keyhole[1])
				CreateTextFile(hero+level+".txt",JSON.stringify(talentData))
			}
		}
	}
}
function hasNumber(s) {
	var regex = /\d/g;
	return regex.test(s);
}
function AddHighlights(h_name, level){
	for (var i = 0; i < talents.Hero[h_name].Level[level].Talents.length; i++){
		var words = talents.Hero[h_name].Level[level].Talents[i].Description.split(" ");
		for (var j = 0; j < words.length; j++){
			if (hasNumber(words[j])){
				if (words[j][0] == "("){
					words[j] = '(' + '<span class="value">' + words[j].slice(1,words[j].length) + '</span>';
				} else {
					words[j] = '<span class="value">'+words[j]+'</span>';
				}		
			} else if (words[j] == "Quest:" || words[j] == "Reward:"){
				words[j] = '<span class="quest">'+words[j]+'</span>';
			}
		}
		talents.Hero[h_name].Level[level].Talents[i].Description = words.join(" ");
		talents.Hero[h_name].Level[level].Talents[i].Name = talents.Hero[h_name].Level[level].Talents[i].Name.split(/(?=[A-Z])/).join(" ");
		//console.log(words.join(" "))
	}	
}
function UpdateData(h_name){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL("data/" + h_name + ".txt"), false);
	xhr.send();
	if(xhr.status == 200){
		talents.Hero[h_name] = JSON.parse(xhr.responseText);
		chrome.storage.local.set({'talents':talents})
	}
}
function PostHero(data){
	chrome.runtime.sendMessage({
		method: 'POST',
		action: 'xhttp',
		url: 'http://192.168.1.105:8080/heroes',
		data: '{"Hero":'+data+'}'
	}, function(responseText) {
		console.log(responseText);
		//heroes  = responseText;
	});	
}
function PostTalents(data){
	chrome.runtime.sendMessage({
		method: 'POST',
		action: 'xhttp',
		url: 'http://192.168.1.105:8080/talents',
		data: '{"data":'+data+'}'
	}, function(responseText) {
		console.log(JSON.parse(responseText));
	});		
}
//check hero, add to array
//if dead, check array, else check hero
//y=3
//98,177,256,335,414
//805,884,963,1042,1121
function RenameKey(o,old_key, new_key){
	if (old_key !== new_key) {
		Object.defineProperty(o, new_key,
			Object.getOwnPropertyDescriptor(o, old_key));
		delete o[old_key];
	}
}
function ConvertLocalData(){
	for (var hero in talents.Hero){
		for (var level in talents.Hero[hero].Level){
			if (level == "heroic"){
				talents.Hero[hero].Level[level].Talents = JSON.parse('[]')
				talents.Hero[hero].Level[level].KeyHole = JSON.parse('[]')
				var data = '{"Hero":"'+hero+'","Level":10,"Talents":'+JSON.stringify(talents.Hero[hero].Level[level].Talents)+',"Keyholes":'+JSON.stringify(talents.Hero[hero].Level[level].KeyHole)+'}'
			} else {
				for (var i=0; i< talents.Hero[hero].Level[level].Talents.length; i++){
					RenameKey(talents.Hero[hero].Level[level].Talents[i],"Key", "Keys")
				}	
				var data = '{"Hero":"'+hero+'","Level":'+parseInt(level)+',"Talents":'+JSON.stringify(talents.Hero[hero].Level[level].Talents)+',"Keyholes":'+JSON.stringify(talents.Hero[hero].Level[level].KeyHole)+'}'
			}
			//console.log(data)
			//console.log(JSON.parse(data))
			PostTalents(data)
		}
	}	
}
function FindLargestDiff(data, width, height, keySize, threshold){
	var keyhole = []
	var highest = 0
	var second = 0
	for (var y = 0; y <= height - keySize; y+=keySize){
		for (var x = 0; x <= width - keySize; x+=keySize){
			var total = 0
			var pos = (y * width + x) * 4
			for (var i = 0; i < data.length - 1; i++){
				var data1 = ConcatImgData(pos,data[i],width,keySize)
				for (var j=i+1; j < data.length; j++){
					var data2 = ConcatImgData(pos,data[j],width,keySize)
					var diff = pixelmatch(data1, data2, null, keySize, keySize,{threshold:0.2})
					if (diff >= threshold){
						total += diff
					}
				}			
			}
			if (total >= highest){
				second = highest
				highest = total
				keyhole[0] = keyhole[1]
				keyhole[1] = [x,y]					
			}
		}
	}
	
	return keyhole
}
function ConcatImgData(pos, values, width, size){
	var newArray = new Uint8ClampedArray(size*size*4)
	for (var k = 0; k < size;k++){
		var row = values.slice(pos+width*4*k,pos+width*4*k+size*4)
		newArray.set(row,k*row.length)
	}
	return newArray
}
function GenHeroKeyHoles(heroNames, numKeys, save){
	var width = 54
	var height = 31
	var threshold = 3
	var keySize = 3
	var keys
	var data = []
	
	getData(ReadFile('/heroes/names.txt'))
	function getData(h_names){
		h_name = h_names.shift()
		if (h_name) {
			getImgData(chrome.extension.getURL('/full_heroes/'+h_name+'.png'),0,0,width,height).then(function(imgData){
				data.push(imgData)
				getData(h_names)
			}).catch(function(url){
				console.log(url)
				getData(h_names)
			})
		} else {
			var keyhole = Array(numKeys).fill([0,0])
			var heroesData = JSON.parse('{"Hero":[]}')
			for (var i = 0; i < data.length; i++){
				var highest = 0
				var heroData = JSON.parse('{"Name":"", "Key":[], "KeyHole":[]}')
				for (var y = 0; y <= height - keySize; y+=keySize){
					for (var x = 0; x <= width - keySize; x+=keySize){
						var total = 0
						var pos = (y * width + x) * 4
						var data1 = ConcatImgData(pos,data[i],width,keySize)
						for (var j=0; j < data.length; j++){
							var data2 = ConcatImgData(pos,data[j],width,keySize)
							var diff = pixelmatch(data1, data2, null, keySize, keySize,{threshold:0.15})
							if (diff >= threshold){
								total += diff
							}
						}
						if (total >= highest){
							highest = total
							for (var k = 0; k < numKeys - 1; k++){
								keyhole[k] = keyhole[k+1]			
							}
							keyhole[numKeys-1] = [x,y]					
						}
					}
				}
				heroData.Name = heroNames[i]
				for (var z = 0; z < numKeys; z++){
					heroData.Key.push(JSON.parse('['+ConcatImgData((keyhole[z][1] * width + keyhole[z][0]) * 4, data[i], width, keySize)+']'))
					heroData.KeyHole.push(keyhole[z])
				}
				heroesData.Hero.push(heroData)
			}
			console.log(heroesData)
			Heroes = heroesData.Hero;
			chrome.storage.local.set({'heroKeys':heroesData});
		}
	}	
}
function AddTalentKeyData(names,levels){
	chrome.storage.local.get('talentKeys', function(result){
		var r = result.talentKeys
		if (r){
			for (var i=0;i<names.length;i++){
				if (r.Hero[names[i]] == undefined){
					r.Hero[names[i]] = JSON.parse('{"Level":{"1":{"Talents":[],"Keyhole":[]},"4":{"Talents":[],"Keyhole":[]},"7":{"Talents":[],"Keyhole":[]},"heroic":[],"13":{"Talents":[],"Keyhole":[]},"16":{"Talents":[],"Keyhole":[]},"20":{"Talents":[],"Keyhole":[]}}}');
				}
				for (var j=0;j<levels.length;j++){
					r.Hero[names[i]].Level[levels[j]] = JSON.parse(ReadFile('/hashes/'+names[i]+levels[j]+'.txt'));
				}	
			}
			console.log(r)
			chrome.storage.local.set({'talentKeys':r});
		}
	});
}

function UpdateTalentDescription(h_name, level, t_name, desc){
	var r
	chrome.storage.local.get('talentKeys', function(result){
		r = result.talentKeys
		if (r){
			for (var i = 0; i < r.Hero[h_name].Level[level].Talents.length; i++){
				if (r.Hero[h_name].Level[level].Talents[i].Name == t_name){
					r.Hero[h_name].Level[level].Talents[i].Description = desc
					chrome.storage.local.set({'talentKeys':r})
					return
				}
			}		
		}
	})
}
function ReadFile(filename){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', chrome.extension.getURL(filename), false);
	xhr.send();
	if(xhr.status == 200){
		var text = xhr.responseText;
		text = text.replace(/(\r\n|\n|\r)/gm," ");
		return text.split(" ");
	}
}
function destroyClickedElement(e)
{
    document.body.removeChild(e.target);
}
function getImgData(url,sx,sy,width,height){
    return new Promise(function(resolve, reject){
        var img = new Image()
        img.onload = function(){
			var ctx = document.getElementById("Hero_canvas").getContext('2d');
			ctx.drawImage(img,0,0);
			var pix = ctx.getImageData(sx,sy,width,height);
            resolve(pix.data)
        }
        img.onerror = function(){
            reject(url)
        }
        img.src = url
		img.crossOrigin = "Anonymous";
    })
}
function UpdateTalentKeyData(h_name,level,keyholes){
	//GenBatchTalentData([h_name],[level]);
	var r
	chrome.storage.local.get('talentKeys', function(result){
		r = result.talentKeys
		if (r){
			r.Hero[h_name].Level[level].KeyHole = keyholes;
			UpdateKeys(0,0)
		}
	})
	function UpdateKeys(idxTalent,idxKey){
		if (idxKey < keyholes.length){
			getImgData(chrome.extension.getURL('/talents/'+h_name+'/'+level+'/'+r.Hero[h_name].Level[level].Talents[idxTalent].Name+'.png'),keyholes[idxKey][0],keyholes[idxKey][1],2,2).then(function(data){
				r.Hero[h_name].Level[level].Talents[idxTalent].Key[idxKey] = JSON.parse('['+data+']');
				idxKey++
				UpdateKeys(idxTalent,idxKey)
			}).catch(function(url){
				console.log(url)
			});			
		} else {
			idxTalent++
			idxKey = 0
			if (idxTalent < r.Hero[h_name].Level[level].Talents.length){
				UpdateKeys(idxTalent,idxKey)
			} else {
				console.log(r)
				chrome.storage.local.set({'talentKeys':r});
			}			
		}
	}
}
document.onkeydown = function(e){
	//ConvertLocalData();
	//for (var i = 0; i < Heroes.length; i++){
	//	RenameKey(Heroes[i],"Key","Keys");
	//	RenameKey(Heroes[i],"KeyHole","Keyholes");
	//	PostHero(JSON.stringify(Heroes[i]))	
	//}
	//TestAjax();
	//54,31
	//chrome.storage.local.set({'talents':JSON.parse('{"Hero":{}}')})
	//talents = JSON.parse('{"Hero":{}}')
	//var heroNames = ReadFile("/heroes/names.txt");
	//var levels = ["1","4","7","13","16","20"];
	//GenHeroKeyHoles(heroNames,5,false);
	
	//for (var i = 0; i < heroNames.length; i++){
	//	UpdateData(heroNames[i])
	//	for (var j = 0; j < levels.length; j++){
	//		AddHighlights(heroNames[i], levels[j])
	//	}	
	//}
	//chrome.storage.local.set({'talents':talents})
	//AddHighlights("Tychus","1");
	//player.removeEventListener("mouseout", ViewerMouseOut, false);
	//UpdateTalentKeyData("Malfurion","16",[[8,0],[8,7]])
	
	//UpdateTalentDescription("Tychus", "4", "TheBiggerTheyAre", "Increases Minigun damage bonus to 4% while enemy Heroes are above 40% Health, but Minigun no longer has any effect on targets below 40%")
	//UpdateData("ETC");
	
	
	//DownloadData(heroNames)
	//var levels = ["1","4","7","13","16","20"];
	//for (var i = 0; i < heroNames.length; i++){
	//	for (var j = 0; j < levels.length; j++){
	//		GenKeyHoles(heroNames[i],levels[j], 2, true)
	//	}
	//}
	//GenKeyHoles(["Tychus"],["1"], true)
	//GenKeyData()

	//var tals = talents.Hero[hero].Level[talentLvl].Talents
	//var keyholes = talents.Hero[hero].Level[talentLvl].KeyHole
	//console.log(FindKeyhole(tals,keyholes))
	
	//console.log(FindKeyhole(keys["Zarya"].Level["13"].Talents,keys["Zarya"].Level["13"].KeyHole))
	//console.log(FindKeyhole(keys["Tychus"].Level["1"].Talents,keys["Tychus"].Level["1"].KeyHole))
	//GenBatchKeyData(["Tychus"],["1"],[1,7],3)
	//DownloadFrame()

	//chrome.storage.local.set({'talentKeys':JSON.parse('{"Hero":{}}')})
	//AddTalentKeyData(heroNames,levels)
	//AddTalentData(heroNames,levels);
	
	//GenBatchTalentData(heroNames,levels)
	//chrome.storage.local.remove('abilities');
	
	//var canvas = document.getElementById('InfoViewer_canvas');
	//var ctx = canvas.getContext('2d');
	//savPixels = ctx.getImageData(7,7,s_size,s_size);
	
	//var s_canvas = document.getElementById('Saved_canvas');
	//var s_ctx = s_canvas.getContext('2d');
	//s_ctx.putImageData(savPixels, 0,0);
	
	//var h_canvas = document.getElementById('Hero_canvas');
	//chrome.storage.local.set({'talents':JSON.parse('{"Hero":{}}')})

	//DownloadImg(s_canvas, "small.png");
	//DownloadImg(h_canvas, "hero.png");
	//DownloadFrame();
	//SaveHash();

	e.stopPropagation()
};