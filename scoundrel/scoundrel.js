namespace('scoundrel.ScoundrelGame',{
  "common.CardDisplay": "Card",
  "common.CardLogic": "Deck"
},({ Card, Deck }) => {
  const ranksAceLast = Deck.getRanksAceLast();
  const redRanks = Array.from(ranksAceLast).splice(0,9);
  const cardRanksBySuit = {
    "C": Array.from(ranksAceLast),
    "D": Array.from(redRanks),
    "H": Array.from(redRanks),
    "S": Array.from(ranksAceLast),
  };
  const getCardValue = function(card) {
    const suit = Card.getSuit(card);
    const rank = card.replace(suit, "");
    const index = ranksAceLast.indexOf(rank);
    return index + 2;
  }
  const deck = Deck.buildDeck(cardRanksBySuit);
  const getInitState = function() {
    return {
        deck: Deck.shuffle(deck),
        canRun: true,
        hp: 20,
        equipt: true,
        weapon: undefined,
        lastKill: undefined,
        hand: Array.from(Array(4)),
        canDraw: true,
        potionUsed: false,
        gameOver: false
      };
  }
  const staticDraw = function(hand, deck, updates) {
    console.log({ hand, deck, updates });
    updates.hand = [];
    hand.forEach((card) => {
      if (!card) {
        updates.hand.push(deck.shift());
      } else {
        updates.hand.push(card);
      }
    });
  }
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = getInitState();
    }
    draw() {
      const updates = { canRun: true, canDraw: false };
      const deck = Array.from(this.state.deck);
      staticDraw(this.state.hand || Array.from(Array(4)), deck, updates);
      updates.deck = deck;
      updates.potionUsed = false;
      console.log({ updates });
      this.setState(updates);
    }
    run() {
      const deck = Array.from(this.state.deck);
      const hand = Deck.shuffle(Array.from(this.state.hand));
      while(hand.length > 0) {
        deck.push(hand.shift());
      }
      const updates = { deck, canRun: false, potionUsed: false, canDraw: false };
      staticDraw(Array.from(Array(4)), deck, updates);
      this.setState(updates);
    }
    handlePotion(updates, card, value) {
      if (!updates.potionUsed) {
        updates.hp = Math.min(20, updates.hp + value);
        updates.potionUsed = true;
      }
    }
    handleWeapon(updates, card, value) {
      updates.weapon = card;
    }
    handleEnemy(updates, card, value) {
      if (this.state.weapon) {
        if (this.state.lastKill) {
          const lastKillValue = getCardValue(this.state.lastKill);
          if (lastKillValue < value) {
            updates.hp = Math.max(0,updates.hp-value);
          } else {
            const weaponValue = getCardValue(this.state.weapon);
            updates.hp = Math.max(0,updates.hp-Math.max(0,(value - weaponValue)));
            updates.lastKill = card;
          }
        } else {
          if (this.state.equipt) {
            const weaponValue = getCardValue(this.state.weapon);
            updates.hp = Math.max(0,updates.hp-Math.max(0,(value - weaponValue)));
            updates.lastKill = card;
          } else {
            updates.hp = Math.max(0,updates.hp-value);
          }
        }
      } else {
        updates.hp = Math.max(0,updates.hp-value);
      }
    }
    handleCard(cardIndex) {
      const hand = Array.from(this.state.hand);
      const card = hand[cardIndex];
      hand[cardIndex] = undefined;
      const suit = Card.getSuit(card);
      const value = getCardValue(card);
      const updates = {
        canRun: false,
        hp: this.state.hp,
        potionUsed: this.state.potionUsed,
        hand
      };
      if (suit == "H") {
        this.handlePotion(updates, card, value);
      } else if (suit == "D") {
        this.handleWeapon(updates, card, value);
      } else {
        this.handleEnemy(updates, card, value);
      }
      const handCards = hand.filter(card => !!card);
      const handSize = handCards.length;
      updates.canDraw = (handSize <= 1);
      updates.gameOver = (updates.hp == 0 || (handSize == 0 && this.state.deck.length == 0));
      if (updates.gameOver) {
        if (updates.hp > 0) {
          updates.finalScore = updates.hp;
        } else {
          updates.finalScore = Array.from(this.state.deck).concat(handCards).filter(card => Card.getSuitColor(card) == "black").map(card => getCardValue(card)).reduce((sum,value) => sum - value, 0);
        }
      }
      this.setState(updates);
    }
    toggleEquipt() {
      this.setState({ equipt: !this.state.equipt });
    }
    dropWeapon() {
      this.setState({ weapon: undefined, lastKill: undefined });
    }
    isPotionLocked(card) {
      const suit = Card.getSuit(card);
      if (suit) return this.state.potionUsed && suit == "H";
    }
    render() {
      return <>
      { this.state.gameOver && <>
        <div className="d-flex flex-column">
          <div className="d-flex align-content-center">
            <h2>GAME OVER!</h2>
          </div>
          <div className="d-flex align-content-center">
            <h3>Final Score: { this.state.finalScore }</h3>
          </div>
        </div>
      </> }
      {
        !this.state.gameOver && <>
          <div className="row mb-3 mt-4">
            <div className="col-3" datatest-id="deck">
              { this.state.deck.length > 0 && <button className="btn btn-primary w-100" disabled={ !this.state.canDraw } onClick={() => this.draw()}><h3>Draw</h3></button> }
            </div>
            <div className="col-3 text-center" datatest-id="hp">
              <span className="w-100 text-center">{ this.state.hp }</span>
            </div>
            <div className="col-3">
            </div>
            <div className="col-3" datatest-id="run">
              { this.state.canRun && <button className="btn btn-success w-100" onClick={() => this.run()}><h3>Run</h3></button> }
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-3" datatest-id="card1">
              { this.state.hand[0] && 
                <button className={ !this.isPotionLocked(this.state.hand[0])?Card.getSuitClass(this.state.hand[0]):Card.getSuitOutlineClass(this.state.hand[0]) } onClick={() => this.handleCard(0)}>
                  <h3>{ Card.displayCard(this.state.hand[0]) }</h3>
                </button> }
            </div>
            <div className="col-3" datatest-id="card2">
              { this.state.hand[1] && 
                <button className={ !this.isPotionLocked(this.state.hand[1])?Card.getSuitClass(this.state.hand[1]):Card.getSuitOutlineClass(this.state.hand[1]) } onClick={() => this.handleCard(1)}>
                  <h3>{ Card.displayCard(this.state.hand[1]) }</h3>
                </button> }
            </div>
            <div className="col-3" datatest-id="card3">
              { this.state.hand[2] && 
                <button className={ !this.isPotionLocked(this.state.hand[2])?Card.getSuitClass(this.state.hand[2]):Card.getSuitOutlineClass(this.state.hand[2]) } onClick={() => this.handleCard(2)}>
                  <h3>{ Card.displayCard(this.state.hand[2]) }</h3>
                </button> }
            </div>
            <div className="col-3" datatest-id="card4">
              { this.state.hand[3] && 
                <button className={ !this.isPotionLocked(this.state.hand[3])?Card.getSuitClass(this.state.hand[3]):Card.getSuitOutlineClass(this.state.hand[3]) } onClick={() => this.handleCard(3)}>
                  <h3>{ Card.displayCard(this.state.hand[3]) }</h3>
                </button> }
            </div>
          </div>
          <div className="row">
            <div className="col-3" datatest-id="toggleEquip">
              { this.state.weapon && <button className="btn btn-success w-100" onClick={() => this.toggleEquipt()}><h3>{ this.state.equipt?'Unequipt':'Equipt' }</h3></button> }
            </div>
            <div className="col-3" datatest-id="weapon">
              { this.state.weapon && <button className="btn btn-danger w-100" disabled="true"><h3>{ Card.displayCard(this.state.weapon) }</h3></button> }
            </div>
            <div className="col-3" datatest-id="lastKill">
              { this.state.lastKill && <button className="btn btn-secondary w-100 h-100" disabled="true"><h3>{ Card.displayCard(this.state.lastKill) }</h3></button> }
            </div>
            <div className="col-3" datatest-id="drop">
              { this.state.weapon && <button className="btn btn-success w-100" onClick={() => this.dropWeapon()}><h3>Drop</h3></button> }
            </div>
          </div>
        </>
      }
      </>;
    }
  }
});