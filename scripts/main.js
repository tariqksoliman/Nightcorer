var audioCtx = new ( window.AudioContext || window.webkitAudioContext )();
var video, source, jungle;
var nightcorerOnOff, nightcorerSpeed;

function init() {
    chrome.storage.local.get('nightcorerOnOff', function (resultO) {
        chrome.storage.local.get('nightcorerSpeed', function (resultS) {
            
            nightcorerOnOff = resultO.nightcorerOnOff || false;
            nightcorerSpeed = parseFloat( resultS.nightcorerSpeed ) || 1;
            turnOnOff( nightcorerOnOff );
        } );
    } );
}

function turnOn() {
    video = document.querySelector( 'video' );

    //Can only attach this once
    if( !source ) {
        source = audioCtx.createMediaElementSource( video );
    }
    //Then source was already set so we disconnect the old one 
    else {
        try {
            source.disconnect( audioCtx.destination );
        }
        catch( e ) {}
    }

    jungle = new Jungle( audioCtx );

    jungle.setPitchOffset( (nightcorerSpeed - 1) * 2 );
    video.playbackRate = nightcorerSpeed;

    source.connect( jungle.input );
    jungle.output.connect( audioCtx.destination );
}

function turnOff() {
    if( audioCtx && source && jungle ) {
        source.disconnect( jungle.input );
        source.connect( audioCtx.destination );
        jungle.output.disconnect( audioCtx.destination );
        
        jungle.setPitchOffset( 0 );
        video.playbackRate = 1;
    }
}

function turnOnOff( on ) {
    if( on ) {
        turnOn();
    }
    else {
        turnOff();
    }
}

//In case of many imemediate refreshes, only refresh on the last one
//Just because it annoyed me otherwise
var refreshTimeout;
function timedRefresh() {
    clearTimeout( refreshTimeout );
    refreshTimeout = setTimeout( refresh, 1000 );
}
function refresh() {
    if( nightcorerOnOff ) {
        turnOff();
        turnOn();
    }
}

//Listen from the popup and background
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.nightcorerChangeSpeed ) {
            nightcorerSpeed = parseFloat( request.nightcorerChangeSpeed );
            refresh();
        }
        else if( request.hasOwnProperty( 'nightcorerOnOff' ) ) {
            nightcorerOnOff = request.nightcorerOnOff;
            turnOnOff( nightcorerOnOff );
        }
        else if( request.hasOwnProperty( 'refresh' ) ) {
            if( request.refresh === true ) {
                timedRefresh();
            }
        }
    }
);

//Sometimes the sound sounds kind of wobbly and this often fixes it
setTimeout( init, 500 );
setTimeout( timedRefresh, 3000 );