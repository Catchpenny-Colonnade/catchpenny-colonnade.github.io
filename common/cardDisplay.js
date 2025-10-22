namespace("common.CardDisplay", {}, () => {
    const suits = [ "C", "D", "H", "S" ];
    const getSuit = function(card) {
        if (card) return suits.filter((suit) => card.endsWith(suit))[0];
    };
    const suitColor = {
        "C": "black",
        "D": "red",
        "H": "red",
        "S": "black"
    }
    const suitClass = {
        "C": "btn btn-secondary w-100",
        "D": "btn btn-danger w-100",
        "H": "btn btn-danger w-100",
        "S": "btn btn-secondary w-100"
    };
    const suitOutlineClass = {
        "C": "btn btn-outline-secondary w-100",
        "D": "btn btn-outline-danger w-100",
        "H": "btn btn-outline-danger w-100",
        "S": "btn btn-outline-secondary w-100"
    };
    const iconChars = {
        "C": "\u2663",
        "D": "\u2666",
        "H": "\u2665",
        "S": "\u2660"
    };
    const getSuitClass = function(card) {
        var suit = getSuit(card);
        if (suit) return suitClass[suit];
    }
    const getSuitOutlineClass = function(card) {
        var suit = getSuit(card);
        if (suit) return suitOutlineClass[suit];
    }
    const getSuitColor = function(card) {
        var suit = getSuit(card);
        if (suit) return suitColor[suit];
    }
    const displayCard = function(card) {
        const suit = getSuit(card);
        if (suit) return card.replace(suit, iconChars[suit]);
    }
    return { getSuit, getSuitClass, getSuitOutlineClass, getSuitColor, displayCard };
});