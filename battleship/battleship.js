namespace("battleship.Battleship", () => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    render() {
      return (<div className="d-flex h-100 w-100 justify-content-center align-content-center">
        <div className="row h-100 w-100 align-items-center">
          <div className="col-md-6 board-cell">
            <svg width="100%" height="100%" viewBox="0 0 102 102">
              <defs>
              <g id="redPin">
                  <circle cx="5" cy="5" r="2.5" fill="red" stroke="black"/>
                </g>
                <g id="whitePin">
                  <circle cx="5" cy="5" r="2.5" fill="red" stroke="black"/>
                </g>
                <g id="carrier">
                  <rect x="0" y="0" width="50" height="10" fill="grey" stroke="black"/>
                  <circle cx="5" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="15" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="25" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="35" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="45" cy="5" r="1" fill="black" stroke="black"/>
                </g>
                <g id="battleship">
                  <rect x="0" y="0" rx="12" ry="5" width="40" height="10" fill="grey" stroke="black"/>
                  <circle cx="5" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="15" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="25" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="35" cy="5" r="1" fill="black" stroke="black"/>
                </g>
                <g id="destroyer">
                  <rect x="0" y="0" rx="7" ry="5" width="30" height="10" fill="grey" stroke="black"/>
                  <circle cx="5" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="15" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="25" cy="5" r="1" fill="black" stroke="black"/>
                </g>
                <g id="submarine">
                  <rect x="0" y="0" rx="12" ry="5" width="30" height="10" fill="grey" stroke="black"/>
                  <circle cx="5" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="15" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="25" cy="5" r="1" fill="black" stroke="black"/>
                </g>
                <g id="patrol">
                  <rect x="0" y="0" rx="15" ry="5" width="20" height="10" fill="grey" stroke="black"/>
                  <circle cx="5" cy="5" r="1" fill="black" stroke="black"/>
                  <circle cx="15" cy="5" r="1" fill="black" stroke="black"/>
                </g>
              </defs>
              { Array(10).fill("").map((_,y) => {
                return Array(10).fill("").map((_,x) => {
                  return <rect x={1+10*x} y={1+10*y} width="10" height="10" fill="blue" stroke="black"/>
                });
              }) };
              <use href="#carrier" transform="translate(61,11) rotate(90,5,5)"/>
              <use href="#battleship" transform="translate(41,11) rotate(90,5,5)"/>
              <use href="#destroyer" transform="translate(21,21) rotate(90,5,5)"/>
              <use href="#submarine" transform="translate(41,61) rotate(90,5,5)"/>
              <use href="#patrol" transform="translate(21,61) rotate(90,5,5)"/>
            </svg>
          </div>
          <div className="col-md-6 board-cell">
            <svg width="100%" height="100%" viewBox="0 0 102 102">
              <rect x="1" y="1" width="100" height="100" fill="blue"/>
              { Array(10).fill("").map((_,y) => {
                return Array(10).fill("").map((_,x) => {
                  return <rect x={1+10*x} y={1+10*y} width="10" height="10" fill="none" stroke="black"/>
                });
              }) };
            </svg>
          </div>
        </div>
      </div>);
    }
  };
});
