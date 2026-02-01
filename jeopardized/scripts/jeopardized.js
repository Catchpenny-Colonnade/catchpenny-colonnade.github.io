namespace("jeopardized.Jeopardized", {
  "jeopardized.JeopardyBoard": "JeopardyBoard",
  "jeopardized.JeopardyDisplay": "JeopardyDisplay",
  "jeopardized.DisplayWindow": "DisplayWindow",
}, ({ JeopardyBoard, JeopardyDisplay, DisplayWindow }) => {
  const newInitState = function() {
    return {
      categories:[
        "Category 1",
        "Category 2",
        "Category 3",
        "Category 4",
        "Category 5",
        "Category 6",
      ],
      prices: [
        ["100","100","100","100","100","100"],
        ["200","200","200","200","200","200"],
        ["300","300","300","300","300","300"],
        ["400","400","400","400","400","400"],
        ["500","500","500","500","500","500"],
      ]
    };
  };
  return class extends React.Component {
    constructor(props) {
      super(props);
      const { categories, prices } = newInitState();
      this.state = {
        categories, 
        prices,
        display: new DisplayWindow("playerView", "Jeopardized", "container gears-bg-dark text-light", JeopardyDisplay, {})
      };
      this.state.display.open({ categories, prices });
    }
    selectAnswer(categoryIndex, priceIndex) {
      alert(`category: ${this.state.categories[categoryIndex]}, price: \$${this.state.prices[priceIndex][categoryIndex]}`);
      var prices = this.state.prices.map(row => Array.from(row));
      prices[priceIndex][categoryIndex] = "";
      this.state.display.update({ prices });
      this.setState({ prices });
    }
    render() {
      return <JeopardyBoard 
        categories={this.state.categories} 
        prices={this.state.prices}
        onClick={ (catIndex, priceIndex) => this.selectAnswer(catIndex, priceIndex) }>
      </JeopardyBoard>;
    }
  }
});