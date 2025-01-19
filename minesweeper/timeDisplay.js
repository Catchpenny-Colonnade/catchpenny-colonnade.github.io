namespace('minesweeper.TimeDisplay',{
    "minesweeper.DigitalDisplay":"DigitalDisplay"
},({ DigitalDisplay }) => {
    const interval = 999;
    const calcTimeDiff = function(startTimeSeconds) {
        return Math.floor(Date.now()/1000) - startTimeSeconds;
    }
    return class extends React.Component {
        constructor(props) {
            super(props);
            console.log({ props })
            const startTime = Math.floor(props.startTime/1000);
            this.state = {
                digitCount: props.digitCount,
                startTime,
                timeDiff: calcTimeDiff(startTime),
                interval: setInterval(() => {
                    console.log({ state: this.state })
                    this.setState({ timeDiff: calcTimeDiff(this.state.startTime) });
                }, interval)
            }
            console.log({ state: this.state })
        }
        componentDidUpdate() {
          this.afterRender();
        }
        componentDidMount(){
          this.afterRender();
        }
        afterRender() {
        }
        render() {
            return <DigitalDisplay value={this.state.timeDiff} digitCount={this.state.digitCount}></DigitalDisplay>;
        }
    }
});