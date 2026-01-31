namespace("jeopardized.JeopardyDisplay", {}, () => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = props.initState;
      this.addlAttrs = props.addlAttrs;
      props.setOnUpdate((update) => this.handleUpdate(update));
    }
    render() {
      return <>
      </>;
    }
  };
});