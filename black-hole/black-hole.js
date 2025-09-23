namespace('black-hole.BlackHoleGame',{
  "black-hole.Pyramid": "Pyramid"
},({ Pyramid }) => {
  const players = ["red","blue"];
  const nextPlayer = {
    "red": "blue",
    "blue": "red"
  };
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        player: players[0],
        pyramidState: Pyramid.build(players)
      };
    }
    render() {
      return <>
      </>;
    }
  }
});