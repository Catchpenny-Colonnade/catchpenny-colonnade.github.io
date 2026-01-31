namespace("jeopardized.Jeopardized", {
  "jeopardized.JeopardyBoard": "JeopardyBoard"
}, ({ JeopardyBoard }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        categories:[
          "Category 1",
          "Category 2",
          "Category 3",
          "Category 4",
          "Category 5",
          "Category 6",
        ],
        prices: [
          [100,200,300,400,500],
          [100,200,300,400,500],
          [100,200,300,400,500],
          [100,200,300,400,500],
          [100,200,300,400,500],
          [100,200,300,400,500],
        ]
      };
    }
    selectAnswer(categoryIndex, priceIndex) {
      alert(`category: ${this.state.categories[categoryIndex]}, price: \$${this.state.prices[priceIndex]}00`);
      var prices = this.state.prices.map(row => Array.from(row));
      prices[categoryIndex][priceIndex] = "";
    }
    render() {
      return <JeopardyBoard 
        categories={this.state.categories} 
        prices={this.state.prices}
        onClick={ (catIndex, priceIndex) => this.selectAnswer(catIndex, priceIndex) }></JeopardyBoard>;
    }
  }
});