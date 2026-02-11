namespace("memory.Memory", {
  "memory.Icons": "Icons"
}, ({ Icons }) => {
  const iconIndexList = "?".repeat(Icons.getIconCount()).split("").map((_,i) => i);
  const pairCount = 24;
  const bgColor = "primary";
  const iconArgs = {
    fill: "red",
  };
  const shuffle = function() {
    const allIcons = Array.from(iconIndexList);
    const deck = [];
    while(deck.length < pairCount) {
      deck.push(allIcons.splice(Math.floor(Math.random() * allIcons.length), 1));
    }
    const doubleDeck = deck.concat(deck);
    const shuffled = [];
    while(doubleDeck.length > 0) {
      shuffled.push(doubleDeck.splice(Math.floor(Math.random() * doubleDeck.length), 1));
    }
    return shuffled.map((iconIndex) => {
      return { iconIndex, revealed: false };
    });
  };
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        board: shuffle(),
      };
    }
    click(index) {
      if (isNaN(this.state.first)) {
        this.setState({ first: index });
      } else if (isNaN(this.state.second)) {
        this.setState({ second: index })
      }
    }
    afterRender() {
      const { first, second, board } = this.state;
      if (!isNaN(first) && !isNaN(second)) {
        const [ firstCard, secondCard ] = [ first, second ].map(i => board[i]);
        if ( firstCard.iconIndex === secondCard.iconIndex ) {
          alert("Cards match!");
          firstCard.revealed = true;
          secondCard.revealed = true
          this.setState({ board, first: undefined, second: undefined });
        } else {
          alert("Cards don't match!");
          this.setState({ first: undefined, second: undefined });
        }
      }
      // todo
    }
    componentDidMount() {
      this.afterRender();
    }
    componentDidUpdate() {
      this.afterRender();
    }
    render() {
      return <>
        <h1 className="text-center">Memory!</h1>
        <div className="row justify-content-center">
          { this.state.board.map(({ iconIndex, revealed }, index) => {
            var showCard = revealed || index == this.state.first || index == this.state.second;
            return <button className={`btn btn-${bgColor} icon-frame`} onClick={() => this.click(index)}>
              { showCard?Icons.getIconByIndex(iconIndex, iconArgs):Icons.getCardBack(iconArgs) }
            </button>;
          })}
        </div>
      </>;
    }
  }
});