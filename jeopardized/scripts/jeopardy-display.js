namespace("jeopardized.JeopardyDisplay", {
  "jeopardized.JeopardyBoard": "JeopardyBoard",
  "jeopardized.QuestionFrame": "QuestionFrame"
}, ({ JeopardyBoard, QuestionFrame }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = props.initState;
      this.addlAttrs = props.addlAttrs;
      props.setOnUpdate((update, puppetWindow) => {
        console.log({ update });
        puppetWindow.console.log({ update });
        this.setState(update);
      });
    }
    render() {
      if (this.state.displayQuestion) {
        const { question, category, price } = this.state.displayQuestion;
        return <div className="d-flex flex-column justify-content-center h-100">
          <div className="d-flex justify-content-center">
            <div className={ this.addlAttrs.bgClass }>
              <QuestionFrame question={question} category={category} price={price}></QuestionFrame>
            </div>
          </div>
        </div>;
      } else {
        return <div className="d-flex flex-column justify-content-center h-100">
          <div className="d-flex justify-content-center">
            <JeopardyBoard 
              categories={this.state.categories} 
              prices={this.state.prices}
              onClick={ () => {} }>
            </JeopardyBoard>
          </div>
        </div>;
      }
    }
  };
});