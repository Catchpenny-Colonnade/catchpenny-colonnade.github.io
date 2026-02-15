namespace("sprocket.Sprocket", {
  "sprocket.UpdateQueue": "UpdateQueue"
}, ({ UpdateQueue }) => {
  const images = [
    "annoyed",
    "eating",
    "reading",
    "sleeping",
    "winner"
  ];
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        hunger: 50, // 0 is full, 100 is starving
        happiness: 50, // 0 is sad, 100 is happy
        image: images[3]
      };
      this.updateQueue = new UpdateQueue(() => this.state, (updates) => this.setState(updates), 500);
      setInterval(() => {
        this.updateQueue.enqueue((updates) => {
          updates.hunger += 2;
          updates.happiness -= 1;
          return updates;
        })
      }, 5000);
    }
    feed() {
      this.updateQueue.enqueue((updates) => {
        updates.hunger -= 10
        updates.happiness += 2;
        return updates;
      })
    }
    play() {
      this.updateQueue.enqueue((updates) => {
        updates.happiness += 10;
        updates.hunger += 5;
        return updates;
      })
    }
    render() {
      // todo
      return <div className="d-flex flex-column justify-content-around h-100">
        <div className="d-flex justify-content-center">
          <h1>Sprocket</h1>
        </div>
        <div className="d-flex justify-content-center">
          <div className="p-4 bg-info rounded rounded-5">
            <img src={`images/sprocket-${this.state.image}.png`}/>
          </div>
        </div>
        <div className="d-flex justify-content-center">
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