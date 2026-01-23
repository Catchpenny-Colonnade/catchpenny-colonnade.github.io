namespace("wordy.Wordy", {
  "wordy.Words": "Words"
}, ({ Words }) => {
  const maxAttempts = 6
  const getInitState = function() {
    const word = Words[Math.floor(Math.random() * Words.length)].toUpperCase();
    const letterMap = word.split("").reduce((acc,letter,index) => {
      acc[letter] = index;
      return acc;
    }, {});
    return {
      word, letterMap, 
      attempts: [],
      stepIndex: 0,
      currentAttempt: Array(5).fill("")
    }
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = getInitState();
    }
    refocus(index) {
      const currentAttempt = this.state.currentAttempt;
      currentAttempt[index] = "";
      this.setState({ currentAttempt, stepIndex: index });
    }
    update(value, index) {
      const currentAttempt = Array.from(this.state.currentAttempt);
      currentAttempt[index] = value.toUpperCase();
      const openColumns = currentAttempt.map((letter,i) => [letter,i]).filter(pair => pair[0].length == 0).map(pair => pair[1]);
      if (openColumns.length > 0) {
        // add current attempt to attempts and clear current attempt and step index
        const attempts = Array.from(this.state.attempts);
        attempts.push(currentAttempt);
        const updates = {
          attempts,
          stepIndex: 0,
          currentAttempt: Array(5).fill("")
        }
        // check last attempt
        if (currentAttempt.join("") == this.state.word) {
        // if successful, set "win" state
          updates.win = true;
        }
        this.setState(updates);
      } else {
        // set step index to next open column
        const updateStepIndex = {};
        const nextColumns = openColumns.filter(col => col > index);
        if (nextColumns.length > 0) {
          updateStepIndex.stepIndex = nextColumns[0];
        } else {
          // if none, set step index to first open column
          updateStepIndex.stepIndex = openColumns[0];
        }
        this.setState(updateStepIndex);
      }
    }
    afterRender() {
      if (this.state.attempts.length >= maxAttempts) {
        // confirm loss, show solution and attempts
        confirm(`GAME OVER!\n\nUnfortunately, you could not solve for this word:\n\n\t${this.state.word}\n\nYou attempted:\n\n\t${this.state.attempts.map(attempt => attempt.join("")).join("\n\t")}`);
      } else if (this.state.win == true) {
        // confirm win w/ attempt count
        confirm(`Congratulations!\n\nYou've solved the puzzle in only ${this.state.attempts.length} attempts!`);
      }
      this.setState(getInitState());
    }
    componentDidMount() {
      this.afterRender();
    }
    componentDidUpdate() {
      this.afterRender();
    }
    render() {
      return <div className="d-flex justify-content-center w-100">
        <table className="table">
          <tbody>
            { this.state.attempts.map(attempt => <tr>
              { attempt.map((letter,index) => {
                const buttonClass = isNaN(this.state.letterMap[letter])?"dark":((this.state.letterMap[letter]==index)?"success":"warning");
                return <td>
                  <h2 className={`btn btn-${buttonClass}`}>{letter}</h2>
                </td>;
              }) }
            </tr>)}
            { this.state.attempts.length < maxAttempts && <tr>
              { this.state.currentAttempt.map((letter,index) => {
                return <td>
                  <h2>
                    <input 
                      type="text" 
                      className={`form-control${(index == this.state.stepIndex ? " border border-success" : "")}`} 
                      maxLength={1} 
                      autoFocus={ index == this.state.stepIndex } 
                      value={ letter } 
                      onClick={() => this.refocus(index)} 
                      onChange={(e) => this.update(e.target.value, index)}/>
                  </h2>
                </td>
              } ) }
            </tr> }
          </tbody>
        </table>
      </div>;
    }
  }
});
