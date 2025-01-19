(function(){
    window.Timeouter = function(time,onTimeout) {
        let t;
        this.clear = function() {
            clearTimeout(t);
        }
        this.reset = function() {
            clearTimeout(t);
            t = setTimeout(onTimeout,time);
        }
    }
})()