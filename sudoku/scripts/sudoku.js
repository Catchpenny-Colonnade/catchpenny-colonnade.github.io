namespace("sudoku.Sudoku", {
  "gizmo-atheneum.namespaces.Ajax":"Ajax",
  "sudoku.NumberIcons": "NumberIcons"
}, ({ Ajax, NumberIcons }) => {
  const lineWidth = 25;
  const blockLineWidth = 50;
  const getCoordKey = (r,c) => {
    if (!isNaN(r) && !isNaN(c)) {
      return `${r}X${c}`;
    }
  };
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
          }
        })
      }
    }
    componentDidMount(){
      this.afterRender();
    }
    componentDidUpdate(){
      this.afterRender();
    }
    applyValue({row, col}, valueToSet) {
      const updates = { loc: { row, col }, value: valueToSet };
      if (this.state.original) {
        const coordKey = getCoordKey(row, col);
        const checks = {
          hasCoordKey: (coordKey?true:false),
          isNotLocked: (this.state.original[coordKey]?false:true)
        }
        if (Object.values(checks).reduce((a,b) => a && b, true)) {
          updates.history = this.state.history.concat([{ row, col, value: valueToSet }])
        }
      }
      this.setState(updates);
    }
    selectLoc(row, col, { value, isOriginal }, valueCompleted) {
      if (isOriginal || this.isSelectedLoc(row, col)) {
        this.applyValue( { }, value );
      } else if (valueCompleted) {
        this.applyValue( { row, col }, undefined );
      } else {
        this.applyValue( { row, col }, this.state.value );
      }
    }
    isSelectedLoc(row, col) {
      return row === this.state.loc?.row && col === this.state.loc?.col;
    }
    hasSelectedLoc() {
      return !isNaN(this.state.loc.row) && !isNaN(this.state.loc.col);
    }
    isOriginal(row, col) {
      return this.state.original && this.state.original[getCoordKey(row,col)];
    }
    getValue(r, c) {
      if (this.state.original) {
        const originalValue = this.state.original[getCoordKey(r,c)];
        if (originalValue) {
          return { value: originalValue, isOriginal: true };
        } else if(this.state.history){
          return this.state.history.filter(({row,col}) => row === r && col === c).toReversed()[0];
        }
      }
    }
    goBack() {
      if (Array.isArray(this.state.history) && this.state.history.length > 0) {
        const history = Array.from(this.state.history);
        history.pop();
        this.setState({ histor, loc: {}, value: undefined });
      }
    }
    selectValue(value, previousCompleted) {
      if (previousCompleted) {
        this.applyValue({}, value);
      } else if (this.state.value === value) {
        this.clearSelection();
      } else {
        this.applyValue(this.state.loc, value);
      }
    }
    isSelectedValue(value) {
      return value = this.state.value;
    }
    clearSelection() {
      this.setState({loc:{}, value:undefined})
    }
    getActiveFrame() {
      const { x, y } = this.getXY(this.state.loc.row, this.state.loc.col);
      return <rect x={x} y={y} width="600" height="600" fill="none" stroke="green" strokeWidth={lineWidth*3}/>
    }
    getXY(r,c) {
      const blockRow = Math.floor(r/3);
      const blockCol = Math.floor(c/3);
      const x = 600 * c + blockCol * blockLineWidth;
      const y = 600 * r + blockRow * blockLineWidth;
      return { x, y };
    }
    render() {
      const grid = Array(9).fill("").map((_,r) => {
        return Array(9).fill("").map((_,c) => {
          const coordKey = getCoordKey(r,c);
          if (this.state.original && this.state.original[coordKey]) {
            return { 
              value: this.state.original[coordKey],
              isOriginal: true
            };
          } else {
            return {};
          }
        });
      });
      if (this.state.history) {
        this.state.history.forEach(({ row, col, value }) => {
          const coordKey = getCoordKey(row, col);
          if (!this.state.original[coordKey]) {
            grid[row][col] = { value };
          }
        });
      }
      Array(9).fill("").forEach((_,i) => {
        const rowValues = grid[i].reduce((acc, value) => {
          const key = value.value?.toString()
          if (key) {
            if (acc[key]) {
              acc[key].push(value);
            } else {
              acc[key] = [value];
            }
          }
          return acc;
        }, {});
        const colValues = grid.reduce((acc, r) => {
          const value = r[i];
          const key = value.value?.toString()
          if (key) {
            if (acc[key]) {
              acc[key].push(value);
            } else {
              acc[key] = [value];
            }
          }
          return acc;
        }, {});
        const blockRow = Math.floor(i / 3);
        const blockCol = i % 3;
        const blockValues = Array(9).fill("").reduce((acc,_,j) => {
          const rowInBlock = Math.floor(j / 3);
          const colInBlock = j % 3;
          const value = grid[blockRow * 3 + rowInBlock][blockCol * 3 + colInBlock];
          const key = value.value?.toString()
          if (key) {
            if (acc[key]) {
              acc[key].push(value);
            } else {
              acc[key] = [value];
            }
          }
          return acc;
        }, {});
        [rowValues, colValues, blockValues].forEach(valuesMap => Object.values(valuesMap).filter(valuesList => valuesList.length > 1).forEach(valuesList => valuesList.forEach(value => {
          if (!value.isOriginal) {
            value.error = true;
          }
        })));
      });
      const completeByNumber = grid.flat().reduce((acc, { value, error }) => {
        if (value && !error) {
          acc[value] = (acc[value] || 0) + 1;
        }
        return acc;
      }, {});
      const complete = (() => {
        const counts = Object.values(completeByNumber);
        return counts.length === 9 && counts.reduce((acc, c) => acc && c === 9, true);
      })();
      return (<div className="d-flex flex-column">
        <h2 className="text-center mb-2">Sudoku</h2>
        { complete?<>
          <h2>Completed!</h2>
          <p>Refresh the page to play again.</p>
        </>:<>
          <div className="d-flex justify-content-center mb-2">
            <table>
              <tbody>
                <tr>
                  <td>
                    <button className="btn btn-warning" onClick={() => this.goBack()}>&lt;</button>
                  </td>
                { Array(9).fill("").map((c,i) => {
                  const value = i + 1;
                  const style = (this.state.value === value)?"btn-success":"btn-light";
                  return (completeByNumber[value] === 9)?<></>:<td key={`value${value}`}>
                    <button className={`btn ${style}`} onClick={() => this.selectValue(value, completeByNumber[this.state.value] === 9)}>{value}</button>
                  </td>;
                })}
                  <td>
                    <button className="btn btn-danger" onClick={() => this.clearSelection()}>X</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-center">
            <svg width="80%" height="80%" viewBox="0 0 5500 5500">
              <defs>
                { NumberIcons.getDefs() }
              </defs>
              <rect x="1800" y="0" width="50" height="5500" fill="white" stroke="none"/>
              <rect x="3650" y="0" width="50" height="5500" fill="white" stroke="none"/>
              <rect x="0" y="1800" width="5500" height="50" fill="white" stroke="none"/>
              <rect x="0" y="3650" width="5500" height="50" fill="white" stroke="none"/>
              { grid.map((row,r) => row.map(($$,c) => {
                const { x, y } = this.getXY(r,c);
                const letterColor = (($$.error?"red":($$.value === this.state.value)?"green":($$.isOriginal?"lightgrey":("white"))));
                const bgColor = ($$.isOriginal?"navy":"black")
                const letterBold = ($$.isOriginal?"40":"0");
                return <a href="#" key={getCoordKey(r,c)} onClick={(e) => {
                  e.preventDefault();
                  this.selectLoc(r,c,$$,completeByNumber[this.state.value] === 9);
                }}>
                  <rect x={x} y={y} width="600" height="600" fill={bgColor} stroke="white" strokeWidth={lineWidth}/>
                  { $$.value && <use href={`#solid.${$$.value}`} x={x + 300} y={y + 300} fill={letterColor} stroke={letterColor} strokeWidth={letterBold}/> }
                </a>;
              }))}
              { this.hasSelectedLoc() && this.getActiveFrame() }
            </svg>
          </div>
        </>}
      </div>);
    }
  }
});