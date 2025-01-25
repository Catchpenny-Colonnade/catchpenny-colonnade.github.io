namespace("sudoku.Sudoku", {
  "gizmo-atheneum.namespaces.Ajax":"Ajax"
}, ({ Ajax }) => {
  const getCoordKey = (r,c) => `${r}X${c}`;
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loc: {}
      };
    }
    afterRender() {
      if (!this.state.original) {
        let index = Math.floor(Math.random() * 1296);
        index = ((index<36)?"0":"") + index.toString(36);
        Ajax.get(`https://catchpenny-colonnade.github.io/sudoku/sudoku-clj/resources/puzzles/index${index}.json`,{
          success: (responseText) => {
            const puzzles = JSON.parse(responseText);
            const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
            const original = puzzle.split("").reduce((acc, char, i) => {
              const value = parseInt(char);
              if (value > 0) {
                const row = Math.floor(i / 9);
                const col = i % 9;
                acc[getCoordKey(row, col)] = value;
              }
              return acc;
            }, {});
            this.setState({ original, history: [] });
          },
          failure: (error) => {
            throw error;
          },
        })
        // Ajax for random puzzle
        // convert to coord map, add history
      }
    }
    componentDidMount(){
      this.afterRender();
    }
    componentDidUpdate(){
      this.afterRender();
    }
    applyValue({row, col}, value) {
      const updates = { loc: { row, col }, value };
      if (row && col && value && this.state.history && this.state.original && !this.state.original[getCoordKey(row, col)] && this.state.history) {
        updates.history = this.state.history.concat([{ row, col, value }])
      }
      this.setState(updates);
    }
    selectLoc(row, col) {
      this.applyValue( { row, col }, this.state.value );
    }
    isSelectedLoc(row, col) {
      return row === this.state.loc?.row && col === this.state.loc?.col;
    }
    isOriginal(row, col) {
      return this.state.original && this.state.original[getCoordKey(row,col)];
    }
    getValue(r, c) {
      return (this.state.original && this.state.original[getCoordKey(row,col)]) || (this.state.history && this.state.history.filter(({row,col}) => row === r && col === c).toReversed()[0]);
    }
    selectValue(value) {
      this.applyValue(this.state.loc, value);
    }
    isSelectedValue(value) {
      return value = this.state.value;
    }
    clearSelection() {
      this.setState({loc:{}, value:undefined})
    }
    render() {
      return (<div className="d-flex flex-column">
        <h2 className="text-center">Sudoku</h2>
        <div className="d-flex justify-content-center">
          <table>
            <tbody>
              <tr>
                <td>
                  <button className="btn btn-light" onClick={() => this.selectValue(1)}>1</button>
                </td>
                <td>
                  <button className="btn btn-light" onClick={() => this.selectValue(2)}>2</button>
                </td>
                <td>
                  <button className="btn btn-light" onClick={() => this.selectValue(3)}>3</button>
                </td>
                <td>
                  <button className="btn btn-light" onClick={() => this.selectValue(4)}>4</button>
                </td>
                <td>
                  <button className="btn btn-light" onClick={() => this.selectValue(5)}>5</button>
                </td>
                <td>
                  <button className="btn btn-light" onClick={() => this.selectValue(6)}>6</button>
                </td>
                <td>
                  <button className="btn btn-light" onClick={() => this.selectValue(7)}>7</button>
                </td>
                <td>
                  <button className="btn btn-light" onClick={() => this.selectValue(8)}>8</button>
                </td>
                <td>
                  <button className="btn btn-light" onClick={() => this.selectValue(9)}>9</button>
                </td>
                <td>
                  <button className="btn btn-danger" onClick={() => this.clearSelection()}>X</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-center">
          <table>
            <tbody>
              {Array(9).fill("").map((_, row) => (<tr>{
                Array(9).fill("").map((_, col) => {
                  let value = this.getValue(row, col);
                  return (<td>
                    <button className="btn btn-light" disabled={this.isOriginal(row, col)} onClick={() => this.selectLoc(row, col)}>
                      <span>
                        { value }
                      </span>
                    </button>
                  </td>);
                })
              }</tr>))}
            </tbody>
          </table>
        </div>
      </div>);
    }
  }
});