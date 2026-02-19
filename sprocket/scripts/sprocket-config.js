namespace("sprocket.SprocketConfig", {}, () => {
  const eyes = [
    ["closed-eyes"],
    ["blink-eyes"],
    ["sad-eyes"],
    ["angry-eyes"],
    ["angry-raised-left"],
    ["angry-raised-right"],
    ["mellow-eyed"],
    ["raised-eyes"],
    ["mellow-raised-left"],
    ["mellow-raised-right"],
    ["side-eyed-left"],
    ["side-eyed-right"],
    ["wide-eyed"],
    ["dollar-eyed"],
    ["heart-eyes"],
    ["sad-wink-left"],
    ["sad-wink-right"],
    ["mellow-wink-left"],
    ["mellow-wink-right"],
  ];
  const getEyes = function() {
    return Array.from(eyes);
  }
  const mouths = [
    ["closed-smile"],
    ["teeth-smile"],
    ["open-smile"],
    ["open-smile", "tongue"],
    ["thin-lipped"],
    ["gasp"],
    ["wide-open"],
    ["wide-open", "tongue"],
    ["closed-frown"],
    ["teeth-frown"],
    ["open-frown"],
    ["open-frown", "tongue"],
  ]
  const getMouths = function() {
    return Array.from(mouths);
  }
  const addOns = [
    [],
    ["tears"],
    ["sweat"]
  ]
  const getAddOns = function() {
    return Array.from(addOns);
  }
  const eyesAndMouths = [
    ["raised-eyes", "gasp"],
    ["wide-eyed", "gasp"],
    ["dollar-eyed", "gasp"],
    ["heart-eyes", "gasp"],
    ["closed-eyes", "closed-smile"],
    ["blink-eyes", "closed-smile"],
    ["sad-eyes", "closed-smile"],
    ["angry-eyes", "closed-smile"],
    ["mellow-eyed", "closed-smile"],
    ["raised-eyes", "closed-smile"],
    ["side-eyed-left", "closed-smile"],
    ["side-eyed-right", "closed-smile"],
    ["wide-eyed", "closed-smile"],
    ["dollar-eyed", "closed-smile"],
    ["heart-eyes", "closed-smile"],
    ["sad-wink-left", "closed-smile"],
    ["sad-wink-right", "closed-smile"],
    ["mellow-wink-left", "closed-smile"],
    ["mellow-wink-right", "closed-smile"],
    ["closed-eyes", "teeth-smile"],
    ["blink-eyes", "teeth-smile"],
    ["sad-eyes", "teeth-smile"],
    ["angry-eyes", "teeth-smile"],
    ["mellow-eyed", "teeth-smile"],
    ["raised-eyes", "teeth-smile"],
    ["side-eyed-left", "teeth-smile"],
    ["side-eyed-right", "teeth-smile"],
    ["wide-eyed", "teeth-smile"],
    ["dollar-eyed", "teeth-smile"],
    ["heart-eyes", "teeth-smile"],
    ["sad-wink-left", "teeth-smile"],
    ["sad-wink-right", "teeth-smile"],
    ["mellow-wink-left", "teeth-smile"],
    ["mellow-wink-right", "teeth-smile"],
    ["closed-eyes", "open-smile"],
    ["blink-eyes", "open-smile"],
    ["sad-eyes", "open-smile"],
    ["angry-eyes", "open-smile"],
    ["mellow-eyed", "open-smile"],
    ["raised-eyes", "open-smile"],
    ["side-eyed-left", "open-smile"],
    ["side-eyed-right", "open-smile"],
    ["wide-eyed", "open-smile"],
    ["dollar-eyed", "open-smile"],
    ["heart-eyes", "open-smile"],
    ["sad-wink-left", "open-smile"],
    ["sad-wink-right", "open-smile"],
    ["mellow-wink-left", "open-smile"],
    ["mellow-wink-right", "open-smile"],
    ["closed-eyes", "open-smile", "tongue"],
    ["blink-eyes", "open-smile", "tongue"],
    ["sad-eyes", "open-smile", "tongue"],
    ["angry-eyes", "open-smile", "tongue"],
    ["mellow-eyed", "open-smile", "tongue"],
    ["raised-eyes", "open-smile", "tongue"],
    ["side-eyed-left", "open-smile", "tongue"],
    ["side-eyed-right", "open-smile", "tongue"],
    ["wide-eyed", "open-smile", "tongue"],
    ["dollar-eyed", "open-smile", "tongue"],
    ["heart-eyes", "open-smile", "tongue"],
    ["sad-wink-left", "open-smile", "tongue"],
    ["sad-wink-right", "open-smile", "tongue"],
    ["mellow-wink-left", "open-smile", "tongue"],
    ["mellow-wink-right", "open-smile", "tongue"],
    ["closed-eyes", "thin-lipped"],
    ["blink-eyes", "thin-lipped"],
    ["sad-eyes", "thin-lipped"],
    ["angry-eyes", "thin-lipped"],
    ["angry-raised-left", "thin-lipped"],
    ["angry-raised-right", "thin-lipped"],
    ["mellow-eyed", "thin-lipped"],
    ["raised-eyes", "thin-lipped"],
    ["mellow-raised-left", "thin-lipped"],
    ["mellow-raised-right", "thin-lipped"],
    ["side-eyed-left", "thin-lipped"],
    ["side-eyed-right", "thin-lipped"],
    ["wide-eyed", "thin-lipped"],
    ["dollar-eyed", "thin-lipped"],
    ["heart-eyes", "thin-lipped"],
    ["closed-eyes", "wide-open"],
    ["blink-eyes", "wide-open"],
    ["sad-eyes", "wide-open"],
    ["angry-eyes", "wide-open"],
    ["mellow-eyed", "wide-open"],
    ["raised-eyes", "wide-open"],
    ["side-eyed-left", "wide-open"],
    ["side-eyed-right", "wide-open"],
    ["wide-eyed", "wide-open"],
    ["dollar-eyed", "wide-open"],
    ["heart-eyes", "wide-open"],
    ["closed-eyes", "wide-open", "tongue"],
    ["blink-eyes", "wide-open", "tongue"],
    ["sad-eyes", "wide-open", "tongue"],
    ["angry-eyes", "wide-open", "tongue"],
    ["mellow-eyed", "wide-open", "tongue"],
    ["raised-eyes", "wide-open", "tongue"],
    ["side-eyed-left", "wide-open", "tongue"],
    ["side-eyed-right", "wide-open", "tongue"],
    ["wide-eyed", "wide-open", "tongue"],
    ["dollar-eyed", "wide-open", "tongue"],
    ["heart-eyes", "wide-open", "tongue"],
    ["closed-eyes", "closed-frown"],
    ["blink-eyes", "closed-frown"],
    ["sad-eyes", "closed-frown"],
    ["angry-eyes", "closed-frown"],
    ["angry-raised-left", "closed-frown"],
    ["angry-raised-right", "closed-frown"],
    ["mellow-eyed", "closed-frown"],
    ["raised-eyes", "closed-frown"],
    ["mellow-raised-left", "closed-frown"],
    ["mellow-raised-right", "closed-frown"],
    ["side-eyed-left", "closed-frown"],
    ["side-eyed-right", "closed-frown"],
    ["wide-eyed", "closed-frown"],
    ["dollar-eyed", "closed-frown"],
    ["heart-eyes", "closed-frown"],
    ["closed-eyes", "teeth-frown"],
    ["blink-eyes", "teeth-frown"],
    ["sad-eyes", "teeth-frown"],
    ["angry-eyes", "teeth-frown"],
    ["angry-raised-left", "teeth-frown"],
    ["angry-raised-right", "teeth-frown"],
    ["mellow-eyed", "teeth-frown"],
    ["raised-eyes", "teeth-frown"],
    ["mellow-raised-left", "teeth-frown"],
    ["mellow-raised-right", "teeth-frown"],
    ["side-eyed-left", "teeth-frown"],
    ["side-eyed-right", "teeth-frown"],
    ["wide-eyed", "teeth-frown"],
    ["dollar-eyed", "teeth-frown"],
    ["heart-eyes", "teeth-frown"],
    ["closed-eyes", "open-frown"],
    ["blink-eyes", "open-frown"],
    ["sad-eyes", "open-frown"],
    ["angry-eyes", "open-frown"],
    ["mellow-eyed", "open-frown"],
    ["raised-eyes", "open-frown"],
    ["side-eyed-left", "open-frown"],
    ["side-eyed-right", "open-frown"],
    ["wide-eyed", "open-frown"],
    ["dollar-eyed", "open-frown"],
    ["heart-eyes", "open-frown"],
    ["closed-eyes", "open-frown", "tongue"],
    ["blink-eyes", "open-frown", "tongue"],
    ["sad-eyes", "open-frown", "tongue"],
    ["angry-eyes", "open-frown", "tongue"],
    ["mellow-eyed", "open-frown", "tongue"],
    ["raised-eyes", "open-frown", "tongue"],
    ["side-eyed-left", "open-frown", "tongue"],
    ["side-eyed-right", "open-frown", "tongue"],
    ["wide-eyed", "open-frown", "tongue"],
    ["dollar-eyed", "open-frown", "tongue"],
    ["heart-eyes", "open-frown", "tongue"],
  ];
  const eyesAndMouthsWithTears = [
    ["wide-eyed", "gasp"],
    ["dollar-eyed", "gasp"],
    ["heart-eyes", "gasp"],
    ["closed-eyes", "closed-smile"],
    ["blink-eyes", "closed-smile"],
    ["sad-eyes", "closed-smile"],
    ["wide-eyed", "closed-smile"],
    ["dollar-eyed", "closed-smile"],
    ["heart-eyes", "closed-smile"],
    ["blink-eyes", "teeth-smile"],
    ["sad-eyes", "teeth-smile"],
    ["wide-eyed", "teeth-smile"],
    ["dollar-eyed", "teeth-smile"],
    ["heart-eyes", "teeth-smile"],
    ["blink-eyes", "open-smile"],
    ["sad-eyes", "open-smile"],
    ["wide-eyed", "open-smile"],
    ["dollar-eyed", "open-smile"],
    ["heart-eyes", "open-smile"],
    ["blink-eyes", "wide-open"],
    ["sad-eyes", "wide-open"],
    ["angry-eyes", "wide-open"],
    ["wide-eyed", "wide-open"],
    ["dollar-eyed", "wide-open"],
    ["heart-eyes", "wide-open"],
    ["blink-eyes", "wide-open", "tongue"],
    ["sad-eyes", "wide-open", "tongue"],
    ["angry-eyes", "wide-open", "tongue"],
    ["wide-eyed", "wide-open", "tongue"],
    ["dollar-eyed", "wide-open", "tongue"],
    ["heart-eyes", "wide-open", "tongue"],
    ["closed-eyes", "closed-frown"],
    ["blink-eyes", "closed-frown"],
    ["sad-eyes", "closed-frown"],
    ["angry-eyes", "closed-frown"],
    ["wide-eyed", "closed-frown"],
    ["dollar-eyed", "closed-frown"],
    ["heart-eyes", "closed-frown"],
    ["blink-eyes", "teeth-frown"],
    ["sad-eyes", "teeth-frown"],
    ["angry-eyes", "teeth-frown"],
    ["wide-eyed", "teeth-frown"],
    ["dollar-eyed", "teeth-frown"],
    ["heart-eyes", "teeth-frown"],
    ["blink-eyes", "open-frown"],
    ["sad-eyes", "open-frown"],
    ["angry-eyes", "open-frown"],
    ["wide-eyed", "open-frown"],
    ["dollar-eyed", "open-frown"],
    ["heart-eyes", "open-frown"],
    ["blink-eyes", "open-frown", "tongue"],
    ["sad-eyes", "open-frown", "tongue"],
    ["angry-eyes", "open-frown", "tongue"],
    ["wide-eyed", "open-frown", "tongue"],
    ["dollar-eyed", "open-frown", "tongue"],
    ["heart-eyes", "open-frown", "tongue"],
  ];
  const eyesAndMouthsWithSweat = [
    ["wide-eyed", "gasp"],
    ["dollar-eyed", "gasp"],
    ["heart-eyes", "gasp"],
    ["sad-eyes", "closed-smile"],
    ["blink-eyes", "teeth-smile"],
    ["sad-eyes", "teeth-smile"],
    ["blink-eyes", "open-smile"],
    ["sad-eyes", "open-smile"],
    ["sad-wink-left", "open-smile"],
    ["sad-wink-right", "open-smile"],
    ["blink-eyes", "open-smile", "tongue"],
    ["sad-eyes", "open-smile", "tongue"],
    ["sad-wink-left", "open-smile", "tongue"],
    ["sad-wink-right", "open-smile", "tongue"],
    ["closed-eyes", "thin-lipped"],
    ["sad-eyes", "thin-lipped"],
    ["angry-eyes", "thin-lipped"],
    ["wide-eyed", "thin-lipped"],
    ["dollar-eyed", "thin-lipped"],
    ["heart-eyes", "thin-lipped"],
    ["blink-eyes", "wide-open", "tongue"],
    ["sad-eyes", "wide-open", "tongue"],
    ["blink-eyes", "closed-frown"],
    ["sad-eyes", "closed-frown"],
    ["angry-eyes", "closed-frown"],
    ["mellow-eyed", "closed-frown"],
    ["wide-eyed", "closed-frown"],
    ["blink-eyes", "teeth-frown"],
    ["sad-eyes", "teeth-frown"],
    ["angry-eyes", "teeth-frown"],
    ["mellow-eyed", "teeth-frown"],
    ["wide-eyed", "teeth-frown"],
    ["closed-eyes", "open-frown"],
    ["blink-eyes", "open-frown"],
    ["sad-eyes", "open-frown"],
    ["angry-eyes", "open-frown"],
    ["mellow-eyed", "open-frown"],
    ["wide-eyed", "open-frown"],
    ["dollar-eyed", "open-frown"],
    ["heart-eyes", "open-frown"],
    ["closed-eyes", "open-frown", "tongue"],
    ["blink-eyes", "open-frown", "tongue"],
    ["sad-eyes", "open-frown", "tongue"],
    ["angry-eyes", "open-frown", "tongue"],
    ["mellow-eyed", "open-frown", "tongue"],
    ["wide-eyed", "open-frown", "tongue"],
    ["dollar-eyed", "open-frown", "tongue"],
    ["heart-eyes", "open-frown", "tongue"],
  ];
  const getFullList = function() {
    return eyesAndMouths.concat(eyesAndMouthsWithTears.map(attrs => {
      return attrs.concat(["tears"]);
    })).concat(eyesAndMouthsWithSweat.map(attrs => {
      return attrs.concat(["sweat"]);
    }));
  }
  const hungerLevels = [{
    level: "starving",
    min: 0,
    max: 10
  },{
    level: "hungry",
    min: 10,
    max: 25
  },{
    level: "'I Could Eat'",
    min: 25,
    max: 50
  },{
    level: "'I'm Good'",
    min: 50,
    max: 75
  },{
    level: "satisfied",
    min: 75,
    max: 90
  },{
    level: "full",
    min: 90,
    max: 101
  }];
  const happinessLevels = [{
    level: "angry",
    min: 0,
    max: 10
  },{
    level: "grumpy",
    min: 10,
    max: 25
  },{
    level: "bored",
    min: 25,
    max: 50
  },{
    level: "content",
    min: 50,
    max: 75
  },{
    level: "happy",
    min: 75,
    max: 90
  },{
    level: "excited",
    min: 90,
    max: 101
  }];
  const getLevels = function(levels) {
    return levels.map(({ level, min, max }) => [ level, min, max ]);
  }
  const getHungerLevels = () => getLevels(hungerLevels);
  const getHappinessLevels = () => getLevels(happinessLevels);
  const getLevel = function(value,levels) {
    for(var i = 0; i < levels.length; i++) {
      const { level, min, max } = levels[i];
      if (value >= min && value < max) {
        return level;
      }
    }
  }
  const getHungerLevel = (value) => getLevel(value, hungerLevels);
  const getHappinessLevel = (value) => getLevel(value, happinessLevels);
  const emotionTable = {
    "starving,angry": ["Sick"],
    "starving,grumpy": ["Sick"],
    "starving,bored": ["Crying"],
    "starving,content": ["Starving"],
    "starving,happy": ["Starving"],
    "starving,excited": ["Starving"],
    "hungry,angry": ["Grumpy"],
    "hungry,grumpy": ["Grumpy"],
    "hungry,bored": ["Hungry"],
    "hungry,content": ["Hungry"],
    "hungry,happy": ["Zoomies", "has the"],
    "hungry,excited": ["Zoomies", "has the"],
    "'I Could Eat',angry": ["Grumpy"],
    "'I Could Eat',grumpy": ["Grumpy"],
    "'I Could Eat',bored": ["Bored"],
    "'I Could Eat',content": ["Serene"],
    "'I Could Eat',happy": ["Serene"],
    "'I Could Eat',excited": ["Serene"],
    "'I'm Good',angry": ["Grumpy"],
    "'I'm Good',grumpy": ["Grumpy"],
    "'I'm Good',bored": ["Bored"],
    "'I'm Good',content": ["Serene"],
    "'I'm Good',happy": ["Serene"],
    "'I'm Good',excited": ["Serene"],
    "satisfied,angry": ["Grumpy"],
    "satisfied,grumpy": ["Grumpy"],
    "satisfied,bored": ["Bored"],
    "satisfied,content": ["Serene"],
    "satisfied,happy": ["Happy"],
    "satisfied,excited": ["Excited"],
    "full,angry": ["Grumpy"],
    "full,grumpy": ["Grumpy"],
    "full,bored": ["Bored"],
    "full,content": ["Sleepy"],
    "full,happy": ["Happy"],
    "full,excited": ["Zoomies", "has the"]
  }
  const getEmotion = function(hungerLevel,happinessLevel) {
    return Array.from(emotionTable[`${hungerLevel},${happinessLevel}`]);
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
  const getEmotions = function() {
    return Object.entries(emotions).reduce((acc, [emotion, refs]) => {
      acc[emotion] = Array.from(refs)
      return acc;
    }, {});
  }
  const getRefsForEmotion = function(emotion) {
    return Array.from(emotions[emotion]);
  }
  const getDisplayValues = function({ hunger, happiness }) {
    const hungerLevel = getHungerLevel(hunger);
    const happinessLevel = getHappinessLevel(happiness);
    const [emotion, verb] = getEmotion(hungerLevel, happinessLevel);
    return {
      emotion,
      verb: verb || "is",
      refs: getRefsForEmotion(emotion)
    }
  }
  const getInitBounds = function() {
    return Object.entries({
      min: 0,
      max: 100,
      init: 50,
      interval: 500
    }).reduce((acc, [k,v]) => {
      acc[k] = v;
      return acc;
    }, {});
  };
  const updates = {
    decay: {
      happiness: ["dec", 1],
      hunger: ["dec", 2],
    },
    feed: {
      happiness: ["inc", 2],
      hunger: ["inc", 10]
    },
    play: {
      happiness: ["inc", 10],
      hunger: ["dec", 5]
    }
  }
  const math = {
    inc: function(updates, property, value) {
     updates[property] = Math.min(bounds.max, updates[property] + value);
    },
    dec: function(updates, property, value) {
      updates[property] = Math.max(bounds.min, updates[property] - value);
    }
  }
  const updateState = function(state, action) {
    const steps = updates[action];
    Object.entries(steps).forEach(([property, [direction, value]]) => {
      math[direction](state, property, value);
    });
  }
  return { 
    getEyes,
    getMouths,
    getAddOns,
    getFullList,
    getHungerLevels,
    getHappinessLevels,
    getHungerLevel,
    getHappinessLevel,
    getEmotion,
    getEmotions,
    getRefsForEmotion,
    getDisplayValues,
    getInitBounds
  };
});