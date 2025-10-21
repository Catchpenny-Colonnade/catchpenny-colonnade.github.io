namespace("pyramid.PyramidGame", {
  "common.CardDisplay": "Card",
  "common.CardLogic": "Deck"
},({ Card, Deck }) => {
    const tagBorder = "border border-warning border-5";
    const pyramid = [
        [0], 
        [1,2], 
        [3,4,5], 
        [6,7,8,9], 
        [10,11,12,13,14], 
        [15,16,17,18,19,20], 
        [21,22,23,24,25,26,27]
    ];
    const ranksAceFirst = Deck.getRanksAceFirst();
    const cardRanksBySuit = {
        "C": Array.from(ranksAceFirst),
        "D": Array.from(ranksAceFirst),
        "H": Array.from(ranksAceFirst),
        "S": Array.from(ranksAceFirst),
    };
    const getValue = function(card) {
        const suit = Card.getSuit(card);
        if (!suit) return 0;
        const rank = card.replace(suit,"");
        const value = ranksAceFirst.indexOf(rank) + 1;
        return value;
    }
    const initDeck = Deck.buildDeck(cardRanksBySuit);
    const buildInitState = function() {
        const deck = Deck.shuffle(initDeck);
        return {
            pyramid: deck.splice(0,28),
            dealPile: deck,
            drawPile: [],
            isPileTagged: false,
            taggedIndicies: [],
            gameOver: false
        };
    }
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = buildInitState();
        }
        isFree(row, cell) {
            return !pyramid[row + 1] || (!this.state.pyramid[pyramid[row + 1][cell]] && !this.state.pyramid[pyramid[row + 1][cell + 1]]);
        }
        isTagged(cardIndex) {
            return this.state.taggedIndicies.indexOf(cardIndex) > -1;
        }
        draw() {
            var { dealPile, drawPile } = this.state;
            [dealPile, drawPile] = [dealPile, drawPile].map((arr) => Array.from(arr));
            drawPile.unshift(dealPile.pop());
            this.setState({ dealPile, drawPile, isPileTagged: false, taggedIndicies: [] });
        }
        reset() {
            this.setState({ dealPile: Array.from(this.state.drawPile).reverse(), drawPile: [], isPileTagged: false, taggedIndicies: [] });
        }
        tagPile() {
            if (this.state.isPileTagged) {
                this.setState({ isPileTagged: false });
            } else {
                this.handleTags({ isPileTagged: true, taggedIndicies: this.state.taggedIndicies });
            }
        }
        tagCard(cardIndex) {
            const taggedIndicies = Array.from(this.state.taggedIndicies);
            if (this.isTagged(cardIndex)) {
                const index = taggedIndicies.indexOf(cardIndex);
                taggedIndicies.splice(index,1);
                this.setState({ taggedIndicies });
            } else {
                taggedIndicies.push(cardIndex);
                this.handleTags({ taggedIndicies, isPileTagged: this.state.isPileTagged })
            }
        }
        handleTags(tags) {
            const { taggedIndicies, isPileTagged } = tags;
            var tagCount = taggedIndicies.length + (isPileTagged?1:0);
            var valueTotal = taggedIndicies.reduce((sum, index) => sum + getValue(this.state.pyramid[index]), isPileTagged?getValue(this.state.drawPile[0]):0);
            if (valueTotal == 13 && tagCount <= 2) {
                console.log({ path: "13" });
                const [drawPile, statePyramid] = ["drawPile", "pyramid"].map((prop) => Array.from(this.state[prop]));
                if (isPileTagged) {
                    drawPile.shift();
                }
                taggedIndicies.forEach(index => {
                    statePyramid[index] = undefined;
                });
                var gameOver = (statePyramid.filter(card => !!card).length == 0);
                this.setState({ gameOver, drawPile, pyramid: statePyramid, taggedIndicies: [], isPileTagged: false });
            } else if (tagCount < 2) {
                console.log({ path: "tagCount", tagCount, taggedIndicies, isPileTagged });
                this.setState(tags);
            } else {
                console.log({ path: "clear tags" });
                this.setState({ taggedIndicies: [], isPileTagged: false });
            }
        }
        render() {
            const drawCard = this.state.drawPile[0];
            const drawCardSuitClass = Card.getSuitClass(drawCard);
            const displayDrawCard = Card.displayCard(drawCard);
            return <>
            { this.state.gameOver && <div className="d-flex flex-column h-100 mt-5">
                    <div className="d-flex justify-content-center">
                        <h2>You've Completed The Pyramid!</h2>
                    </div>
                    <div className="d-flex justify-content-center">
                        <h3>Refresh the page to play again.</h3>
                    </div>
                </div>}
            {
                !this.state.gameOver &&
                <div className="d-flex flex-column h-100 mt-5">
                    {
                        pyramid.map((row, r) => <div className="d-flex justify-content-center mb-2 mt-2">
                            { row.map((cardIndex, cell) => {
                                const card = this.state.pyramid[cardIndex];
                                const suitClass = Card.getSuitClass(card);
                                const displayCard = Card.displayCard(card);
                                return <div className="col-2">
                                    { displayCard && <button className={`${ suitClass }${this.isTagged(cardIndex)?tagBorder:''}`} disabled={ !this.isFree(r, cell) } onClick={() => this.tagCard(cardIndex)}>{ displayCard }</button> }
                                </div>;
                            })}
                        </div>)
                    }
                    <div className="d-flex justify-content-center mb-2 mt-2">
                        <div className="col-2"></div>
                    </div>
                    <div className="d-flex justify-content-center mb-2 mt-2">
                        <div className="col-2"></div>
                        <div className="col-2">
                            { this.state.dealPile.length > 0 && <button className="btn btn-primary w-100" onClick={() => this.draw()}>Draw</button> }
                            { this.state.dealPile.length == 0 && <button className="btn btn-warning w-100" onClick={() => this.reset()}>Reset</button> }
                        </div>
                        <div className="col-2">
                            { drawCard && <button className={`${ drawCardSuitClass }${this.state.isPileTagged?tagBorder:''}`} onClick={() => this.tagPile()}>{ displayDrawCard }</button> }
                        </div>
                        <div className="col-2"></div>
                        <div className="col-2"></div>
                        <div className="col-2"></div>
                    </div>
                </div>
            }
            </>
;
        }
    }
});