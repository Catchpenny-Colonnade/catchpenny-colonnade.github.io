namespace("jeopardized.JeopardyBoard", {}, () => {
  return function(props) {
    return <div className="d-flex justify-content-center">
      <div className="d-flex flex-column justify-content-center">
        <div className="d-flex justify-content-center">
          <h2>Jeopardized!</h2>
        </div>
        <div className="d-flex flex-column justify-content-center">
          <div className="row mb-3">
            { props.categories.map(cat => <div className="col-2">
              <div className="d-flex flex-column justify-content-center gears-bg-primary rounded-3 category-button p-3 m-1 w-100 h-100">
                <h4 className="text-center ">{cat}</h4>
              </div>
            </div>)}
          </div>
          { props.prices.map((row) => <div className="row">
            { row.map((price,catIndex) => <div className="col-2">
              <button 
                className="btn text-light text-center gears-bg-primary rounded-3 price-button m-1 w-100"
                onClick={() => props.onClick(props.categories[catIndex],price)}>
                <h2>
                  { price.length > 0 && <>
                    <i className="fas fa-dollar-sign p-1"></i>
                    { price.split("").map(n => <i className={`fas fa-${n} p-1`}></i>)}
                  </>}
                </h2>
              </button>
            </div>)}
          </div>)}
        </div>
      </div>
    </div>
  }
});
