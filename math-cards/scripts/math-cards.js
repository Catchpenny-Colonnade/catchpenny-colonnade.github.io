namespace("math-cards.MathCards", {}, () => {
  const functions = {
    "add": ["+", (a,b) => a + b],
    "mult": ["*", (a,b) => a * b]
  };
  const digits = [0,1,2,3,4,5,6,7,8,9];
  const randAB = function() {
    const a = digits[Math.floor(Math.random() * digits.length)];
    const b = digits[Math.floor(Math.random() * digits.length)];
    return { a, b };
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      const [fn, func] = functions[props.fn];
      this.fn = fn;
      this.func = func;
      this.buildCoord = (a,b) => `${a}${fn}${b}`;
      this.state = {
        showTable: true,
        history: [],
        solved: {}
      };
    }
    setRandomAB(update) {
      const { a, b } = randAB();
      update.a = a;
      update.b = b;
      update.answer = "";
    }
    toggle() {
      const update = {
        showTable: !this.state.showTable,
      }; 
      if (!update.showTable) {
        this.setRandomAB(update);
      }
      this.setState(update);
    }
    appendSolution(value) {
      const answer = this.state.answer;
      if (answer === "0") {
        this.setState({ answer: "" + value });
      } else if (answer.length < 2) {
        this.setState({ answer: answer + value });
      }
    }
    backspace() {
      const answer = this.state.answer;
      this.setState({ answer: answer.slice(0, answer.length - 1) });
    }
    submitAnswer() {
      const { a, b } = this.state;
      const answer = parseInt(this.state.answer);
      const history = this.state.history.map(h => Object.assign({}, h));
      history.push({a, b, answer, isCorrect: answer === this.func(a,b)});
      const solved = Object.assign({}, this.state.solved);
      solved[this.buildCoord(a,b)] = answer;
      const update = { history, solved };
      if (!update.showTable) {
        this.setRandomAB(update);
      }
      this.setState(update);
    }
    render() {
      return (<div className="d-flex flex-column justify-content-center">
        <div className="text-center"><button className="btn btn-primary" onClick={() => this.toggle()}><h2>Switch To {this.state.showTable?"Flash Cards":"Table"}</h2></button></div>
        {this.state.showTable?<div className="d-flex flex-column">
          <table className="table text-light">
            <tbody>
              <tr>
                <th></th>
                {digits.map(b => <th className="text-center">{b}</th>)}
              </tr>
              {digits.map(a => <tr>
                <th className="text-center">{a}</th>
                {digits.map(b => {
                  const solution = this.func(a,b);
                  const solved = this.state.solved[this.buildCoord(a,b)];
                  const isSolved = !isNaN(solved);
                  const isCorrect = (solution === solved);
                  const bg = (isSolved?(isCorrect?"bg-success":"bg-danger"):"bg-dark");
                  return <td className={`text-center ${bg}`}>{solution}</td>
                })}
              </tr>)}
            </tbody>
          </table>
          {this.state.history.length > 0 && <>
            <hr/>
            <h3>History</h3>
            <table className="table text-light">
              <tbody>
                <tr>
                  <th>a</th>
                  <th>b</th>
                  <th>{this.fn}</th>
                  <th>Answered</th>
                  <th>Is Correct?</th>
                </tr>
                {this.state.history.map(({ a, b, answer, isCorrect }) => {
                  const bg = isCorrect?"bg-success":"bg-danger"
                  return <tr className={`${bg}`}>
                    <td>{a}</td>
                    <td>{b}</td>
                    <td>{this.func(a,b)}</td>
                    <td>{answer}</td>
                    <td>{isCorrect.toString()}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </>}
        </div>:<div className="d-flex flex-column">
          { this.state.history.length > 0 && (() => {
            const history = this.state.history;
            const { a, b, answer, isCorrect } = history[history.length - 1];
            if (isCorrect) {
              return (<h3 className="bg-success text-center w-100">CORRECT!</h3>);
            } else {
              return (<div className="w-100 bg-danger d-flex justify-content-center">
                <div><h4 className="m-2">{a}</h4></div>
                <div><h4 className="m-2">{this.fn}</h4></div>
                <div><h4 className="m-2">{b}</h4></div>
                <div><h4 className="m-2">=</h4></div>
                <div><h4 className="m-2">{this.func(a,b)}</h4></div>
                <div><h4 className="m-2">not</h4></div>
                <div><h4 className="m-2">{answer || ""}</h4></div>
              </div>);
            }
          })()}
          <div className="d-flex justify-content-around">
            <div><h3>{this.state.a}</h3></div>
            <div><h3>{this.fn}</h3></div>
            <div><h3>{this.state.b}</h3></div>
            <div><button className="btn btn-success" onClick={() => this.submitAnswer()}><h3>=</h3></button></div>
            <div><h3>{this.state.answer || ""}</h3></div>
          </div>
          <table>
            <tbody>
              <tr>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(1)}><h3>1</h3></button></td>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(2)}><h3>2</h3></button></td>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(3)}><h3>3</h3></button></td>
              </tr>
              <tr>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(4)}><h3>4</h3></button></td>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(5)}><h3>5</h3></button></td>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(6)}><h3>6</h3></button></td>
              </tr>
              <tr>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(7)}><h3>7</h3></button></td>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(8)}><h3>8</h3></button></td>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(9)}><h3>9</h3></button></td>
              </tr>
              <tr>
                <td><button className="btn btn-primary w-100 pt-3 pb-3" onClick={() => this.appendSolution(0)}><h3>0</h3></button></td>
                <td colSpan="2"><button className="btn btn-danger w-100 pt-3 pb-3" onClick={() => this.backspace()}><h3>&lt;=</h3></button></td>
              </tr>
            </tbody>
          </table>
        </div>}
      </div>);
    }
  }
});