namespace("jeopardized.Jeopardized", {
  "jeopardized.JeopardyBoard": "JeopardyBoard",
  "jeopardized.JeopardyData": "JeopardyData",
  "jeopardized.JeopardyDisplay": "JeopardyDisplay",
  "jeopardized.DisplayWindow": "DisplayWindow",
}, ({ JeopardyBoard, JeopardyData, JeopardyDisplay, DisplayWindow }) => {
  const buildBoardDisplay = function(state) {
    console.log({ state });
    const categories = Object.keys(state.board);
    const prices = state.prices.map(price => categories.map(category => {
      return state.board[category][price]?price.toString():"";
    }));
    console.log({ categories, prices });
    return { categories, prices };
  }
  const deepCopyObject = function(obj) {
    if ((typeof obj) != obj) {
      return obj;
    } else {
      return Object.entries(obj).reduce((acc,[k,v]) => {
        acc[k] = deepCopyObject(v);
        return acc;
      }, {});
    }
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    startGame() {
      JeopardyData.applyBoard("level-one", (initState) => {
        initState.display =  new DisplayWindow("playerView", "./playerview.html", JeopardyDisplay, {});
        initState.display.open(buildBoardDisplay(initState));
        this.setState(initState);
      });
    }
    selectAnswer(category, price) {
      var { board, prices } = this.state;
      board = deepCopyObject(board);
      prices = Array.from(prices);
      const { question, answer } = board[category][price];
      this.state.display.update({ displayQuestion: { question, category, price } });
      alert(`category:\n\t${category}\n\nprice:\n\t${price}\n\nquestion:\n\t${question}\n\nanswer:\n\t${answer}`);
      delete board[category][price];
      const displayUpdate = buildBoardDisplay({ board, prices });
      displayUpdate.displayQuestion = undefined;
      this.state.display.update(displayUpdate);
      this.setState({ board, prices });
    }
    render() {
      if(this.state.board) {
        const boardDisplay = buildBoardDisplay(this.state)
        return <JeopardyBoard 
          categories={boardDisplay.categories} 
          prices={boardDisplay.prices}
          onClick={ (catIndex, priceIndex) => this.selectAnswer(catIndex, priceIndex) }>
        </JeopardyBoard>;
      } else {
        return <button className="btn btn-primary" onClick={() => this.startGame()}>Start Game</button>
      }
    }
  }
});