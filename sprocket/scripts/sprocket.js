namespace("sprocket.Sprocket", {
  "sprocket.SprocketFace": "Face",
  "sprocket.SprocketConfig": "Config",
  "sprocket.UpdateQueue": "UpdateQueue"
}, ({ Config, Face, UpdateQueue }) => {
  const bounds = {
    min: 0,
    max: 100
  };
  const inc = function(updates, property, value) {
    updates[property] = Math.min(bounds.max, updates[property] + value);
  }
  const dec = function(updates, property, value) {
    updates[property] = Math.max(bounds.min, updates[property] - value);
  }
  const log = function({ hunger, happiness }, action) {
    console.log({ hunger, happiness, action });
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        hunger: 50, // 0 is starving, 100 is full
        happiness: 50, // 0 is sad, 100 is happy
      };
      this.updateQueue = new UpdateQueue(() => this.state, (updates) => this.setState(updates), 500);
      setInterval(() => {
        this.updateQueue.enqueue((updates) => {
          dec(updates, "hunger", 2);
          dec(updates, "happiness", 1);
          log(updates, "interval");
          return updates;
        })
      }, 5000);
    }
    feed() {
      this.updateQueue.enqueue((updates) => {
        inc(updates, "hunger", 10);
        inc(updates, "happiness", 2);
        log(updates, "feed");
        return updates;
      })
    }
    play() {
      this.updateQueue.enqueue((updates) => {
        dec(updates, "hunger", 5);
        inc(updates, "happiness", 10);
        log(updates, "play");
        return updates;
      })
    }
    render() {
      const { emotion, verb, refs } = Config.getDisplayValues(this.state);
      return <div className="d-flex flex-column justify-content-center h-100">
        <div className="d-flex justify-content-center p-2">
          <h1>Sprocket</h1>
        </div>
        <div className="d-flex justify-content-center p-2">
          <h2>{verb} {emotion}</h2>
        </div>
        <div className="d-flex justify-content-center p-2">
          <Face label={emotion} emojiScale="lg" bgColor="white" refs={refs}/>
        </div>
        <div className="d-flex justify-content-center p-2">
          <div className="p-3">
            <button className="btn btn-primary" onClick={() => this.feed()}><h3 className="p-1">Feed!</h3></button>
          </div>
          <div className="p-3">
            <button className="btn btn-success" onClick={() => this.play()}><h3 className="p-1">Play!</h3></button>
          </div>
        </div>
      </div>;
    }
  }
});