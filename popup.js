var rangeSlider = document.getElementById( 'rangeSlider' );
var speedIndicator = document.getElementById( 'speedIndicator' );
var onoff = document.getElementById( 'onoff' );

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.storage.local.get('nightcorerOnOff', function (resultO) {
        chrome.storage.local.get('nightcorerSpeed', function (resultS) {

            //Get saved on and speed values
            var nightcorerOnOff = resultO.nightcorerOnOff || false;
            var nightcorerSpeed = resultS.nightcorerSpeed || 1;

            //Update popup
            onoff.checked = nightcorerOnOff;
            rangeSlider.value = nightcorerSpeed;
            speedIndicator.value = parseFloat( nightcorerSpeed ).toFixed(2);

            //Send the onoff value when changed to content
            onoff.addEventListener( 'change', function( e ) {
                var on = this.checked;

                chrome.tabs.sendMessage(tabs[0].id, {nightcorerOnOff: on}, function(response) {
                    chrome.storage.local.set({ 'nightcorerOnOff': on } );
                });
                    
            }, false );

            //Send the speed value when changed to content and update the indicator
            rangeSlider.addEventListener( 'input', function( e ) {
                var newSpeed = this.value;
                
                speedIndicator.value = parseFloat( newSpeed ).toFixed(2);
                chrome.tabs.sendMessage(tabs[0].id, {nightcorerChangeSpeed: newSpeed}, function(response) {
                    chrome.storage.local.set({ 'nightcorerSpeed': newSpeed } );
                });
            }, false );

            //Send the speed value when users enters a value (between 0.50 and 2.00) in the indicator
            var previousSpeedVal = speedIndicator.value;
            speedIndicator.addEventListener( 'click', function( e ) {
                speedIndicator.value = '';
            } );
            speedIndicator.addEventListener( 'focusout', function( e ) {
                var finalSpeed = this.value;
                if( finalSpeed.length < 4 ) {
                    speedIndicator.value = previousSpeedVal;
                }
            });
            speedIndicator.addEventListener( 'input', function( e ) {
                var newSpeed = this.value;
                if( newSpeed.length == 1 ) {
                    if( newSpeed[0] == '.' )
                        speedIndicator.value = '0.';
                }
                else if( newSpeed.length == 2 ) {
                    if( newSpeed[1] != '.' )
                        speedIndicator.value = newSpeed[0] + '.' + newSpeed[1];
                }
                else if( newSpeed.length >= 4 ) {
                    if( newSpeed > 2 ) newSpeed = 2;
                    else if( newSpeed < 0.5 ) newSpeed = 0.5;

                    rangeSlider.value = parseFloat( newSpeed ).toFixed(2);
                    speedIndicator.value = parseFloat( newSpeed ).toFixed(2);
                    previousSpeedVal = speedIndicator.value;
                    chrome.tabs.sendMessage(tabs[0].id, {nightcorerChangeSpeed: newSpeed}, function(response) {
                        chrome.storage.local.set({ 'nightcorerSpeed': newSpeed } );
                    });
                    document.activeElement.blur();
                }
                
            }, false );
        });
    });
});