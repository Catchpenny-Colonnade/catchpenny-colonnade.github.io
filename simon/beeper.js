window.Beeper = function({type, volume}) {
    let makeBeeper = function({frequency,callback}) {
        let audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
        let oscillator = audioCtx.createOscillator();
        let gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        if (volume) { gainNode.gain.value = volume; }
        if (type) { oscillator.type = type; }
        if (frequency) { oscillator.frequency.value = frequency; }
        if (callback) { oscillator.onended = callback; }
        return oscillator;
    }
    this.startBeep = function(args) {
        let oscillator = makeBeeper(args);
        oscillator.start();
        return function() {
            oscillator.stop();
        }
    }
    this.beep = function(args){
        let oscillator = makeBeeper(args);
        oscillator.start();
        setTimeout(() => { oscillator.stop(); }, args.duration * 1000);
    }
}