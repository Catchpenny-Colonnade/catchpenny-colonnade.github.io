namespace("sudoku.Sudoku", {
  "gizmo-atheneum.namespaces.Ajax":"Ajax",
  "sudoku.NumberIcons": "NumberIcons"
}, ({ Ajax, NumberIcons }) => {
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
          hasValueToSet: (valueToSet?true:false),
          isNotLocked: (this.state.original[coordKey]?false:true)
        }
        if (Object.values(checks).reduce((a,b) => a && b, true)) {
          updates.history = this.state.history.concat([{ row, col, value: valueToSet }])
        }
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
      if (this.state.original) {
        const originalValue = this.state.original[getCoordKey(r,c)];
        if (originalValue) {
          return { value: originalValue, isOriginal: true };
        } else if(this.state.history){
          return this.state.history.filter(({row,col}) => row === r && col === c).toReversed()[0];
        }
      }
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
          const coordKey = getCoordKey(r,c);
          if (!this.state.original[coordKey]) {
            grid[row][col] = {
              value
            }
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
        const colValues = grid.map((acc, r) => {
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
        }, acc);
        [rowValues, colValues, blockValues].forEach(valuesMap => Object.values(valuesMap).filter(valuesList => valuesList.length > 1).forEach(valuesList => valuesList.forEach(value => {
          value.error = true;
        })));
      });
      const complete = grid.flat().filter(v => !v.value || v.error).length === 0;
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
                { Array(9).fill("").map((c,i) => {
                  const value = i + 1;
                  return <td key={`value${value}`}>
                    <button className="btn btn-light" onClick={() => this.selectValue(value)}>{value}</button>
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
              {Array(9).fill("").map((_, row) => (<>{
                  Array(9).fill("").map((_, col) => {
                    const lineWidth = 25;
                    const blockLineWidth = 50;
                    const $$ = this.getValue(row, col);
                    const blockRow = Math.floor(row/3);
                    const blockCol = Math.floor(col/3);
                    const x = 600 * col + blockCol * blockLineWidth;
                    const y = 600 * row + blockRow * blockLineWidth;
                    const letterColor = ($$ && $$.isOriginal?"lightgrey":"white");
                    const letterBold = ($$ && $$.isOriginal?"40":"0");
                    return <a href="#" key={getCoordKey(row,col)} onClick={(e) => {
                      e.preventDefault();
                      this.selectLoc(row,col);
                    }}>
                      <rect x={x} y={y} width="600" height="600" fill="black" stroke="white" strokeWidth={lineWidth}/>
                      { $$ && <use href={`#solid.${$$.value}`} x={x + 300} y={y + 300} fill={letterColor} stroke={letterColor} strokeWidth={letterBold}/> }
                    </a>;
                  })
                }</>))}
            </svg>
          </div>
        </>}
      </div>);
    }
  }
});