namespace("segments.Segments", {
  "segments.Display": "Display"
}, ({ Display }) => {
  const Defs = Display.Defs;
  const activeColor = "red";
  const passiveColor = "#444"
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    selectSegment(digit, segment) {
      alert(`digit: ${digit}, segment: ${segment}`)
    }
    render() {
      return <>
        <Defs></Defs>
        <div className="d-flex flex-column justify-content-center">
          <div className="row">
            { [0,1,2,3,4].map(digit => <div className="col-2">
              <Display digit={digit} activeColor={activeColor} passiveColor={passiveColor} onClick={(segment) => this.selectSegment(digit, segment)}></Display>
            </div>) }
          </div>
          <div className="row">
            { [5,6,7,8,9].map(digit => <div className="col-2">
              <Display digit={digit} activeColor={activeColor} passiveColor={passiveColor} onClick={(segment) => this.selectSegment(digit, segment)}></Display>
            </div>) }
          </div>
        </div>
      </>;
    }
  }
})