namespace('snake.Snake',{
  'minesweeper.DigitalDisplay':'DigitalDisplay'
},({ DigitalDisplay }) => {
  const config = {
    cellSize: 20,
    head:{
      points:[[10,0],[2,20],[10,15],[18,20]],
      matricies:{
        up:[[1,0,0],[0,1,0]],
        down:[[1,0,0],[0,-1,20]],
        left:[[0,1,0],[1,0,0]],
        right:[[0,-1,20],[1,0,0]],
      }
    },
    colors: {
      bg: "darkblue",
      snake: "lightgreen",
      apple: "red"
    }
  };
  const matrixMath = function(points,[[xx,yx,px],[xy,yy,py]]) {
    return points.map(([x,y]) => {
      return [((xx * x) + (yx * y) + px),((xy * x) + (yy * y) + py)];
    })
  }
  const directions = {
    none: [0,0,{
      up: true,
      down: true,
      left: true,
      right: true
    }],
    right: [1, 0, {
      up: true,
      down: true
    }],
    left: [-1, 0, {
      up: true,
      down: true
    }],
    up: [0, -1, {
      left: true,
      right: true
    }],
    down: [0, 1, {
      left: true,
      right: true
    }],
  }
  const directionKeys = {
    "ArrowUp":"up",
    "ArrowDown":"down",
    "ArrowLeft":"left",
    "ArrowRight":"right",
  }
  const coordKey = function(x,y) {
    return [x,y].join(",");
  }
  const buildCoords = function(width, height) {
    const coords = {};
    for(let x = 0; x < width; x++) {
      for(let y = 0; y < height; y++) {
        coords[coordKey(x,y)] = [x,y];
      }
    }
    return coords;
  }
  const placeApple = function(coords, snake) {
    const snakeCoords = snake.map(([x,y]) => coordKey(x,y));
    const openCoords = Object.keys(coords).filter((k) => snakeCoords.indexOf(k) === -1);
    return coords[openCoords[Math.floor(Math.random() * openCoords.length)]];
  }
  const buildSnake = function(width, height, coords, snakeLength) {
    const head = placeApple(coords,[]);
    const dirDists = {
      up:head[1],
      left:head[0],
      down:(height - head[1]),
      right:(width - head[0])
    }
    const [tailDirection, startingDirection] = Object.entries(dirDists).reduce((out,[dir,dist]) => {
      if (dist > snakeLength) {
        out.push(dir);
      }
      return out;
    }, []);
    const snake = [head];
    const [tx,ty] = directions[tailDirection];
    while(snake.length < snakeLength) {
      let [x,y] = snake[snake.length - 1];
      snake.push([ x + tx, y + ty ])
    }
    return { snake, direction: startingDirection }
  }
  const getSnakeHead = function(directionKey) {
    if (directionKey === "none") {
      directionKey = "down";
    }
    const matrix = config.head.matricies[directionKey];
    console.log({ directionKey, matrix });
    return matrixMath(config.head.points, matrix);
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      const [ width, height, snakeLength, timeDelay] = [ 20, 12, 5, 500 ];
      this.coords = buildCoords(width, height)
      const { snake, direction } = buildSnake(width, height, this.coords, snakeLength);
      const apple = placeApple(this.coords, snake);
      console.log({ apple, snake, timeDelay });
      this.state = {
        width,
        height,
        snakeLength,
        timeDelay,
        direction,
        snake,
        apple,
        appleCount: 0
      };
      document.addEventListener("keyhold",(({ detail }) => {
        this.changeDirection(directionKeys[detail.code]);
      }));
    }
    changeDirection(direction) {
      if (!this.state.endGame) {
        if (direction && directions[this.state.direction][2][direction]) {
          if (this.timeout) {
            clearTimeout(this.timeout);
          }
          this.step(direction);
        }
      }
    }
    componentDidUpdate() {
      this.afterRender();
    }
    componentDidMount(){
      this.afterRender();
    }
    step(direction) {
      let { appleCount, apple, timeDelay } = this.state;
      const { width, height } = this.state 
      const snake = Array.from(this.state.snake);
      const [dx,dy] = directions[direction];
      const [x0,y0] = snake[0];
      const newHead = [x0+dx,y0+dy];
      snake.unshift(newHead);
      let endGame = false;
      if (newHead[0] < 0 || newHead[0] >= width || newHead[1] < 0 || newHead[1] >= height) {
        endGame = true;
      } else if (snake.slice(1).filter(([x1,y1]) => {
        return x1 === newHead[0] && y1 === newHead[1];
      }).length > 0) {
        endGame = true;
      }
      if (endGame) {
        if (!this.state.endGame) {
          this.setState({ endGame });
        }
      } else { 
        if (newHead[0] === apple[0] && newHead[1] === apple[1]) {
          timeDelay-=10;
          apple = placeApple(this.coords,snake);
          appleCount++;
        } else {
          snake.pop();
        }
        this.setState({ apple, appleCount, timeDelay, snake, direction });
      }
    }
    afterRender() {
      if (this.state.endGame) {
        alert("GAME OVER!")
      } else {
        this.timeout = setTimeout(() => {
          this.step(this.state.direction);
        }, this.state.timeDelay);
      }
    }
    render() {
      const halfCell = config.cellSize / 2;
      const { width, height } = this.state;
      const [fullWidth, fullHeight] = [width, height].map(n => n * config.cellSize)
      const [hx,hy] = this.state.snake[0];
      return <div className="d-flex flex-column justify-content-center">
        <h1 className="text-center">Snake</h1>
        <div className="d-flex justify-content-between">
          <DigitalDisplay digitCount={3} value={this.state.appleCount}/>
          <DigitalDisplay digitCount={3} value={this.state.timeDelay}/>
        </div>
        <div className="d-flex justify-content-center">
          <div className="d-flex flex-column">
            <button className="btn btn-primary h-50" style={{ width: "10em"}} onClick={() => this.changeDirection("up")}>
              <i className="fas fa-arrow-up fa-2x"></i>
            </button>
            <button className="btn btn-primary h-50" style={{ width: "10em"}} onClick={() => this.changeDirection("down")}>
              <i className="fas fa-arrow-down fa-2x"></i>
            </button>
          </div>
          <div className="d-flex justify-content-center" style={{ height: innerHeight * 0.75}}>
            <svg width="100%" height="100%" viewBox={`0 0 ${fullWidth} ${fullHeight}`}>
              <rect width={fullWidth} height={fullHeight} fill={config.colors.bg} stroke="none"/>
              <polyline points={this.state.snake.map(([x,y]) => coordKey(x * config.cellSize + halfCell, y * config.cellSize + halfCell )).join(" ")} stroke={config.colors.snake} strokeWidth={halfCell} strokeLinecap="round" fill="none"/>
              <circle cx={this.state.apple[0] * config.cellSize + halfCell} cy={this.state.apple[1] * config.cellSize + halfCell} r={halfCell} fill={config.colors.apple} stroke="none"/>
              <polygon points={getSnakeHead(this.state.direction).map(([x,y]) => coordKey(hx * config.cellSize + x, hy * config.cellSize + y )).join(" ")} fill={config.colors.snake} stroke="none"/>
            </svg>
          </div>
          <div className="d-flex flex-column">
            <button className="btn btn-primary h-50" style={{ width: "10em"}} onClick={() => this.changeDirection("left")}>
              <i className="fas fa-arrow-left fa-2x"></i>
            </button>
            <button className="btn btn-primary h-50" style={{ width: "10em"}} onClick={() => this.changeDirection("right")}>
              <i className="fas fa-arrow-right fa-2x"></i>
            </button>
          </div>
     </div>
      </div>;
    }
  };
});