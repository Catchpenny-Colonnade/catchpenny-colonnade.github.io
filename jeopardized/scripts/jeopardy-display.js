namespace("jeopardized.JeopardyDisplay", {
  "jeopardized.JeopardyBoard": "JeopardyBoard"
}, ({ JeopardyBoard }) => {
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
        return <div className="d-flex justify-content-center">
          <div className="d-flex flex-column justify-content-center h-75">
            <h2 className="text-light">{category}</h2>
            <h3 className="text-light">{price}</h3>
            <h1 className="text-light">{question}</h1>
          </div>
        </div>;
      } else {
        return <JeopardyBoard 
          categories={this.state.categories} 
          prices={this.state.prices}
          onClick={ () => {} }>
        </JeopardyBoard>;
      }
    }
  };
});