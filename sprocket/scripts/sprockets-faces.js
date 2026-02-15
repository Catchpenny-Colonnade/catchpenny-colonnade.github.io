namespace("sprocket.SprocketsFaces", {}, () => {
  const eyes = [
    "eyes",
    "angry-eyes",
    "closed-eyes",
    "dollar-eyed",
    "wide-eyed",
    "mellow-eyed",
    "heart-eyes",
    "sad-eyes",
    "side-eyed"
  ]
  const mouths = [
    "teeth-smile",
    "gasp",
    "closed-smile",
    "open-frown",
    "open-smile",
    "thin-lipped"
  ]
  const topAddOns = [
    [],
    ["sweat"],
    ["tears"]
  ]
  const tongueMouths = {
    "open-smile": [[], ["tongue"]],
    "open-frown": [[], ["tongue"]]
  }
  const dim = {
    w: 600,
    h: 600
  }
  const fullList = eyes.reduce((acc, eyeType) => {
    return mouths.reduce((acc2, mouth) => {
      const mouthAddons = tongueMouths[mouth] || [[]];
      return topAddOns.reduce((acc3, addOns) => {
        return mouthAddons.reduce((acc4, mouthAddon) => {
          acc4.push(["base", eyeType, mouth].concat(addOns).concat(mouthAddon));
          return acc4;
        }, acc3);
      }, acc2);
    }, acc)
  }, []);
  console.log({ count: fullList.length });
  return function(props) {
    return <div className="d-flex flex-wrap justify-content-center w-100">
      { fullList.map((refs) => <div className="emoji">
        <svg width="100%" height="100%" viewBox="0 0 600 600">
          { refs.map(href => <use href={`#${href}`}/>) }
        </svg>
      </div> )}
    </div>
  }
});