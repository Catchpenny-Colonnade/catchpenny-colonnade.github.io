namespace("sprocket.SprocketsFaces", {
  "sprocket.SprocketConfig": "Config",
  "sprocket.SprocketFace": "Face"
}, ({ Config, Face }) => {
  const fullList = Config.getFullList();
  const hungerLevels = Config.getHungerLevels();
  const happinessLevels = Config.getHappinessLevels();
  const levelHeader = ([ level, min, max ]) => {
    return <th className="text-center">
      <h3>{ level }</h3>
      <h4>[ { min }, { max } )</h4>
    </th>
  };
  const listing = (refs) => <div className="m-2 text-center">
    <ul>
      { refs.map(ref => <li>{ ref }</li>) }
    </ul>
    <Face label={refs.join(",")} emojiScale="xs" bgColor="white" refs={refs}/>
  </div>
  return function (props) {
    return <div className="d-flex flex-column">
      <div className="d-flex justify-content-center w-100">
        <h1>Emotion Table</h1>
      </div>
      <div className="d-flex justify-content-center w-100">
        <table>
          <thead>
            <tr>
              <th></th>
              { hungerLevels.map(levelHeader) }
            </tr>
          </thead>
          <tbody>
            { happinessLevels.map(([ happinessLevel, happinessMin, happinessMax ]) => {
              return <tr>
                { levelHeader([ happinessLevel, happinessMin, happinessMax ]) }
                { hungerLevels.map(([ hungerLevel ]) => {
                  const [ emotion ] = Config.getEmotion(hungerLevel, happinessLevel);
                  const refs = Config.getRefsForEmotion(emotion);
                  return <td>
                    <div className="d-flex justify-content-center align-items-center">
                      <h5>{emotion}</h5>
                      <Face label={emotion} emojiScale="xs" bgColor="white" refs={refs}/>
                    </div>
                  </td>;
                }) }
              </tr>
            }) }
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-center w-100">
        <h1>Eyes</h1>
      </div>
      <div className="d-flex flex-wrap justify-content-center w-100">
        { Config.getEyes().map(listing) }
      </div>
      <div className="d-flex justify-content-center w-100">
        <h1>Mouths</h1>
      </div>
      <div className="d-flex flex-wrap justify-content-center w-100">
        { Config.getMouths().map(listing) }
      </div>
      <div className="d-flex justify-content-center w-100">
        <h1>Add-Ons</h1>
      </div>
      <div className="d-flex flex-wrap justify-content-center w-100">
        { Config.getAddOns().map(listing) }
      </div>
      <div className="d-flex justify-content-center w-100">
        <h1>Permutations</h1>
      </div>
      <div className="d-flex flex-wrap justify-content-center w-100">
        { fullList.map(listing) }
      </div>
    </div>;
  }
});