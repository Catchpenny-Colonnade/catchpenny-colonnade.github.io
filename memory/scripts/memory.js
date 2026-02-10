namespace("memory.Memory", {
  "memory.Icons": "Icons"
}, ({ Icons }) => {
  const shuffle = function() {
    // todo
  };
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        board: shuffle(),
      };
    }
    click(index) {
      // todo
    }
    render() {
      return <>
        <h1 className="text-center">Memory!</h1>
        <div className="row justify-content-center">
          { this.state.board.map(({ iconIndex, revealed }, index) => {
            var showCard = revealed || index == this.state.first || index
            return <button className="btn btn-primary icon-frame" onClick={() => this.click(index)}>
              { showCard?Icons.getIconByIndex(iconIndex):Icons.getCardBack() }
            </button>;
          })}
        </div>
      </>;
    }
  }
});