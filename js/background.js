var enabled = true
chrome.browserAction.onClicked.addListener(function(tab)
{
	if (enabled) {
		chrome.browserAction.setIcon({path:'icon_on.png'});
		chrome.tabs.executeScript(tab.id, {file:'js/TalentViewer.js'});
		chrome.tabs.insertCSS(tab.id, {file:'css/talentviewer.css'});
		chrome.tabs.onUpdated.addListener(UpdateCallback);
		enabled = false
	} else {
		chrome.browserAction.setIcon({path:'icon.png'});
		chrome.tabs.executeScript(tab.id, {file:'js/Remove.js'});
		chrome.tabs.onUpdated.removeListener(UpdateCallback);
		enabled = true
	}
});
function UpdateCallback(tabId, changeInfo, tab){
	if (changeInfo.status == 'complete') {
		chrome.tabs.executeScript(tab.id, {file:'js/TalentViewer.js'});
		chrome.tabs.insertCSS(tab.id, {file:'css/talentviewer.css'});
	}	
}
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() {
            callback(JSON.parse(xhttp.responseText));
        };
        xhttp.onerror = function() {
            // Do whatever you want on error. Don't forget to invoke the
            // callback to clean up the communication port.
            callback();
        };
        xhttp.open(method, request.url, true);
        if (method == 'POST') {
            xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
		//console.log(request.data)
        xhttp.send(request.data);
        return true; // prevents the callback from being called too early on return
    }
});