namespace("pyramid.PyramidGame", {
  "common.CardDisplay": "Card",
  "common.CardLogic": "Deck"
},({ Card, Deck }) => {
    const pyramid = [
        [0], 
        [1,2], 
        [3,4,5], 
        [6,7,8,9], 
        [10,11,12,13,14], 
        [15,16,17,18,19,20], 
        [21,22,23,24,25,26,27]
    ];
    const ranksAceLast = Deck.getRanksAceLast();
    const cardRanksBySuit = {
        "C": Array.from(ranksAceLast),
        "D": Array.from(ranksAceLast),
        "H": Array.from(ranksAceLast),
        "S": Array.from(ranksAceLast),
    };
    const initDeck = Deck.buildDeck(cardRanksBySuit);
    const buildInitState = function() {
        const deck = Deck.shuffle(initDeck);
        return {
            pyramid: deck.splice(0,28),
            drawPile: deck
        };
    }
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = buildInitState();
        }
        handleCard(index) {
            // todo
        }
        render() {
            return <div className="d-flex flex-column h-100 mt-5">
                {
                    pyramid.map((row) => <div className="d-flex justify-content-center mb-2 mt-2">
                        { row.map((cardIndex) => {
                            const card = this.state.pyramid[cardIndex];
                            const suitClass = Card.getSuitClass(card);
                            const displayCard = Card.displayCard(card);
                            return <div className="col-2">
                                <button className={suitClass} onClick={() => this.handleCard(cardIndex)}>{ displayCard }</button>
                            </div>;
                        })}
                    </div>)
                }
            </div>;
        }
    }
});