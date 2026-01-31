namespace("jeopardized.JeopardyBoard", {}, () => {
  return function(props) {
    return <div className="d-flex justify-content-center">
        <div className="d-flex flex-column justify-content-center">
          <div className="d-flex justify-content-center">
            <h2>Jeopardized!</h2>
          </div>
          <div className="d-flex flex-column justify-content-center">
            <div className="row">
              { props.categories.map(cat => <div className="col-2">
                <h4 className="text-center gears-bg-primary rounded-3 p-3 m-1 w-100">{cat}</h4>
              </div>)}
            </div>
            { props.prices.map((row,catIndex) => <div className="row">
              { row.map((price,priceIndex) => <div className="col-2">
                <button 
                  className="btn text-light text-center gears-bg-primary rounded-3 price-padding m-1 w-100 h-100"
                  onClick={() => props.onClick(catIndex,priceIndex)}>
                  <h4>
                    { price.length > 0 && <>
                      <i className="fas fa-dollar-sign"></i>
                      { price.split().map(n => <i className={`fas fa-${n}`}></i>)}
                    </>}
                  </h4>
                </button>
              </div>)}
            </div>)}
          </div>
        </div>
      </div>
  }
});