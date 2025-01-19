(function(){
    let suits = { "C": "black", "D": "red", "H": "red", "S": "black" };
    let ranks = [ "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K" ];
    let oppositeColors = { "black": "red", "red": "black" };
    let splitCard = function(card) {
        if (card) {
            let lastIndex = card.length-1
            let suit = card.charAt(lastIndex);
            return [ranks.indexOf(card.slice(0,lastIndex)),suit];
        }
    }
    let buildCard = function(rank,suit) {
        return `${rank}${suit}`;
    }
    let buildDeck = function() {
        return Object.keys(suits).reduce((out,suit) => {
            return ranks.reduce((acc,rank) => {
                return acc.concat([buildCard(rank,suit)]);
            },out);
        },[]);
    }
    let shuffle = function(deck) {
        deck = Array.from(deck);
        let out = [];
        while(deck.length > 0) {
            let index = Math.floor(Math.random() * deck.length);
            out.push(deck[index]);
            deck.splice(index,1);
        }
        return out;
    }
    window.Solitaire = function(draw1Q) {
        let gameState = { drawCount:(draw1Q ? 1 : 3) };
        this.initGame = function() {
            gameState.drawPile = shuffle(buildDeck());
            gameState.board = "?".repeat(7).split("").map(() => { return {stack:[], chain: []}; });
            for(let r = 0; r<7; r++){
                for(let c = r; c<7; c++){
                    gameState.board[c].stack.push(gameState.drawPile.shift());
                }
            }
            gameState.board.forEach((col) => {
                col.chain.push(col.stack.pop())
            });
            gameState.discard = [];
            gameState.hand = [];
            gameState.goals = Object.keys(suits).reduce((out,suit) => {
                out[suit] = -1;
                return out;
            }, {});
            gameState.winState = "Playing";
        };
        let getFromToType = function(moveIndex,allowHand) {
            if ((typeof moveIndex) === "string" && (typeof gameState.goals[moveIndex]) === 'number') {
                return "goals";
            } else if ((typeof moveIndex) === "number") {
                if (gameState.board[moveIndex]) {
                    return "chain";
                } else if (moveIndex === -1 && allowHand) {
                    return "hand";
                }
            }
            throw { moveIndex };
        }
        let getMoveType = function(fromType,toType) {
            if (fromType === toType) {
                if (fromType === "goals") {
                    throw { fromType, toType };
                } else {
                    return "chain";
                }
            }
            return "single";
        }
        let peek = {
            chain:function(columnIndex) {
                let chain = gameState.board[columnIndex].chain;
                return splitCard(chain[chain.length - 1]);
            },
            hand:function() {
                if (gameState.hand.length > 0) {
                    return splitCard(gameState.hand[gameState.hand.length - 1]);
                } else if (gameState.discard.length > 0) {
                    return splitCard(gameState.discard[gameState.discard.length - 1]);
                } else {
                    throw { empty: true };
                }
            },
            goals:function(suit) {
                return [gameState.goals[suit], suit];
            },
        };
        let isValidMove = {
            chain:function([fromRankIndex,fromSuit],toCard) {
                if (toCard) {
                    let [toRankIndex,toSuit] = toCard;
                    return fromRankIndex + 1 === toRankIndex && suits[fromSuit] === oppositeColors[suits[toSuit]];
                } else {
                    return ranks[fromRankIndex] === 'K';
                }
            },
            goals:function([fromRankIndex,fromSuit],[toRankIndex,toSuit]) {
                return fromSuit === toSuit && fromRankIndex === 1 + toRankIndex;
            }
        };
        let push = {
            chain:function([rankIndex, suit], columnIndex) {
                gameState.board[columnIndex].chain.push(buildCard(ranks[rankIndex],suit));
            },
            goals:function(card, suit) {
                gameState.goals[suit]++;
            }
        };
        let pop = {
            chain:function(columnIndex) {
                gameState.board[columnIndex].chain.pop();
            },
            hand:function() {
                if (gameState.hand.length > 0) {
                    gameState.hand.pop();
                } else if (gameState.discard.length > 0) {
                    gameState.discard.pop();
                } else {
                    throw { empty: true };
                }
            },
            goals:function(suit) {
                gameState.goals[suit]--;
            }
        };
        let drawForChain = function(index) {
            let column = gameState.board[index];
            if (column.chain.length === 0 && column.stack.length > 0) {
                column.chain.push(column.stack.pop());
            }
        }
        let updateWinState = function() {
            if (Object.values(gameState.goals).filter((i) => (i !== 12)).length === 0) {
                gameState.winState = "won";
            } else if (gameState.board.filter(col => col.stack.length > 0).length === 0 && ['drawPile','discard','hand'].reduce((out,obj) => out && gameState[obj].length === 0 , true)) {
                gameState.winState = "auto";
            }
        }
        let getNextGoalAndChain = function() {
          let indexes = gameState.board.map((column,index) => {
            return { column, index };
          }).filter(({ column }) => {
            let lastCard = column.chain[column.chain.length - 1];
            if (lastCard) {
                let [rank, suit] = splitCard(lastCard);
                return rank - 1 === gameState.goals[suit];
            }
          }).map(({ index }) => index);
          if (indexes.length > 0) {
            let chain = indexes[0];
            let column = gameState.board[chain];
            let lastCard = column.chain[column.chain.length - 1];
            let [_, goal] = splitCard(lastCard);
            return { goal, chain };
          }
        }
        this.move = function(from,to) {
            let fromType = getFromToType(from,true);
            let toType = getFromToType(to);
            let moveType = getMoveType(fromType,toType);
            let toCard = peek[toType](to);
            switch(moveType) {
                case "chain":
                    let fromChain = gameState.board[from].chain;
                    let chainIndex = fromChain.length - 1;
                    while(!isValidMove.chain(splitCard(fromChain[chainIndex]),toCard)) {
                        chainIndex--;
                    }
                    if (chainIndex < 0) {
                        throw { chainIndex };
                    }
                    let moveCount = fromChain.length - chainIndex;
                    gameState.board[to].chain = gameState.board[to].chain.concat(gameState.board[from].chain.splice(chainIndex,moveCount));
                    break;
                default:
                    let fromCard = peek[fromType](from);
                    if (isValidMove[toType](fromCard,toCard)) {
                        pop[fromType](from);
                        push[toType](fromCard, to);
                    } else {
                        throw {fromCard,toCard,toType}
                    }
            }
            if (fromType === "chain") {
                drawForChain(from);
            }
            updateWinState();
        };
        this.drawHand = function() {
            if (gameState.drawPile.length === 0) {
                gameState.drawPile = gameState.discard.concat(gameState.hand);
                gameState.discard = [];
                gameState.hand = [];
            }
            let drawCount = Math.min(gameState.drawCount,gameState.drawPile.length);
            gameState.discard = gameState.discard.concat(gameState.hand);
            gameState.hand = gameState.drawPile.splice(0,drawCount);
        };
        this.canDraw = function() {
            return gameState.drawPile.length > 0;
        }
        this.getHand = function() {
            return Array.from(gameState.hand);
        };
        this.getLastDiscard = function() {
            return gameState.discard[gameState.discard.length - 1];
        };
        this.getGoals = function() {
            return Object.entries(gameState.goals).reduce((out,[k,v]) => {
                out[k] = v;
                return out;
            }, {});
        }
        this.getBoard = function() {
            return gameState.board.map((col) => {
                return {
                    chain:Array.from(col.chain),
                    stackSize:col.stack.length
                };
            });
        };
        this.getWinState = function() {
            return gameState.winState;
        };
        this.getNextGoalAndChain = getNextGoalAndChain;
    };
})();