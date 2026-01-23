namespace("wordy.Wordy", {
  "wordy.Words": "Words"
}, ({ Words }) => {
  var word = Words[Math.floor(Math.random() * Words.length)].split("");
  var letterMap = word.reduce((acc,letter,index) => {
    acc[letter] = index;
    return acc;
  }, {});
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        word: Words[Math.floor(Math.random() * Words.length)],
        attempts: [[]],
        stepIndex: 0,
      };
      var me = this;
      var keyHold = function(event) {
        console.log({ event });
      };
      document.addEventListener("keyhold", keyHold);
    }
    render() {
      return <div className="d-flex justify-content-center w-100">
        <table className="table">
          <tbody>
            { this.state.attempts.map(attempt => <tr>
              { attempt.map((letter,index) => {
                var buttonClass = isNaN(letterMap[letter])?"dark":((letterMap[letter]==index)?"success":"warning");
                return <td>
                  <h2 className={`btn btn-${buttonClass}`}>{letter}</h2>
                </td>;
              }) }
            </tr>)}
          </tbody>
        </table>
      </div>;
    }
  }
});
