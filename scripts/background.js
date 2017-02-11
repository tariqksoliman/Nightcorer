//YouTube doesn't reload the entire page when going between videos
//This listens to changes so that the audio can update properly with a timedRefresh
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
   chrome.tabs.sendMessage(tabId, {refresh: true}, function(response) {});
});