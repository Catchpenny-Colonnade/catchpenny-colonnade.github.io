namespace("liteBrite.LiteBrite",{},() => {
  let radius = 10;
  let margin = radius;
  let rowHeight = Math.sqrt(3) * radius;
  let columnWidth = radius * 2;
  let columns = 13;
  let rows = 11;
  let width = (columns + 1) * columnWidth;
  let canvasHeight = (rows + 1) * rowHeight;
  let paletteHeight = canvasHeight / 7;
  let colorWidth = width / 4;
  let height = canvasHeight + paletteHeight;
  let colors = {
    dark: "#212529",
    grey: "#333",
    blue: "#0BF",
    pink: "#F19",
    yellow: "#FF0",
    green: "#7F0"
  };
  let parseCoordinate = function(coord) {
    return coord.split("x").map(num => parseInt(num));
  }
  let buildCoordinate = function(x, y) {
    return `${x}x${y}`;
  }
  let establishInitialState = function() {
    let dots = {};
    Array(rows).fill("").forEach((_,row) => {
      let cols = columns - (row % 2);
      Array(cols).fill("").forEach((_,col) => {
        let coord = buildCoordinate(col,row);
        dots[coord] = "";
      });
    });
    return { dots };
  }
  let copyDots = function(state) {
    return Object.entries(state.dots).reduce((obj, [ k, v ]) => {
      obj[k] = v;
      return obj;
    }, {});
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = establishInitialState();
    }
    setSelectedColor(selectedColor) {
      this.setState({ selectedColor });
    }
    toggleColor(coord) {
      if (this.state.selectedColor) {
        let dots = copyDots(this.state);
        if(dots[coord] === "") {
          dots[coord] = colors[this.state.selectedColor];
        } else {
          dots[coord] = "";
        }
        this.setState({ dots })
      }
    }
    render() {
      return <div className="d-flex justify-content-center align-items-center w-100 h-100">
        <svg width="75%" height="75%" viewBox={`0 0 ${width} ${height}`}>
          { Object.entries(this.state.dots).map(([coord, color]) => {
            let [ col, row ] = parseCoordinate(coord);
            let cx = margin + radius + (radius * (row % 2)) + columnWidth * col;
            let cy = margin + radius + (row * rowHeight);
            let fill = (color.length > 0) ? color : colors.grey;
            let r = radius * (fill === color ? 1 : (2/3));
            return <a href="#" onClick={(e) => {
              e.preventDefault();
              this.toggleColor(coord);
            }}>
              <circle cx={cx} cy={cy} r={r} fill={fill}/>
            </a>;
          }) }
          { [ "pink", "green", "yellow", "blue" ].map((color, index) => {
            return <a href="#" onClick={(e) => {
              e.preventDefault();
              this.setSelectedColor(color);
            }}>
              <rect x={index * colorWidth} y={canvasHeight} width={colorWidth} height={paletteHeight} fill={colors[color]}/>
            </a>;
          }) }
        </svg>
      </div>
    }
  }
});
