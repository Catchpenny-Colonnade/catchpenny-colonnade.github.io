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
  const nextFocus = function(index, currentAttempt) {
    const openColumns = currentAttempt.map((letter,i) => [letter,i]).filter(pair => pair[0].length == 0).map(pair => pair[1]);
    console.log({ openColumns });
    if (openColumns.length > 0) {
      // set step index to next open column
      const nextColumns = openColumns.filter(col => col > index);
      if (nextColumns.length > 0) {
        return nextColumns[0];
      } else {
        // if none, set step index to first open column
        return openColumns[0];
      }
    } else {
      return -1;
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
    nextFocus(index) {
      const stepIndex = nextFocus(index, this.state.currentAttempt);
      if (stepIndex >= 0) {
        this.setState({ stepIndex });
      }
    }
    update(event, index) {
      console.log({ event, index })
      var value = event.nativeEvent.data;
      const currentAttempt = Array.from(this.state.currentAttempt);
      currentAttempt[index] = value.toUpperCase();
      const stepIndex = nextFocus(index, currentAttempt);
      if (stepIndex >= 0) {
        // set step index to next open column
        const updateStepIndex = { currentAttempt, stepIndex };
        console.log({ updateStepIndex });
        this.setState(updateStepIndex);
      } else {
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
        console.log({ updates });
        this.setState(updates);
      }
    }
    afterRender() {
      if (this.state.attempts.length >= maxAttempts) {
        // confirm loss, show solution and attempts
        confirm(`GAME OVER!\n\nUnfortunately, you could not solve for this word:\n\n\t${this.state.word}\n\nYou attempted:\n\n\t${this.state.attempts.map(attempt => attempt.join("")).join("\n\t")}`);
        this.setState(getInitState());
      } else if (this.state.win == true) {
        // confirm win w/ attempt count
        confirm(`Congratulations!\n\nYou've solved the puzzle in only ${this.state.attempts.length} attempts!`);
        this.setState(getInitState());
      } else {
        const input = document.getElementById(`input${this.state.stepIndex}`);
        if (input) {
          input.focus();
        }
      }
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
                  <h2 className={`text-light bg-${buttonClass}`} style={{textAlign:"center"}}>{letter}</h2>
                </td>;
              }) }
            </tr>)}
            { this.state.attempts.length < maxAttempts && <tr>
              { this.state.currentAttempt.map((letter,index) => {
                console.log({ letter, index, stepIndex: this.state.stepIndex });
                return <td>
                  <h2 style={{textAlign:"center"}}>
                    { letter == "" ? <>
                      <input 
                        id={`input${index}`}
                        type="text" 
                        className={`form-control bg-dark text-light${(index == this.state.stepIndex ? " border border-success" : "")}`} 
                        maxLength={2} 
                        value={ letter } 
                        onClick={() => this.refocus(index)}
                        onChange={(e) => this.update(e, index)}
                        style={{width:"2em"}}/>
                    </>:<>
                      <button className="btn btn-dark" onClick={() => this.refocus(index)}>{letter}</button>
                    </>}
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
