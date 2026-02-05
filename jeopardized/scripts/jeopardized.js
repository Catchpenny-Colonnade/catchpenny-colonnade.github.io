namespace("jeopardized.Jeopardized", {
  "jeopardized.JeopardyBoard": "JeopardyBoard",
  "jeopardized.JeopardyData": "JeopardyData",
  "jeopardized.JeopardyDisplay": "JeopardyDisplay",
  "jeopardized.DisplayWindow": "DisplayWindow",
  "jeopardized.QuestionModal": "QuestionModal",
  "gizmo-atheneum.namespaces.react.Dialog":"Dialog"
}, ({ JeopardyBoard, JeopardyData, JeopardyDisplay, DisplayWindow, QuestionModal, Dialog }) => {
  const questionBgClass = 'gears-bg-primary text-light rounded w-75 p-3';
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
      this.modals = Dialog.factory({
        question:{
          templateClass: QuestionModal,
          attrs: { class: questionBgClass },
          onClose: ({ category, price }) => {
            var { board, prices } = this.state;
            board = deepCopyObject(board);
            prices = Array.from(prices);
            delete board[category][price];
            const displayUpdate = buildBoardDisplay({ board, prices });
            displayUpdate.displayQuestion = undefined;
            this.state.display.update(displayUpdate);
            this.setState({ board, prices });
          },
        }
      });
    }
    startGame(level) {
      JeopardyData.applyBoard(level, (initState) => {
        initState.display =  new DisplayWindow("playerView", "./playerview.html", JeopardyDisplay, { bgClass: questionBgClass });
        initState.display.open(buildBoardDisplay(initState));
        initState.loading = undefined;
        this.setState(initState);
      });
      this.setState({ loading: true });
    }
    selectAnswer(category, price) {
      const { board } = this.state;
      const { question, answer } = board[category][price];
      this.state.display.update({ displayQuestion: { question, category, price } });
      this.modals.question.open({ question, category, price, answer });
    }
    render() {
      if (this.state.loading) {
        return <div className="d-flex justify-content-center">
          <div className="d-flex flex-column justify-content-center h-75">
            <h1>Loading questions! ...</h1>
          </div>
        </div>
      } else if(this.state.board) {
        const boardDisplay = buildBoardDisplay(this.state)
        return <JeopardyBoard 
          categories={boardDisplay.categories} 
          prices={boardDisplay.prices}
          onClick={ (catIndex, priceIndex) => this.selectAnswer(catIndex, priceIndex) }>
        </JeopardyBoard>;
      } else {
        return <div className="d-flex justify-content-center h-100">
          <div className="d-flex flex-column justify-content-center h-100">
            <button className="btn btn-primary m-4 p-2" onClick={() => this.startGame("level-one")}>Level One</button>
            <button className="btn btn-primary m-4 p-2" onClick={() => this.startGame("level-two")}>Level Two</button>
            <button className="btn btn-primary m-4 p-2" onClick={() => this.startGame("level-three")}>Level Three</button>
            <button className="btn btn-primary m-4 p-2" onClick={() => this.startGame("level-four")}>Level Four</button>
          </div>
        </div>
      }
    }
  }
});