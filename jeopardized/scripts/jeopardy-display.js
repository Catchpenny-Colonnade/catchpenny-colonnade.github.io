namespace("jeopardized.JeopardyDisplay", {
  "jeopardized.JeopardyBoard": "JeopardyBoard"
}, ({ JeopardyBoard }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = props.initState;
      this.addlAttrs = props.addlAttrs;
      props.setOnUpdate((update) => this.setState(update));
    }
    render() {
      return <JeopardyBoard 
        categories={this.state.categories} 
        prices={this.state.prices}
        onClick={ () => {} }>
      </JeopardyBoard>;
    }
  };
});