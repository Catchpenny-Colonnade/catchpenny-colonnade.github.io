namespace('minesweeper.StopwatchDisplay',{
    "minesweeper.DigitalDisplay":"DigitalDisplay"
},({ DigitalDisplay }) => {
    const Stopwatch = function(uid,delay) {
        const state = {};
        const updateState = function(newState) {
            Object.entries(newState).forEach(([k,v]) => {
                state[k] = v;
            })
        }
        const tick = function(startTime, tickCount) {
            const timeDiff = Date.now() - startTime;
            document.dispatchEvent(new CustomEvent("tick-"+uid, { detail:{ timeDiff, tick: tickCount++ }}));
            return { startTime, timeDiff, tickCount }
        }
        this.start = function() {
            updateState(tick(Date.now(), 0));
            state.interval = setInterval(() => {
                updateState(tick(state.startTime, state.tickCount));
            }, delay);
        }
        this.stop = function() {
            clearInterval(state.interval);
            updateState(tick(state.startTime, state.tickCount));
        }
        this.reset = function() {
            delete state.tickCount;
            delete state.timeDiff;
        }
        this.timeFromStart = function() {
            return state.timeDiff;
        }
        this.tickCount = function() {
            return state.tickCount;
        }
        this.startTime = function() {
            return state.startTime;
        }
        this.setOnTick = function(onTick) {
            document.addEventListener("tick-"+uid,(e) => {
                onTick(e.detail);
            });
        }
    }
    Stopwatch.Display = class extends React.Component {
        constructor(props) {
            super(props);
            const { stopwatch, digitCount } = props;
            this.state = {
                value: 0,
                digitCount
            };
            stopwatch.setOnTick(({ timeDiff }) => {
                this.setState({ value: Math.floor(timeDiff/1000) });
            });
        }
        render() {
            return <DigitalDisplay value={this.state.value || 0} digitCount={this.state.digitCount}></DigitalDisplay>;
        }
    }
    return Stopwatch;
});
