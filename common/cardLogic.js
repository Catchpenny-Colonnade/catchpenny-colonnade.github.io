namespace("common.CardLogic", {}, () => {
    const ranksAceLast = [ "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" ];
    const ranksAceFirst = [ "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K" ];
    const getRanksAceLast = function() {
        return Array.from(ranksAceLast);
    }
    const getRanksAceFirst = function() {
        return Array.from(ranksAceFirst);
    }
    const buildDeck = function(cardRanksBySuit) {
        return Object.keys(cardRanksBySuit).reduce((deck, suit) => {
            cardRanksBySuit[suit].forEach((rank) => {
                deck.push(rank + suit);
            });
            return deck;
        }, []);
    }
    const shuffle = function(deck) {
        var oldDeck = Array.from(deck);
        var newDeck = [];
        while(oldDeck.length > 0) {
        newDeck = newDeck.concat(oldDeck.splice(Math.random() * oldDeck.length, 1));
        }
        return newDeck;
    }
    return { getRanksAceLast, getRanksAceFirst, buildDeck, shuffle };
});
