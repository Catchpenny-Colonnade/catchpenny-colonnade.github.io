namespace('scoundrel.ScoundrelGame',{
},() => {
  const suits = [ "C", "D", "H", "S" ];
  const cardRanksBySuit = {
    "C": [ "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" ],
    "D": [ "2", "3", "4", "5", "6", "7", "8", "9", "10" ],
    "H": [ "2", "3", "4", "5", "6", "7", "8", "9", "10" ],
    "S": [ "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" ],
  };
  const suitClass = {
    "C": "btn btn-secondary w-100",
    "D": "btn btn-danger w-100",
    "H": "btn btn-danger w-100",
    "S": "btn btn-secondary w-100"
  };
  const iconChars = {
    "C": "\u2663",
    "D": "\u2666",
    "H": "\u2665",
    "S": "\u2660"
  };
  const getSuit = function(card) {
    if (card) return suits.filter((suit) => card.endsWith(suit))[0];
  }
  const getCardValue = function(card) {
    const suit = getSuit(card);
    const rank = card.replace(suit, "");
    const index = cardRanksBySuit[suit].indexOf(rank);
    return index + 2;
  }
  const getSuitClass = function(card) {
    var suit = getSuit(card);
    if (suit) return suitClass[getSuit(card)];
  }
  const displayCard = function(card) {
    const suit = getSuit(card);
    return card.replace(suit, iconChars[suit]);
  }
  const deck = Object.keys(cardRanksBySuit).reduce((deck, suit) => {
    cardRanksBySuit[suit].forEach((rank) => {
      deck.push(rank + suit);
    });
    return deck;
  }, [])
  const shuffle = function(deck) {
    var oldDeck = Array.from(deck);
    var newDeck = [];
    while(oldDeck.length > 0) {
      newDeck = newDeck.concat(oldDeck.splice(Math.random() * oldDeck.length, 1));
    }
    return newDeck;
  }
  const getInitState = function() {
    return {
        deck: shuffle(deck),
        canRun: true,
        hp: 20,
        equipt: false,
        weapon: undefined,
        lastKill: undefined,
        card1: undefined,
        card2: undefined,
        card3: undefined,
        card4: undefined,
        canDraw: true,
        potionUsed: false
      };
  }
  const cards = [ "card1", "card2", "card3", "card4" ];
  const staticDraw = function(state, deck, updates) {
    cards.forEach((cardName) => {
      if (!state[cardName]) {
        updates[cardName] = deck.shift();
      }
    });
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = getInitState();
    }
    draw() {
      const updates = {};
      const deck = Array.from(this.state.deck);
      staticDraw(this.state, deck, updates);
      updates.deck = deck;
      this.setState(updates);
    }
    run() {
      const deck = Array.from(this.state.deck);
      const hand = shuffle(cards.map((cardName) => this.state[cardName]));
      while(hand.length > 0) {
        deck.push(hand.shift());
      }
      const updates = { deck, canRun: false };
      cards.forEach((cardName) => updates[cardName] = deck.shift());
    }
    handlePotion(cardName, card, value) {
      // todo
    }
    handleWeapon(cardName, card, value) {
      // todo
    }
    handleEnemy(cardName, card, value) {
      // todo
    }
    handleCard(cardName) {
      const card = this.state[cardName];
      const suit = getSuit(card);
      const value = getCardValue(card);
      if (suit == "H") {
        handlePotion(cardName, card, value);
      } else if (suit == "D") {
        handleWeapon(cardName, card, value);
      } else {
        handleEnemy(cardName, card, value);
      }
    }
    toggleEquipt() {
      this.setState({ equipt: !this.state.equipt });
    }
    dropWeapon() {
      this.setState({ weapon: undefined, lastKill: undefined });
    }
    render() {
      return <>
        <div className="row mb-3 mt-4">
          <div className="col-3" datatest-id="deck">
            { this.state.deck.length > 0 && <button className="btn btn-primary w-100" disabled={ !this.state.canDraw } onClick={() => this.draw()}>Draw</button> }
          </div>
          <div className="col-3 text-center" datatest-id="hp">
            <span className="w-100 text-center">{ this.state.hp }</span>
          </div>
          <div className="col-3">
          </div>
          <div className="col-3" datatest-id="run">
            { this.state.canRun && <button className="btn btn-success w-100" onClick={() => this.run()}>Run</button> }
          </div>
        </div>
        <div className="row mb-1">
          <div className="col-3" datatest-id="card1">
            { this.state.card1 && 
              <button className={ getSuitClass(this.state.card1) } onClick={() => this.handleCard('card1')}>
                { displayCard(this.state.card1) }
              </button> }
          </div>
          <div className="col-3" datatest-id="card2">
            { this.state.card2 && 
              <button className={ getSuitClass(this.state.card2) } onClick={() => this.handleCard('card2')}>
                { displayCard(this.state.card2) }
              </button> }
          </div>
          <div className="col-3" datatest-id="card3">
            { this.state.card3 && 
              <button className={ getSuitClass(this.state.card3) } onClick={() => this.handleCard('card3')}>
                { displayCard(this.state.card3) }
              </button> }
          </div>
          <div className="col-3" datatest-id="card4">
            { this.state.card4 && 
              <button className={ getSuitClass(this.state.card4) } onClick={() => this.handleCard('card4')}>
                { displayCard(this.state.card4) }
              </button> }
          </div>
        </div>
        <div className="row">
          <div className="col-3" datatest-id="toggleEquip">
            { this.state.weapon && <button className="btn btn-success w-100" onClick={() => this.toggleEquipt()}>{ this.state.equipt?'Unequipt':'Equipt' }</button> }
          </div>
          <div className="col-3" datatest-id="weapon">
            { this.state.weapon && <span className="text-bg-danger w-100">{ displayCard(this.state.weapon) }</span> }
          </div>
          <div className="col-3" datatest-id="lastKill">
            { this.state.lastKill && <span className="text-bg-secondary w-100">{ displayCard(this.state.lastKill) }</span> }
          </div>
          <div className="col-3" datatest-id="drop">
            { this.state.weapon && <button className="btn btn-success w-100" onClick={() => this.dropWeapon()}>Drop</button> }
          </div>
        </div>
      </>;
    }
  }
});