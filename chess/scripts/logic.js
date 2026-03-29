namespace("chess.Logic", {}, () => {
  const pieces = [{
    piece: "king",
    color: "white",
    row: 7,
    col: 4
  }, {
    piece: "queen",
    color: "white",
    row: 7,
    col: 3
  }, {
    piece: "bishop",
    color: "white",
    row: 7,
    col: 2
  }, {
    piece: "bishop",
    color: "white",
    row: 7,
    col: 5
  }, {
    piece: "knight",
    color: "white",
    row: 7,
    col: 1
  }, {
    piece: "knight",
    color: "white",
    row: 7,
    col: 6
  }, {
    piece: "rook",
    color: "white",
    row: 7,
    col: 0
  }, {
    piece: "rook",
    color: "white",
    row: 7,
    col: 7
  }, {
    piece: "pawn",
    color: "white",
    row: 6,
    col: 0
  }, {
    piece: "pawn",
    color: "white",
    row: 6,
    col: 1
  }, {
    piece: "pawn",
    color: "white",
    row: 6,
    col: 2
  }, {
    piece: "pawn",
    color: "white",
    row: 6,
    col: 3
  }, {
    piece: "pawn",
    color: "white",
    row: 6,
    col: 4
  }, {
    piece: "pawn",
    color: "white",
    row: 6,
    col: 5
  }, {
    piece: "pawn",
    color: "white",
    row: 6,
    col: 6
  }, {
    piece: "pawn",
    color: "white",
    row: 6,
    col: 7
  }, {
    piece: "pawn",
    color: "black",
    row: 1,
    col: 0
  }, {
    piece: "pawn",
    color: "black",
    row: 1,
    col: 1
  }, {
    piece: "pawn",
    color: "black",
    row: 1,
    col: 2
  }, {
    piece: "pawn",
    color: "black",
    row: 1,
    col: 3
  }, {
    piece: "pawn",
    color: "black",
    row: 1,
    col: 4
  }, {
    piece: "pawn",
    color: "black",
    row: 1,
    col: 5
  }, {
    piece: "pawn",
    color: "black",
    row: 1,
    col: 6
  }, {
    piece: "pawn",
    color: "black",
    row: 1,
    col: 7
  }, {
    piece: "rook",
    color: "black",
    row: 0,
    col: 0
  }, {
    piece: "rook",
    color: "black",
    row: 0,
    col: 7
  }, {
    piece: "knight",
    color: "black",
    row: 0,
    col: 1
  }, {
    piece: "knight",
    color: "black",
    row: 0,
    col: 6
  }, {
    piece: "bishop",
    color: "black",
    row: 0,
    col: 2
  }, {
    piece: "bishop",
    color: "black",
    row: 0,
    col: 5
  }, {
    piece: "queen",
    color: "black",
    row: 0,
    col: 3
  }, {
    piece: "king",
    color: "black",
    row: 0,
    col: 4
  }];
  const copyBoard = function (pieces) {
    return pieces.map(piece => Object.entries(piece).reduce((m, [k, v]) => {
      m[k] = v;
      return m;
    }, {}));
  }
  const setupBoard = function () {
    return copyBoard(pieces);
  }
  const getValidMoves = function (pieces, piece, history) {
    const moves = [];
    const { row, col, piece: pieceType, color } = piece;

    const isLegalSquare = (r, c) => {
      if (r < 0 || r > 7 || c < 0 || c > 7) return false;
      const occupant = pieces.find(p => p.row === r && p.col === c);
      return !occupant || occupant.color !== color;
    };

    const isEmpty = (r, c) => !pieces.find(p => p.row === r && p.col === c);

    const addDirectionalMoves = (directions) => {
      directions.forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i;
          const newCol = col + dc * i;
          if (!isLegalSquare(newRow, newCol)) break;
          moves.push([newRow, newCol]);
          if (!isEmpty(newRow, newCol)) break;
        }
      });
    };

    switch (pieceType) {
      case "pawn":
        const direction = color === "white" ? -1 : 1;
        const startRow = color === "white" ? 6 : 1;
        const nextRow = row + direction;

        if (nextRow >= 0 && nextRow < 8 && isEmpty(nextRow, col)) {
          moves.push([nextRow, col]);
          if (row === startRow && isEmpty(nextRow + direction, col)) {
            moves.push([nextRow + direction, col]);
          }
        }

        for (let newCol of [col - 1, col + 1]) {
          if (nextRow >= 0 && nextRow < 8 && newCol >= 0 && newCol < 8) {
            const occupant = pieces.find(p => p.row === nextRow && p.col === newCol);
            if (occupant && occupant.color !== color) {
              moves.push([nextRow, newCol]);
            }
          }
        }
        
        if (history && history.length > 0) {
          const lastMove = history[history.length - 1];
          const opponent = color === "white" ? "black" : "white";
          if (lastMove.color === opponent && lastMove.piece === "pawn" &&
              Math.abs(lastMove.to.row - lastMove.from.row) === 2) {
            const capturedPawnRow = lastMove.from.row;
            const capturedPawnCol = lastMove.to.col;
            if (row === capturedPawnRow && Math.abs(col - capturedPawnCol) === 1) {
              moves.push([nextRow, capturedPawnCol]);
            }
          }
        }
        break;

      case "rook":
        addDirectionalMoves([[0, 1], [0, -1], [1, 0], [-1, 0]]);
        break;

      case "knight":
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightMoves.forEach(([dr, dc]) => {
          const newRow = row + dr;
          const newCol = col + dc;
          if (isLegalSquare(newRow, newCol)) {
            moves.push([newRow, newCol]);
          }
        });
        break;

      case "bishop":
        addDirectionalMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
        break;

      case "queen":
        addDirectionalMoves([
          [0, 1], [0, -1], [1, 0], [-1, 0],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ]);
        break;

      case "king":
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const newRow = row + dr;
            const newCol = col + dc;
            if (isLegalSquare(newRow, newCol)) {
              moves.push([newRow, newCol]);
            }
          }
        }
        
        if (history) {
          const kingMoved = history.some(m => m.color === color && m.piece === "king");
          if (!kingMoved) {
            if (isEmpty(row, 5) && isEmpty(row, 6)) {
              const kingsideRook = pieces.find(p => p.piece === "rook" && p.color === color && p.col === 7 && p.row === row);
              const rookMoved = history.some(m => m.color === color && m.piece === "rook" && m.from.col === 7);
              if (kingsideRook && !rookMoved) {
                moves.push([row, 6]);
              }
            }
            if (isEmpty(row, 3) && isEmpty(row, 2) && isEmpty(row, 1)) {
              const queensideRook = pieces.find(p => p.piece === "rook" && p.color === color && p.col === 0 && p.row === row);
              const rookMoved = history.some(m => m.color === color && m.piece === "rook" && m.from.col === 0);
              if (queensideRook && !rookMoved) {
                moves.push([row, 2]);
              }
            }
          }
        }
        break;
    }

    return moves;
  };
  const chars = "abcdefgh";
  const isSquareUnderAttack = function(pieces, targetRow, targetCol, byColor, history) {
    for (let attacker of pieces) {
      if (attacker.color !== byColor) continue;
      const moves = getValidMoves(pieces, attacker, history);
      if (moves.some(([r, c]) => r === targetRow && c === targetCol)) {
        return true;
      }
    }
    return false;
  };
  const validatePiece = function (player, pieces, endgameState, row, col) {
    const piece = pieces.find(p => p.row === row && p.col === col);
    if (!piece) {
      return { error: `No piece at ${chars.charAt(col)}${8 - row}` };
    }
    if (piece.color !== player) {
      return { error: `The piece at ${chars.charAt(col)}${8 - row} is ${piece.color}` };
    }
    return { selectedPiece: piece };
  }
  const checkEndgameState = function(player, pieces, history) {
    const opponent = player === "white" ? "black" : "white";
    const king = pieces.find(p => p.piece === "king" && p.color === player);
    const isInCheck = isSquareUnderAttack(pieces, king.row, king.col, opponent, history);
    
    let hasValidMove = false;
    for (let piece of pieces) {
      if (piece.color !== player) continue;
      const validMoves = getValidMoves(pieces, piece, history);
      for (let [toRow, toCol] of validMoves) {
        const testPieces = copyBoard(pieces);
        const testPiece = testPieces.find(p => p.row === piece.row && p.col === piece.col);
        const captured = testPieces.findIndex(p => p.row === toRow && p.col === toCol);
        if (captured !== -1) testPieces.splice(captured, 1);
        testPiece.row = toRow;
        testPiece.col = toCol;
        const testKing = testPieces.find(p => p.piece === "king" && p.color === player);
        if (!isSquareUnderAttack(testPieces, testKing.row, testKing.col, opponent, history)) {
          hasValidMove = true;
          break;
        }
      }
      if (hasValidMove) break;
    }
    
    if (isInCheck && !hasValidMove) {
      return "CheckMate";
    } else if (!isInCheck && !hasValidMove) {
      return "StaleMate";
    } else if (isInCheck) {
      return "Check";
    }
    return undefined;
  }
  const validateMove = function (pieces, endgameState, history, piece, row, col) {
    const validMoves = getValidMoves(pieces, piece, history);
    const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

    if (!isValidMove) {
      return { error: `The ${piece.color} ${piece.piece} at ${chars.charAt(piece.col)}${8 - piece.row} cannot move to ${chars.charAt(col)}${8 - row}` };
    }

    const updatedPieces = copyBoard(pieces);
    const movingPiece = updatedPieces.find(p => p.row === piece.row && p.col === piece.col);
    const move = {
      color: movingPiece.color,
      piece: movingPiece.piece,
      from: {
        row: movingPiece.row,
        col: movingPiece.col
      },
      to: { row, col }
    };
    
    const capturedIndex = updatedPieces.findIndex(p => p.row === row && p.col === col);
    if (capturedIndex !== -1) {
      move.captured = updatedPieces[capturedIndex];
      updatedPieces.splice(capturedIndex, 1);
    }

    if (movingPiece.piece === "king") {
      if (Math.abs(col - movingPiece.col) === 2) {
        move.castling = true;
        if (col === 6) {
          const rook = updatedPieces.find(p => p.piece === "rook" && p.color === movingPiece.color && p.col === 7);
          if (rook) {
            rook.col = 5;
          }
        } else if (col === 2) {
          const rook = updatedPieces.find(p => p.piece === "rook" && p.color === movingPiece.color && p.col === 0);
          if (rook) {
            rook.col = 3;
          }
        }
      }
    }
    
    if (movingPiece.piece === "pawn" && Math.abs(col - movingPiece.col) === 1 && capturedIndex === -1) {
      const capturedPawn = updatedPieces.find(p => p.piece === "pawn" && p.color !== movingPiece.color && p.row === movingPiece.row && p.col === col);
      if (capturedPawn) {
        move.captured = capturedPawn;
        updatedPieces.splice(updatedPieces.indexOf(capturedPawn), 1);
      }
    }

    movingPiece.row = row;
    movingPiece.col = col;

    // Check if the move would leave the player's king in check
    const opponent = movingPiece.color === "white" ? "black" : "white";
    const king = updatedPieces.find(p => p.piece === "king" && p.color === movingPiece.color);
    if (isSquareUnderAttack(updatedPieces, king.row, king.col, opponent, history)) {
      return { error: `The ${piece.color} ${piece.piece} cannot move to ${chars.charAt(col)}${8 - row} because it would leave the king in check` };
    }

    // Detect if current move results in a promotable pawn
    if (movingPiece.piece === "pawn" && ((movingPiece.color === "white" && row === 0) || (movingPiece.color === "black" && row === 7))) {
      return { promotionPending: move, pieces: updatedPieces };
    }

    history.push(move);

    return { pieces: updatedPieces, endgameState: checkEndgameState(movingPiece.color, updatedPieces, history), history };
  }
  const promotePawn = function(pieces, history, move, pieceType) {
    // Find the pawn at the destination and update it to the promoted piece type
    const promotedPawn = pieces.find(p => p.row === move.to.row && p.col === move.to.col);
    if (!promotedPawn) {
      throw new Error(`pawn to promote not found at ${chars.charAt(move.to.col)}${8-move.to.row}`);
    }
    promotedPawn.piece = pieceType;
    
    // Record the promotion in the move
    move.pawnPromotedTo = pieceType;
    
    // Add the completed move to history
    history.push(move);
    
    // Check for endgame state
    const endgameState = checkEndgameState(move.color === "white" ? "black" : "white", pieces, history);
    
    return { pieces, history, endgameState };
  }
  return { setupBoard, validateMove, validatePiece };
});