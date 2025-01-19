namespace("face-swap.FaceSwap", {
  "common.Icons": "icons"
}, ({ icons }) => {
  const frameId = "animation-frame-id-"+(new Date()).getTime();
  const delay = 350;
  const iconSize = 512;
  const cellSize = 600;
  const rows = 8;
  const columns = 8;
  const iconPadding = (cellSize - iconSize) / 2;
  const clearIcon = "atom";
  const colors = {
    "yellow": "happy",
    "red": "angry",
    "orange": "wacky",
    "blue": "sad",
    "pink": "lovey",
    "green": "sick",
    "grey": "tense"
  }
  const faces = {
    "happy": "yellow", 
    "angry": "red",
    "wacky": "orange",
    "sad": "blue",
    "lovey": "pink",
    "sick": "green",
    "tense": "grey",
  };
  const specificColors = {
    "red": "#F03",
    "orange": "#F63",
    "yellow": "#FF6",
    "green": "#0F9",
    "blue": "#39F",
    "pink": "#F0F",
    "grey": "#CCC",
    "white": "#FFF",
  }
  const faceIcons = {
    "happy":{ iconType: "solid", icon: "face-grin", color: "yellow" },
    "angry":{ iconType: "solid", icon: "face-angry", color: "red" },
    "wacky":{ iconType: "solid", icon: "face-grin-tongue-wink", color: "orange" },
    "sad":{ iconType: "solid", icon: "face-sad-tear", color: "blue" },
    "lovey":{ iconType: "solid", icon: "face-grin-hearts", color: "pink" },
    "sick":{ iconType: "solid", icon: "face-dizzy", color: "green" },
    "tense":{ iconType: "solid", icon: "face-grimace", color: "grey" },
    "atom":{ iconType: "solid", icon: "atom", color: "white" },
    "lightbulb":{ iconType: "solid", icon: "lightbulb" },
    "sun":{ iconType: "solid", icon: "sun" },
    "bolt":{ iconType: "solid", icon: "bolt" },
    "bomb":{ iconType: "solid", icon: "bomb" }
  }
  const buildIconDefs = function(){
    return Object.entries(faceIcons).map(([faceName, { iconType, icon, color }]) => {
      const { width, height, path } = icons[`${iconType}.${icon}`];
      const x = iconPadding + ((iconSize - width) / 2);
      const y = iconPadding + ((iconSize - height) / 2);
      const fillAttr = color?` fill="${specificColors[color]}"`:"";
      return `<g id="${faceName}">
        <path d="${path}" stroke="none" ${fillAttr}/>
      </g>`;
    }).join("\n");
  };
  const selectedFrame = `<g id="selected"><rect x="22" y="22" rx="88" ry="88" width="566" height="566" fill="none" stroke="white" stroke-width="20"/></g>`;
  const drawIconSVG = function(faceName,[r,c],selected) {
    return `<g>
      <rect x="${c*cellSize}" y="${r*cellSize}" width="${cellSize}" height="${cellSize}" fill="#212529"/>
      ${ faceName ? `<use href="#${faceName}" x="${c*cellSize + 44}" y="${r*cellSize + 44}"/>` : "" }
      ${ selected ? `<use href="#selected" x="${c*cellSize}" y="${r*cellSize}"/>` : "" }
    </g>`;
  }
  const drawGridSVG = function(grid) {
    return `<svg width="100%" height="100%" viewBox="0 0 ${columns * cellSize} ${rows * cellSize}">
      <defs>${buildIconDefs()}</defs>
      ${ grid.map((row, r) => {
        return row.map(($, c) => {
          return drawIconSVG($.face, [r,c]);
        }).join("");
      }).join("") }
    </svg>`;
    return ;
  }
  const copyGrid = function(grid) {
    return grid.map(row => row.map(({ face }) => {
      var cell = {};
      if (face) {
        cell.face = face;
      }
      return cell;
    }));
  }
  const getNewFace = function() {
    const keys = Object.keys(faces);
    return keys[Math.floor(Math.random() * keys.length)];
  }
  const getAllMatches = function(grid) {
    const rowsMatches = grid.reduce((acc, row, r) => {
      return acc.concat(row.reduce((rowMatches, { face }, c) => {
        if (rowMatches.length === 0 || face !== rowMatches[0].face) {
          rowMatches.unshift({ face, row: r, firstColumn: c, count: 1 });
        } else {
          rowMatches[0].count++;
        }
        return rowMatches;
      }, []).filter(({ count }) => count >= 3));
    }, []).map(({ face, row, firstColumn, count }) => {
      return {
        face,
        coords: Array(count).fill("").map((_,i) => [ row, firstColumn + i ])
      };
    });
    const columnsMatches = Array(columns).fill("").reduce((acc, _, c) => {
      return acc.concat(grid.reduce((columnMatches, row, r) => {
        let { face } = row[c];
        if (columnMatches.length === 0 || face !== columnMatches[0].face) {
          columnMatches.unshift({ face, firstRow: r, column: c, count: 1 });
        } else {
          columnMatches[0].count++;
        }
        return columnMatches;
      }, []).filter(({ count }) => count >= 3));
    }, []).map(({ face, firstRow, column, count }) => {
      return {
        face,
        coords: Array(count).fill("").map((_,i) => [ firstRow + i, column ])
      };
    });
    if (rowsMatches.length > 0 && columnsMatches.length === 0) {
      return rowsMatches;
    }
    if (rowsMatches.length === 0 && columnsMatches.length > 0) {
      return columnsMatches;
    }
    const rowsMap = rowsMatches.reduce((acc, { coords }, i) => coords.reduce((outVal, [ r, c ]) => {
      outVal[`${r}x${c}`] = i;
      return outVal;
    }, acc), {});
    const rowsMapKeys = Object.keys(rowsMap);
    const columnsMap = columnsMatches.reduce((acc, { coords }, i) => coords.reduce((outVal, [ r, c ]) => {
      outVal[`${r}x${c}`] = i;
      return outVal;
    }, acc), {});
    const columnsMapKeys = Object.keys(columnsMap);
    const exclusiveRowMatches = rowsMapKeys.filter((key) => columnsMapKeys.indexOf(key) < 0).map((key) => rowsMap[key]).filter((r,i,indicies) => indicies.indexOf(r) === i).map(r => rowsMatches[r]);
    const exclusiveColumnMatches = columnsMapKeys.filter((key) => rowsMapKeys.indexOf(key) < 0).map((key) => columnsMap[key]).filter((c,i) => exclusiveColumnIndicies.indexOf(c) === i).map(c => columnsMatches[r]);
    const intersections = rowsMapKeys.filter((key) => columnsMapKeys.indexOf(key) >= 0).map((key) => {
      return {
        key,
        columnMatch: columnsMap[key],
        rowMatch: rowsMap[key]
      };
    });
    const columnDoubleMatches = intersections.map(i => i.columnMatch).filter((k,i,myArray) => myArray.indexOf(k) != i);
    const rowDoubleMatches = intersections.map(i => i.rowMatch).filter((k,i,myArray) => myArray.indexOf(k) != i);
  }
  const getMatches = function(grid, face, r, c) {
    const vertical = [[r,c]];
    for (let row = r - 1; row >= 0; row--) {
      if (grid[row][c].face != face) break;
      vertical.push([row,c]);
    }
    for (let row = r + 1; row < rows; row++) {
      if (grid[row][c].face != face) break;
      vertical.push([row,c]);
    }
    const horizontal = [[r,c]];
    for (let column = c - 1; column >= 0; column--) {
      if (grid[r][column].face != face) break;
      horizontal.push([r, column]);
    }
    for (let column = c + 1; column < columns; column++) {
      if (grid[r][column].face != face) break;
      horizontal.push([r, column]);
    }
    let results = [];
    if (horizontal.length >= 3) {
      results = results.concat(horizontal);
    }
    if (vertical.length >= 3) {
      results = results.concat(vertical);
    }
    if (results.length > 0) {
      console.log({ horizontal, vertical, results });
    }
    return results;
  }
  const getFirstMatches = function(grid) {
    for (let r = rows-1; r >= 0; r--) {
      for (let c = 0; c < columns; c++) {
        const face = grid[r][c].face;
        if (faces[face]) {
          const matches = getMatches(grid, face, r, c);
          if(matches.length > 0) return { face, matches };
        }
      }
    }
  }
  const clearFaces = function(grid, matchMap) {
    return grid.map((row,r) => {
      return row.map(($, c) => {
        return {
          face: matchMap[[r,c].join("x")]?clearIcon:$.face
        }
      });
    });
  }
  const readyEmpties = function(grid,clearings) {
    clearings.forEach(([r,c]) => {
      delete grid[r][c].face;
    });
    return grid;
  }
  const getOpenSpots = function(grid) {
    const open = Array.from(grid).reduce((acc, row, r) => {
      return acc.concat(row.map((_, c) => {
        return { r, c };
      }));
    },[]).filter(({ r, c }) => !grid[r][c].face);
    const zeros = open.filter(({r}) => r === 0);
    const shifters = open.filter(({ r, c }) => r > 0 && grid[r-1][c].face);
    if (zeros.length > 0 || shifters.length > 0) {
      return { zeros, shifters };
    }
  };
  const shiftDown = function(grid, { shifters, zeros } ) {
    shifters.forEach(({ r, c }) => {
      grid[r][c].face = grid[r - 1][c].face;
      delete grid[r - 1][c].face;
    });
    zeros.forEach(({ r, c }) => {
      grid[r][c].face = getNewFace();
    });
    return grid;
  }
  const areAdjacent = function([r1,c1],[r2,c2]) {
    const rDiff = Math.abs(r1 - r2);
    if(rDiff > 1) return false;
    const cDiff = Math.abs(c1 - c2);
    if(cDiff > 1) return false;
    if(rDiff == cDiff) return false;
    return true;
  }
  const swapAndResolve = function(grid, [r1,c1], [r2,c2]) {
    const face1 = grid[r1][c1].face;
    const face2 = grid[r2][c2].face;
    const matches1 = getMatches(grid, face1, r2, c2);
    const matches2 = getMatches(grid, face2, r1, c1);
    if (matches1.concat(matches2).length > 0) {
      const temp = grid[r1][c1];
      grid[r1][c1] = grid[r2][c2];
      grid[r2][c2] = temp;
      return { grid, selected: undefined, hold: true };
    }
  };
  const buildInitState = function() {
    const grid = Array(rows).fill(Array(columns).fill({})).map((row) => {
      return row.map(($) => {
        return { face: getNewFace() };
      });
    });
    return { grid, selected: undefined, hold: true };
  };
  const isSelected = function(selected, r, c) {
    if (Array.isArray(selected) && selected.length == 2) {
      const [ sr, sc ] = selected;
      return sr == r && sc == c;
    }
  }
  const animate = function(grid, callback) {
    const stepUpdate = function(message, obj) {
      return () => {
        document.getElementById(frameId).innerHTML = drawGridSVG(grid);
        animate(obj.grid, callback);
      }
    }
    const empties = getOpenSpots(grid);
    if (empties) {
      const wrapper = {};
      setTimeout(stepUpdate("empties", wrapper), delay);
      wrapper.grid = shiftDown(grid, empties);
    } else {
      const clearings = grid.reduce((acc, row, r) => {
        return acc.concat(row.map(({face},c) => [face,c]).filter(([face]) => face === clearIcon).map(([_,c]) => [r,c]));
      }, []);
      if (clearings.length > 0) {
        const wrapper = {};
        setTimeout(stepUpdate("ready empties", wrapper), delay);
        wrapper.grid = readyEmpties(grid,clearings);
        } else {
        let firstMatches = getFirstMatches(grid);
        if (firstMatches) {
          const wrapper = {};
          setTimeout(stepUpdate("first matches", wrapper), delay);
          do{
            let matchMap = firstMatches.matches.reduce((acc,rc) => {
              acc[rc.join("x")] = true;
              return acc;
            }, {});
            grid = clearFaces(grid, matchMap);
            firstMatches = getFirstMatches(grid);
          } while(firstMatches);
          wrapper.grid = grid;
        } else {
          callback(grid);
        }
      }
    }
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = buildInitState();
    }
    componentDidMount() {
      this.afterRender();
    }
    componentDidUpdate() {
      this.afterRender();
    }
    afterRender() {
      if (this.state.hold) {
        animate(copyGrid(this.state.grid), (grid) => {
          document.getElementById(frameId).innerHTML = "";
          this.setState({ grid, hold: undefined });
        });
      }
    }
    click(r, c) {
      if(!this.state.hold) {
        if((typeof this.state.selected) == "undefined") {
          this.setState({ selected: [r,c] });
        } else if (!areAdjacent(this.state.selected, [r,c])) {
          this.setState({ selected: undefined });
        } else {
          let newState = swapAndResolve(copyGrid(this.state.grid), this.state.selected, [r,c]);
          if (newState) this.setState(newState);
        }
      }
    }
    render() {
      if (this.state.grid) {
        if (this.state.hold) {
          return (<div className="d-flex flex-column justify-content-center w-100 h-100">
            <div className="d-flex justify-content-center align-items-center w-100 h-100" id={frameId} dangerouslySetInnerHTML={{ __html: drawGridSVG(this.state.grid)}}>
            </div>
          </div>);
        } else {
          return (<div className="d-flex flex-column justify-content-center w-100 h-100">
            <div className="d-flex justify-content-center align-items-center w-100 h-100">
              <svg width="100%" height="100%" viewBox={`0 0 ${columns * cellSize} ${rows * cellSize}`}>
                <defs dangerouslySetInnerHTML={{ __html: selectedFrame + buildIconDefs() }}></defs>
                { this.state.grid.map((row, r) => {
                  return row.map(($, c) => {
                    return <a key={`cell${r}x${c}`} href="#" onClick={(e) => {
                      e.preventDefault();
                      this.click(r,c);
                    }} dangerouslySetInnerHTML={{ __html: drawIconSVG($.face, [r,c], isSelected(this.state.selected, r, c)) }}></a>
                  });
                }) }
              </svg>
            </div>
          </div>);
        }
      } else {
        return <></>;
      }
    }
  }
});