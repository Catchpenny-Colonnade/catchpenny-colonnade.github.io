namespace("sprocket.Sprocket", {
  "sprocket.UpdateQueue": "UpdateQueue"
}, ({ UpdateQueue }) => {
  const hungerLevels = [{
    level: "starving",
    min: 1,
    max: 10
  },{
    level: "hungry",
    min: 10,
    max: 30
  },{
    level: "content",
    min: 30,
    max: 70
  },{
    level: "satisfied",
    min: 70,
    max: 90
  },{
    level: "full",
    min: 90,
    max: 100
  }];
  const happinessLevels = [{
    level: "grumpy",
    min: 1,
    max: 10
  },{
    level: "bored",
    min: 10,
    max: 30
  },{
    level: "content",
    min: 30,
    max: 70
  },{
    level: "happy",
    min: 70,
    max: 90
  },{
    level: "excited",
    min: 90,
    max: 100
  }];
  const emotionTable = {
    "starving,grumpy": ["Sick"],
    "starving,bored": ["Crying"],
    "starving,content": ["Starving"],
    "starving,happy": ["Starving"],
    "starving,excited": ["Starving"],
    "hungry,grumpy": ["Grumpy"],
    "hungry,bored": ["Hungry"],
    "hungry,content": ["Hungry"],
    "hungry,happy": ["Zoomies", "has the"],
    "hungry,excited": ["Zoomies", "has the"],
    "content,grumpy": ["Grumpy"],
    "content,bored": ["Bored"],
    "content,content": ["Serene"],
    "content,happy": ["Serene"],
    "content,excited": ["Serene"],
    "satisfied,grumpy": ["Grumpy"],
    "satisfied,bored": ["Bored"],
    "satisfied,content": ["Serene"],
    "satisfied,happy": ["Happy"],
    "satisfied,excited": ["Excited"],
    "full,grumpy": ["Grumpy"],
    "full,bored": ["Bored"],
    "full,content": ["Sleepy"],
    "full,happy": ["Happy"],
    "full,excited": ["Zoomies", "has the"]
  }
  const emotions = {
    Sick: ["sad-eyes","open-frown","tongue","sweat"],
    Crying: ["sad-eyes","wide-open","tears"],
    Grumpy: ["mellow-eyed","closed-frown"],
    Hungry: ["raised-eyes","wide-open","tongue"],
    Bored: ["side-eyed-right","thin-lipped"],
    Evil: ["angry-eyes","teeth-smile"],
    Starving: ["angry-eyes","open-frown","tongue"],
    Serene: ["closed-eyes","closed-smile"],
    Sleepy: ["blink-eyes","thin-lipped"],
    Happy: ["blink-eyes","teeth-smile"],
    Excited: ["heart-eyes","teeth-smile"],
    Zoomies: ["wide-eyed","open-smile"]
  }
  const dim = {
    w: 525,
    h: 525
  }
  const getLevel = function(value,levels) {
    for(var i = 0; i < levels.length; i++) {
      const { level, min, max } = levels[i];
      if (value >= min && value < max) {
        return level;
      }
    }
  }
  const bounds = {
    min: 0,
    max: 100
  };
  const getDisplayValues = function({ hunger, happiness }) {
    const hungerLevel = getLevel(hunger, hungerLevels);
    const happinessLevel = getLevel(happiness, happinessLevels);
    const [emotion, verb] = emotionTable[`${hungerLevel},${happinessLevel}`];
    return {
      emotion,
      verb: verb || "is",
      refs: emotions[emotion]
    }
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
          updates.hunger -= 2;
          updates.happiness -= 1;
          return updates;
        })
      }, 5000);
    }
    feed() {
      this.updateQueue.enqueue((updates) => {
        updates.hunger += 10
        updates.happiness += 2;
        return updates;
      })
    }
    play() {
      this.updateQueue.enqueue((updates) => {
        updates.happiness -= 10;
        updates.hunger += 5;
        return updates;
      })
    }
    render() {
      // todo
      const { emotion, verb, refs } = getDisplayValues(this.state);
      return <div className="d-flex flex-column justify-content-around h-100">
        <div className="d-flex justify-content-center">
          <h1>Sprocket</h1>
        </div>
        <div className="d-flex justify-content-center">
          <h3>{verb} {emotion}</h3>
        </div>
        <div className="d-flex justify-content-center">
          <div className="emoji-lg m-2">
            <svg width="100%" height="100%" viewBox={`0 0 ${dim.w} ${dim.h}`}>
              <rect width={dim.w} height={dim.h} rx="100" ry="100" fill="white" stroke="black" strokeWidth="10" />
              <use href="#base" />
              { refs.map(href => <use href={`#${href}`} />) }
            </svg>
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