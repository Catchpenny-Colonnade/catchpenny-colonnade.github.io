namespace("jeopardized.Jeopardized", {}, () => {
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
        prices: [1,2,3,4,5]
      };
    }
    selectAnswer(categoryIndex, priceIndex) {
      alert(`category: ${this.state.categories[categoryIndex]}, price: \$${this.state.prices[priceIndex]}00`);
    }
    render() {
      return <div className="d-flex justify-content-center">
        <div className="d-flex flex-column justify-content-center">
          <div className="d-flex justify-content-center">
            <h2>Jeopardized!</h2>
          </div>
          <div className="d-flex flex-column justify-content-center">
            <div className="row">
              { this.state.categories.map(cat => <div className="col-2">
                <h4 className="text-center gears-bg-primary rounded-3 p-3 m-1 w-100">{cat}</h4>
              </div>)}
            </div>
            { this.state.prices.map((price,pI) => <div className="row">
              { this.state.categories.map((cat,cI) => <div className="col-2">
                <button 
                  className="btn text-light text-center gears-bg-primary rounded-3 price-padding m-1 w-100"
                  onClick={() => this.selectAnswer(cI,pI)}
                  >
                  <h4>
                    <i className="fas fa-dollar-sign"></i>
                    <i className={`fas fa-${price}`}></i>
                    <i className="fas fa-0"></i>
                    <i className="fas fa-0"></i>
                  </h4>
                </button>
              </div>)}
            </div>)}
          </div>
        </div>
      </div>;
    }
  }
});