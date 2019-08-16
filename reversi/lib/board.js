let Piece = require("./piece");

/**
 * Returns a 2D array (8 by 8) with two black pieces at [3, 4] and [4, 3]
 * and two white pieces at [3, 3] and [4, 4]
 */
function _makeGrid () {
  let grid = [];
  for (let i = 0; i < 8; i++) {
    grid.push([null, null, null, null, null, null, null, null]);
  }
  grid[3][4] = new Piece('black');
  grid[4][3] = new Piece('black');
  grid[3][3] = new Piece('white');
  grid[4][4] = new Piece('white');
  return grid;
}

/**
 * Constructs a Board with a starting grid set up.
 */
function Board () {
  this.grid = _makeGrid();
}

Board.DIRS = [
  [ 0,  1], [ 1,  1], [ 1,  0],
  [ 1, -1], [ 0, -1], [-1, -1],
  [-1,  0], [-1,  1]
];

/**
 * Returns the piece at a given [x, y] position,
 * throwing an Error if the position is invalid.
 */
Board.prototype.getPiece = function (pos) {
  if (pos[0] < 0 || pos[0] > 7 || pos[1] < 0 || pos[1] > 7) {
    throw Error("Not valid pos!");
  } else {
    return this.grid[pos[0]][pos[1]];
  }
};

Board.prototype.countPieces = function (color) {
  let count = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (this.isMine([i, j], color)) {
        count += 1;
      }
    }
  }
  return count;
};

Board.prototype.discernWinner = function() {
  let whitecount = this.countPieces('white');
  let blackcount = this.countPieces('black');
  console.log(`White had ${whitecount} pieces.`);
  console.log(`Black had ${blackcount} pieces.`);
  let winner = 'black';
  if (whitecount > blackcount) {
    winner = 'white';
  }
  console.log(`${winner} won!`);
};


/**
 * Checks if there are any valid moves for the given color.
 */
Board.prototype.hasMove = function (color) {
  //isValidMove function needed
  //isOccupied to check if piece already there
  //
  return this.validMoves(color).length > 0;
  
};

/**
 * Checks if the piece at a given position
 * matches a given color.
 */
Board.prototype.isMine = function (pos, color) {
  let piece = this.getPiece(pos);
  if (piece === null) return null;
 
  if (piece.color === color) {
    return true;
  } else {
    return false;
  }
  
};

/**
 * Checks if a given position has a piece on it.
 */
Board.prototype.isOccupied = function (pos) {
  return this.grid[pos[0]][pos[1]] !== null;
};

/**
 * Checks if both the white player and
 * the black player are out of moves.
 */
Board.prototype.isOver = function () {
  return !this.hasMove('white') && !this.hasMove('black');
};

/**
 * Checks if a given position is on the Board.
 */
Board.prototype.isValidPos = function (pos) {
  return !(pos[0] < 0 || pos[0] > 7 || pos[1] < 0 || pos[1] > 7);
};

/**
 * Recursively follows a direction away from a starting position, adding each
 * piece of the opposite color until hitting another piece of the current color.
 * It then returns an array of all pieces between the starting position and
 * ending position.
 *
 * Returns null if it reaches the end of the board before finding another piece
 * of the same color.
 *
 * Returns null if it hits an empty position.
 *
 * Returns null if no pieces of the opposite color are found.
 */
function _positionsToFlip (board, pos, color, dir, piecesToFlip = []) {
  let newpos = addpos(pos, dir);
  let occupancy = board.checkOccupant(newpos, color);
  if (occupancy === 0) {
    return null;
  } else if (occupancy === 1) {
    if (piecesToFlip.length === 0) {
      return null;
    } else {
    return piecesToFlip;}
  } else {
    piecesToFlip.push(newpos);
    return _positionsToFlip(board, newpos, color, dir, piecesToFlip);
  }
}

/**
 * Adds a new piece of the given color to the given position, flipping the
 * color of any pieces that are eligible for flipping.
 *
 * Throws an error if the position represents an invalid move.
 */
Board.prototype.placePiece = function (pos, color) {
  if (!this.validMove(pos, color)) throw Error("Invalid Move");
  this.grid[pos[0]][pos[1]] = new Piece(color);
  Board.DIRS.forEach((dir) => {
    let pieces = _positionsToFlip(this, pos, color, dir, []);
    if (pieces !== null) {
     pieces.forEach((pos) => this.getPiece(pos).flip());
    }
  });
};


/**
 * Prints a string representation of the Board to the console.
 */
Board.prototype.print = function () {
  let lines = [];
  console.log("   0  1  2  3  4  5  6  7 ");
  for (let i = 0; i < 8; i++) {
    let line = ` ${i}`;
    for (let j = 0; j < 8; j++) {
      if (this.grid[i][j] === null) {
        line += " 🌌 ";
      } else {
        line += (" " + this.getPiece([i, j]).toString()+ " ");
      }
    }
    console.log(line);
  }
};

/**
 * Checks that a position is not already occupied and that the color
 * taking the position will result in some pieces of the opposite
 * color being flipped.
 */
Board.prototype.validMove = function (pos, color) {
  if (!this.isValidPos(pos) || this.isOccupied(pos)) return false;
  for (let i = 0; i < Board.DIRS.length; i ++) {
    let dir = Board.DIRS[i];
    if (_positionsToFlip(this, pos, color, dir, [])) {
      return true;
    }
  }
  return false;
};

function addpos(pos1, pos2) {
  return [pos1[0]+pos2[0], pos1[1]+pos2[1]];
}

Board.prototype.checkOccupant = function(pos, color) {
  if (this.isValidPos(pos) && this.isOccupied(pos)) {
    if (!this.isMine(pos, color)) {
      return -1;
    } else if (this.isMine(pos, color)) {
      return 1;
    }
  } else {
    return 0;
  }
};

/**
 * Produces an array of all valid positions on
 * the Board for a given color.
 */
Board.prototype.validMoves = function (color) {
  let moves = [];
  for ( let i = 0; i < 8; i++) {
    for ( let j = 0; j < 8; j++) {
      if (this.validMove([i,j], color)) {
      moves.push([i,j]);
      }
    }
  }

  return moves;
};


module.exports = Board;
