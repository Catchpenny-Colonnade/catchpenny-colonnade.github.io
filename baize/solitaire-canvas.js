(function (){
  window.SolitaireCanvas = function(canvasId,deck,initDraw1Q) {
    let me = this;
    let canvas = document.getElementById(canvasId);
    let canvasState = {};
    let applyAttrs = function(xml,attrs,linkAttrs) {
      Object.entries(attrs).forEach(([k,v]) => {
        xml[1][k] = v;
      })
      if (linkAttrs) {
        return applyAttrs(['a',{href:"#"},xml],linkAttrs);
      } else {
        return xml;
      }
    }
    let redraw = function() {
      let board = [];
      board.push('g');
      let padding = 6;
      let [ cardWidth, cardHeight ] = [57,88];
      let [ width, height ] = [461,614];
      let stepX = cardWidth + padding;
      let boardOffsetY = cardHeight + 2 * padding;
      let stackOffsetY = 4;
      let chainOffsetY = 32;
      let goalOffsetX = padding + 3 * stepX;
      let handOffsetX = padding + cardWidth + padding;
      let cardOffsetX = 22
      board.push(applyAttrs((canvasState.game.canDraw() ? deck.useCardBack() : deck.useEmptyPile()),{x:padding,y:padding}, {onclick:'draw(event)'}));
      let hand = canvasState.game.getHand();
      let discard = canvasState.game.getLastDiscard();
      let handLinkAttrs = { onclick:'selectHand(event)' };
      if (canvasState.from === -1) {
        handLinkAttrs.class = "from";
      }
      if (hand.length > 0) {
        hand.forEach((card,index) => {
          board.push(applyAttrs(deck.useCard(card),{
            x:(handOffsetX + (index * cardOffsetX)),
            y:padding
          }, handLinkAttrs));
        });
      } else if (discard) {
        board.push(applyAttrs(deck.useCard(discard),{x:handOffsetX,y:padding}, handLinkAttrs));
      }
      deck.getSuits().forEach((suit,index) => {
        let rank = deck.getRanks()[canvasState.game.getGoals()[suit]];
        let goalLinkAttrs = { onclick:`selectGoal('${suit}',event)` };
        if (canvasState.from === suit) {
          goalLinkAttrs.class = "from";
        }
        board.push(applyAttrs((rank?deck.useCard(rank+suit):deck.useGhostCard(suit)),{
          x:(goalOffsetX + index * stepX),y:padding
        }, goalLinkAttrs));
      });
      canvasState.game.getBoard().forEach((column, columnIndex) => {
        let x = (padding + (columnIndex * stepX));
        let y = boardOffsetY;
        let onclick = `selectColumn(${columnIndex},event)`;
        let columnLinkAttrs = { onclick };
        if (canvasState.from === columnIndex) {
          columnLinkAttrs.class = "from";
        }
        if (column.stackSize > 0 || column.chain.length > 0) {
          for (let i = 0; i < column.stackSize; i++) {
            board.push(applyAttrs(deck.useCardBack(),{x,y}, {onclick}));
            y += stackOffsetY;
          }
          column.chain.forEach((chainLink) => {
            board.push(applyAttrs(deck.useCard(chainLink),{x,y}, columnLinkAttrs));
            y += chainOffsetY;
          });
        } else {
          board.push(applyAttrs(deck.useEmptyPile(),{x,y}, {onclick}));
        }
      });
      canvas.innerHTML = new jHiccup([
        "svg",
        { width: "100%", height: "200%", viewBox: `0 0 ${ width } ${ height }`,
          preserveAspectRatio:"xMidYMin"},
        board
      ]).toString();
    }
    this.newGame = function(draw1Q) {
      canvasState.game = new Solitaire(draw1Q);
      canvasState.game.initGame();
      redraw();
    }
    this.draw = function() {
      canvasState.game.drawHand();
      redraw();
    }
    let selectOrMove = function(selection) {
      if ((typeof canvasState.from) === "number" || (typeof canvasState.from) === "string") {
        try {
          if (canvasState.from !== selection) {
            canvasState.game.move(canvasState.from,selection);
          }
        } catch (e) {
          console.log(e);
          alert("Illegal Move!")
        } finally {
          delete canvasState.from;
        }
      } else {
        canvasState.from = selection;
      }
      redraw();
      if (canvasState.game.getWinState() === "won") {
        alert("You've won!");
        let newGameQ = confirm("Shall we play again?");
        if (newGameQ) {
          me.newGame(initDraw1Q);
        }
      } else if (canvasState.game.getWinState() === "auto") {
        setTimeout(() => {
          const goalAndChain = canvasState.game.getNextGoalAndChain();
          if (goalAndChain) {
            const { goal, chain } = goalAndChain;
            canvasState.from = chain;
            selectOrMove(goal);
          }
        }, 200);
      }
    }
    this.selectHand = function() {
      selectOrMove(-1);
    }
    this.selectColumn = function(columnIndex) {
      selectOrMove(columnIndex);
    }
    this.selectGoal = function(suit) {
      selectOrMove(suit);
    }
  }
  SolitaireCanvas.init = function(canvasId,deck,initDraw1Q) {
    let solitaireCanvas = new SolitaireCanvas(canvasId,deck,initDraw1Q);
    window.newGame = function(e) {
      if (e) e.preventDefault();
      solitaireCanvas.newGame(initDraw1Q);
    }
    window.draw = function(e) {
      if (e) e.preventDefault();
      solitaireCanvas.draw();
    }
    window.selectHand = function(e) {
      if (e) e.preventDefault();
      solitaireCanvas.selectHand();
    }
    window.selectColumn = function(columnIndex,e) {
      if (e) e.preventDefault();
      solitaireCanvas.selectColumn(columnIndex);
    }
    window.selectGoal = function(suit,e) {
      if (e) e.preventDefault();
      solitaireCanvas.selectGoal(suit);
    }
    solitaireCanvas.newGame(initDraw1Q);
  }
})();