namespace("jeopardized.QuestionModal", {
  "jeopardized.QuestionFrame": "QuestionFrame"
}, ({ QuestionFrame }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.onClose = props.onClose;
      props.setOnOpen(({ question, answer, category, price }) => {
        this.setState({ question, answer, category, price })
      });
    }
    render() {
      const { question, answer, category, price } = this.state;
      if (question && category && price) {
        return <div className="d-flex flex-column p-3">
          <QuestionFrame question={question} category={category} price={price} answer={answer}></QuestionFrame>
          <div className="d-flex justify-content-end p-3">
            <button className="btn btn-success m-2" onClick={() => { this.onClose(this.state); }}>Confirm</button>
            <button className="btn btn-danger m-2" onClick={() => { this.onClose(); }}>Cancel</button>
          </div>
        </div>;
      }
    }
  }
});