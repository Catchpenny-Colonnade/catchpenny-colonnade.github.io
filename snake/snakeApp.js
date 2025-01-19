namespace("snake.SnakeApp",{},() => {
  const config = {
    cellSize: 20,
    head:{
      points:[[10,0],[2,20],[10,15],[18,20]],
      matricies:{
        up:[[1,0,0],[0,1,0]],
        down:[[1,0,0],[0,-1,20]],
        right:[[0,1,0],[1,0,0]],
        left:[[0,-1,20],[1,0,0]],
      }
    },
    colors: {
      bg: "green",
      snake: "blue",
      apple: "red"
    }
  };
  const matrixMath = function(points,[[xx,yx,px],[xy,yy,py]]) {
    return points.map(([x,y]) => {
      return [((xx * x) + (yx * y) + px),((xy * x) + (yy * y) + py)];
    })
  }
  const directions = {
    right: [1, 0, "left"],
    left: [-1, 0, "right"],
    up: [0, -1, "down"],
    down: [0, 1, "up"],
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
    console.log({ directionKey });
    return matrixMath(config.head.points,config.head.matricies[directionKey]);
  }
  return function(appRoot) {
    const [ width, height, snakeLength, timeDelay] = [ 10, 10, 5, 1000 ];
    const coords = buildCoords(width, height)
    const { snake, direction } = buildSnake(width, height, coords, snakeLength);
    const apple = placeApple(coords, snake);
    console.log({ apple, snake, timeDelay });
    const state = {
      width,
      height,
      snakeLength,
      timeDelay,
      direction,
      snake,
      apple
    };
    document.addEventListener("keyhold",(({ detail }) => {
      console.log({detail});
      const direction = directionKeys[detail.code];
      if (direction) {
        if (state.timeout) {
          clearTimeout(state.timeout);
        }
        state.direction = direction;
        redraw();
      }
    }));
    const afterRedraw = function() {
      if (state.endGame) {
        alert("GAME OVER!")
      } else {
        state.timeout = setTimeout(() => {
          let { apple, timeDelay } = state;
          const { width, height, direction } = state 
          const snake = Array.from(state.snake);
          const [dx,dy] = directions[direction];
          const [x0,y0] = snake[0];
          const newHead = [x0+dx,y0+dy];
          let endGame = false;
          if (newHead[0] < 0 || newHead >= width || newHead[1] < 0 || newHead[1] >= height) {
            console.log({ newHead, snake, endGame: "walls" });
            endGame = true;
          } else if (snake.filter(([x1,y1]) => {
            return x1 === newHead[0] && y1 === newHead[1];
          }).length > 0) {
            console.log({ newHead, snake, endGame: "snake" });
            endGame = true;
          }
          if (endGame) {
            if (!state.endGame) {
              state.endGame = endGame;
              redraw();
            }
          } else { 
            snake.unshift(newHead);
            if (newHead[0] === apple[0] && newHead[1] === apple[1]) {
              timeDelay--;
              apple = placeApple(coords,snake);
            } else {
              snake.pop();
            }
            console.log({ apple, snake, timeDelay });
            Object.entries({ apple, timeDelay, snake }).forEach(([k,v]) => {
              state[k] = v;
            });
            redraw();
          }
        }, state.timeDelay);
      }
    }
    const redraw = function() {
      const halfCell = config.cellSize / 2;
      const { width, height } = state;
      const [fullWidth, fullHeight] = [width, height].map(n => n * config.cellSize)
      const [hx,hy] = state.snake[0];
      appRoot.innerHTML = `<div class="d-flex flex-column justify-content-center">
        <h1 class="text-center">Snake</h1>
        <div class="d-flex justify-content-center">
          <div class=""></div>
          <svg width="60%" height="60%" viewBox="0 0 ${fullWidth} ${fullHeight}"}>
            <rect width="${fullWidth}" height="${fullHeight}" fill="${config.colors.bg}" stroke="none"/>
            <polyline points="${state.snake.map(([x,y]) => coordKey(x * config.cellSize + halfCell, y * config.cellSize + halfCell )).join(" ")}" stroke="${config.colors.snake}" stroke-width="${halfCell}" stroke-linecap="round" fill="none"/>
            <circle cx="${state.apple[0] * config.cellSize + halfCell}" cy="${state.apple[1] * config.cellSize + halfCell}" r="${halfCell}" fill="${config.colors.apple}" stroke="none"/>
            <polygon points="${getSnakeHead(state.direction).map(([x,y]) => coordKey(hx * config.cellSize + x, hy * config.cellSize + y )).join(" ")}" fill="${config.colors.snake}" stroke="none"/>
          </svg>
        </div>
      </div>`;
      afterRedraw();
    }
    this.init = function() {
      redraw();
    }
  }
});