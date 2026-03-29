namespace("chess.Chess", {
  "chess.Logic": "Logic"
}, ({ Logic }) => {
  const players = ["white","black"];
  const promoteables = [ "rook", "knight", "bishop", "queen" ];
  const pieces = ["pawn", "rook", "knight", "bishop", "queen", "king"];
  const side = [ 0, 1, 2, 3, 4, 5, 6, 7 ];
  const chars = "abcdefgh"
  const fontColors = ["light","dark"];
  const oppositeColors = {
    "light": "dark",
    "dark": "light"
  };
  const icon = (piece, isSelected, bgColor, isOnColor) => <i className={`fa${isOnColor?"r":"s"} fa-chess-${piece} text-${isSelected?"success":oppositeColors[bgColor]}`}></i>;
  const spaceIcon = (bgColor) => <i className={`fas fa-square-full text-${bgColor}`}></i>
  const isOnColor = (pieceColor, bg) => fontColors.indexOf(bg) == players.indexOf(pieceColor);
  const bgColor = (r,c) => fontColors[Math.abs((r % 2) - (c % 2))];
  const nextPlayer = (turn) => players[(players.indexOf(turn) + 1) % 2];
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        turn: "white",
        pieces: Logic.setupBoard(),
        history: [],
        endgameState: undefined
      };
    }
    getPiece(row,col) {
      return this.state.pieces.filter(piece => piece.row == row && piece.col == col)[0];
    }
    validatePiece(row,col) {
      return Logic.validatePiece(this.state.turn, this.state.pieces, this.state.endgameState, row, col);
    }
    validateMove(row,col) {
      return Logic.validateMove(this.state.pieces, this.state.endgameState, this.state.history, this.state.selectedPiece, row, col);
    }
    promoteTo(pieceType) {
      const { pieces, endgameState, history } = Logic.promotePawn(this.state.pieces, this.state.history, this.state.promotionPending, pieceType);
      this.setState({ error: undefined, promotionPending: undefined, pieces, history, endgameState, turn: nextPlayer(this.state.turn) });
    }
    click(row, col) {
      if (this.state.selectedPiece) {
        const { pieces, history, endgameState, promotionPending, error } = this.validateMove(row, col);
        if (error) {
          this.setState({ error })
        } else if (promotionPending) {
          this.setState({ error: undefined, selectedPiece: undefined, promotionPending, pieces });
        } else {
          this.setState({ error: undefined, selectedPiece: undefined, pieces, history, endgameState, turn: nextPlayer(this.state.turn) });
        }
      } else {
        const { selectedPiece, error } = this.validatePiece(row, col);
        if (error) {
          this.setState({ error })
        } else {
          this.setState({ selectedPiece, error: undefined })
        }
      }
    }
    isSelected(row, col) {
      return (this.state.selectedPiece && 
        this.state.selectedPiece.row == row && 
        this.state.selectedPiece.col == col) ||
      (this.state.promotionPending &&
        this.state.promotionPending.to.row == row &&
        this.state.promotionPending.to.col == col);
    }
    render() {
      return <div className="d-flex flex-column justify-content-center align-items-center">
        <h3>Turn: {this.state.turn}</h3>
        { this.state.endgameState && <h4 className={this.state.endgameState=='Check'?"text-warning":"text-danger"}>{this.state.endgameState}</h4>}
        { this.state.promotionPending && <table>
          <tbody>
            <tr>
              { promoteables.map((pieceType, col) => {
                const bg = bgColor(row, col);
                return <td key={`promote-to-${pieceType}`} className={`promoteable bg-${bg}`}>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    this.promoteTo(pieceType);
                  }}>
                    { icon(pieceType, false, bg, isOnColor(this.state.turn, bg)) }
                  </a>
                </td>
              }) }
            </tr>
          </tbody>
        </table>}
        <table>
          <tbody>
            <tr>
              <td></td>
              { side.map( col => <td key={"top"+chars.charAt(col)}>{ chars.charAt(col) }</td>) }
              <td></td>
            </tr>
            { side.map( row => <tr key={"row"+row}>
              <td key={"left"+(8 - row)}>{ 8 - row }</td>
              { side.map( col => {
                const bg = bgColor(row, col);
                const piece = this.getPiece(row, col);
                const space = spaceIcon(bg);
                return <td key={`cell_${chars.charAt(col)}${8-row}`} className={`space bg-${bg}`}>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    this.click(row,col);
                  }}>
                    { piece?icon(piece.piece, this.isSelected(row, col), bg, isOnColor(piece.color, bg)):space }
                  </a>
                </td>
              })}
              <td key={"right"+(8 - row)}>{ 8 - row }</td>
            </tr>) }
            <tr>
              <td></td>
              { side.map( col => <td key={"bottom"+chars.charAt(col)}>{ chars.charAt(col) }</td>) }
              <td></td>
            </tr>
          </tbody>
        </table>
        <h4 className="text-danger">{this.state.error}</h4>
      </div>;
    }
  }
});