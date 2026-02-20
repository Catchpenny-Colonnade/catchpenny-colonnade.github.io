namespace("sprocket.FaceBuilder", {
  "sprocket.SprocketConfig": "Config",
  "sprocket.SprocketFace": "Face"
}, ({ Config, Face }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        eyes: "closed-eyes",
        mouth: "closed-smile",
        tongue: false,
        tears: false,
        sweat: false
      };
    }
    render() {
      const refs = [];
      if (this.state.eyes) {
        refs.push(this.state.eyes);
      }
      if (this.state.mouth) {
        refs.push(this.state.mouth);
      }
      if (this.state.tongue) {
        refs.push("tongue");
      }
      if (this.state.tears) {
        refs.push("tears");
      }
      if (this.state.sweat) {
        refs.push("sweat")
      }
      return <div className="d-flex justify-content-center w-100">
        <div className="d-flex flex-column w-25">
          <div>
            <label htmlFor="eyes" className="form-label">Eyes</label>
            <select 
              id="eyes"
              className="form-select form-select-lg mb-3" 
              value={ this.state.eyes } 
              onChange={ (e) => this.setState({ eyes: e.target.value }) }>
              { Config.getEyes().map(eyes => <option value={eyes[0]}>{eyes[0]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="mouth" className="form-label">Mouth</label>
            <select 
              id="mouth"
              className="form-select form-select-lg mb-3" 
              value={ this.state.mouth + (this.state.tongue?",tongue":"") } 
              onChange={ (e) => {
                const pair = e.target.value.split(",");
                this.setState({ mouth: pair[0], tongue: pair.length > 1 }) 
              } }>
              { Config.getMouths().map(mouth => <option value={mouth.join(",")}>{mouth.join(",")}</option>)}
            </select>
          </div>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="tears"
              checked={ this.state.tears } 
              onChange={ (e) => this.setState({ tears: e.target.checked })}/>
            <label className="form-check-label" htmlFor="tears">Tears</label>
          </div>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="sweat"
              checked={ this.state.sweat } 
              onChange={ (e) => this.setState({ sweat: e.target.checked })}/>
            <label className="form-check-label" htmlFor="sweat">Sweat</label>
          </div>
        </div>
        <div className="w-50">
          <Face label="" emojiScale="lg" bgColor="white" refs={refs}/>
        </div>
      </div>;
    }
  }
})