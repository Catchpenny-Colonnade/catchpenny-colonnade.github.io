namespace("infinitic.Infinitic",{},() => {
  let lastOpacity = 0.5;
  let colors = {
    dark: "#212529",
    red: "#F23",
    blue: "#28f",
    green: "#2f3",
    white: "#dde"
  };
  let winners = {
    "012":{ x1: 2, y1: 10, x2: 62, y2: 10},
    "345":{ x1: 2, y1: 32, x2: 62, y2: 32},
    "678":{ x1: 2, y1: 54, x2: 62, y2: 54},
    "036":{ x1:10, y1:2, x2:10, y2:62},
    "147":{ x1:32, y1:2, x2:32, y2:62},
    "258":{ x1:54, y1:2, x2:54, y2:62},
    "246":{ x1:2, y1:62, x2:62, y2:2},
    "048":{ x1:2, y1:2, x2:62, y2:62 }
  };
  let initState = {
    turn: true,
    spaces: [],
    winner: undefined
  }
  let getWinner = function(spaces) {
    let places = spaces.filter((_,i) => i % 2 === 0);
    if (places.length < 3) {
      return ;
    }
    places.sort();
    let possibles = [];
    if (places.length === 3) {
      possibles.push(places.join(""));
    } else {
      possibles = places.map(p => places.join("").replaceAll(p.toString(), ""));
    }
    let wins = possibles.map(p => winners[p]).filter(w => w);
    if (wins.length > 0) {
      return wins[0];
    }
  }
  let getIcon = function(space, state) {
    let { spaces, turn } = state;
    let index = spaces.indexOf(space);
    return (index < 0)?"":(((index % 2 === 0)!=turn)?"X":"O");
  }
  return class extends React.Component {
    constructor(props){
      super(props);
      this.state = initState;
    }
    isLast(space) {
      return this.state.spaces.indexOf(space) === 5;
    }
    clickCell(space) {
      let icon = getIcon(space, this.state);
      if (icon === "") {
        let spaces = Array.from(this.state.spaces);
        spaces.unshift(space);
        let line = getWinner(spaces);
        if (spaces.length > 6 && !line) {
          spaces.pop();
        }
        let update = { spaces, turn: !this.state.turn };
        if (line) {
          update.winner = { line, icon: getIcon(space, update) };
        }
        console.log({ update, space });
        this.setState(update);
      }
    }
    render() {
      let winner = this.state.winner;
      return (<div className="d-flex justify-content-center align-items-center w-100 h-100">
        <svg width="100%" height="100%" viewBox="0 0 64 64">
          { [0,1,2].map(row => {
            return [0,1,2].map(column => {
              let space = row * 3 + column;
              let icon = getIcon(space, this.state);
              let isLast = this.isLast(space);
              let offsetX = 22 * column;
              let offsetY = 22 * row;
              return <a key={`space${space}`} href="#" onClick={(e) => {
                e.preventDefault();
                this.clickCell(space);
              }}>
                <rect x={ offsetX } y={ offsetY } width="20" height="20" fill={ colors.dark }/>
                { icon==="O" && <circle cx={ offsetX + 10 } cy={ offsetY + 10 } r="7.5" strokeWidth="2.83" stroke={ colors.blue } fill="none" opacity={ (isLast && !winner)?lastOpacity:1 }/> }
                { icon==="X" && <g transform={`translate(${offsetX}, ${offsetY})`}>
                  <polygon points="3,1 10,8 17,1 19,3 12,10 19,17 17,19 10,12 3,19 1,17 8,10 1,3" fill={ colors.red } opacity={ (isLast && !winner)?lastOpacity:1 }/>
                </g> }
              </a>;
            });
          }) }
          <g>
            <rect x="0" y="20" width="64" height="2" fill={ colors.white }/>
            <rect x="0" y="42" width="64" height="2" fill={ colors.white }/>
            <rect x="20" y="0" width="2" height="64" fill={ colors.white }/>
            <rect x="42" y="0" width="2" height="64" fill={ colors.white }/>
          </g>
          { winner && <>
            <line 
              x1={ winner.line.x1 }
              y1={ winner.line.y1 }
              x2={ winner.line.x2 }
              y2={ winner.line.y2 }
              stroke={ colors.green }
              strokeWidth="2"
              />
            <a href="#" onClick={(e) => {
              e.preventDefault();
              confirm(`${ winner.icon } is the winner! Play again?`);
              this.setState(initState);
            }}>
              <rect width="64" height="64" fill={ colors.dark } opacity="0.1"/>
            </a>
          </>}
        </svg>
      </div>);
    }
  }
});