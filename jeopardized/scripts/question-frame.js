namespace("jeopardized.QuestionFrame", {}, () => {
  return function(props) {
    return <div className="d-flex justify-content-center">
      <div className="d-flex flex-column justify-content-center h-75">
        <h2 className="text-light text-center m-4">{props.category}{props.price?` - $${props.price}`:""}</h2>
        <h1 className="text-light text-center m-4" dangerouslySetInnerHTML={{ __html: props.question}}></h1>
        { props.answer && <h2 className="text-light text-center m-4">{props.answer}</h2> }
      </div>
    </div>;
  }
});