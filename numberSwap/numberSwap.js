namespace("numberSwap.NumberSwap",{},() => {
  let shuffleInitState = function() {
    let initValues = Array(16).fill("_").map((c,i) => (i > 0)?i:c);
    let shuffled = [];
    while(initValues.length > 0) {
      let index = Math.floor(Math.random((new Date()).getTime()) * initValues.length);
      shuffled.push(initValues.splice(index,1)[0]);
    }
    return {
      values: shuffled,
      empty: shuffled.indexOf("_")
    };
  }
  let isIndexValid = function( index, empty ) {
    return (index >= 0 && (empty === index + 4)) || (index < 16 && empty === index - 4) || (index % 4 < 3 && empty === index + 1) || (index % 4 > 0 && empty === index - 1);
  }
  let isOrdered = function( values ) {
    let copy = values.filter(i => typeof i === "number");
    copy.sort(( a, b ) => a - b);
    let ordered = copy.join(",") + ",_";
    let currentOrder = values.join(",");
    return currentOrder === ordered;
  }
  let swap = function( values, a, b ) {
    let temp = values[a];
    values[a] = values[b];
    values[b] = temp;
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = shuffleInitState();
    }
    click(index) {
      let { empty } = this.state;
      let values = Array.from(this.state.values);
      if (isIndexValid(index, empty)) {
        swap(values, index, empty);
        this.setState({ values, empty: index });
      }
    }
    render() {
      let completed = isOrdered(this.state.values);
      return (<div className="d-flex justify-content-center">
        { completed && <div className="d-flex flex-column">
          <h3>Completed!</h3>
          <button className="btn btn-success" onClick={() => this.setState(shuffleInitState())}>Play Again?</button>
        </div>}
        { !completed && <>
          <table className="table w-50">
            <tbody>
              { [0,1,2,3].map(row => {
                return <tr key={`row${row}`}>
                  { [0,1,2,3].map(col => {
                    let index = (row * 4) + col;
                    let value = this.state.values[index];
                    return <td key={`cell${index}`}>
                      <div className="d-flex justify-content-center">
                        {(typeof value === "number") && 
                          <button className="btn btn-primary w-100" onClick={() => this.click(index)}>
                            <span>{value}</span>
                          </button>
                        }
                      </div>
                    </td>
                  }) }
                </tr>
              }) }
            </tbody>
          </table>
        </>}
      </div>);
    }
  }
});
