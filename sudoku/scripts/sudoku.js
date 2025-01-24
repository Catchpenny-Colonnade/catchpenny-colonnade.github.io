namespace("sudoku.Sudoku", {}, ({ }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    selectLoc(row, col) {
    }
    isSelectedLoc(row, col) {
      
    }
    isOriginal(row, col) {
      return false;
    }
    getValue(row, col) {
      return "_"
    }
    selectValue(value) {

    }
    isSelectedValue(value) {

    }
    clearValue() {

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
                  <button className="btn btn-danger" onClick={() => this.clearValue()}>X</button>
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
                  return (<td>
                    <button className="btn btn-light" disabled={this.isOriginal(row, col)} onClick={() => this.selectLoc(row, col)}>
                      <span>
                        {this.getValue(row, col)}
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