const readline = require("readline");
const Piece = require("./piece.js");
const Board = require("./board.js");

/**
 * Sets up the game with a board and the first player to play a turn.
 */
function Game () {
  this.board = new Board();
  this.turn = "black";
}

/**
 * Flips the current turn to the opposite color.
 */
Game.prototype._flipTurn = function () {
  this.turn = (this.turn == "black") ? "white" : "black";
};

// Dreaded global state!
let rlInterface;

/**
 * Creates a readline interface and starts the run loop.
 */
Game.prototype.play = function () {
  rlInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  this.runLoop(function () {
    rlInterface.close();
    rlInterface = null;
  });
};

Game.prototype.ai_play = function () {
  rlInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  this.runAILoop(function () {
    rlInterface.close();
    rlInterface = null;
  });
};


/**
 * Gets the next move from the current player and
 * attempts to make the play.
 */
Game.prototype.playTurn = function (callback) {
  this.board.print();
  rlInterface.question(
    `${this.turn}, where do you want to move?`,
    handleResponse.bind(this)
  );

  function handleResponse(answer) {
    if (!answer.match(/^\[\d\,\d\]$/)) {
      console.log("That doesn't look like a move to me.");
      this.playTurn(callback);
      return;
    }

    const pos = JSON.parse(answer);
    
    if (!this.board.validMove(pos, this.turn)) {
      console.log("Invalid move!");
      this.playTurn(callback);
      return;
    }

    this.board.placePiece(pos, this.turn);
    this._flipTurn();
    callback();
  }
};

Game.prototype.dumbAITurn = function(callback) {
  this.board.print();
  let moves = this.board.validMoves(this.turn);
  let idx = getRandomInt(0, moves.length-1);

  this.board.placePiece(moves[idx], this.turn);
  console.log(`${this.turn} has played to [${moves[idx]}].`);

  this._flipTurn();
  callback();
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Continues game play, switching turns, until the game is over.
 */
Game.prototype.runLoop = function (overCallback) {
  if (this.board.isOver()) {
    console.log("The game is over!");
    overCallback();
  } else if (!this.board.hasMove(this.turn)) {
    console.log(`${this.turn} has no move!`);
    this._flipTurn();
    this.runLoop();
  } else {
    this.playTurn(this.runLoop.bind(this, overCallback));
  }
};

Game.prototype.substituteAI = function (callback) {
  if (this.turn === "black") {
    this.playTurn(callback);
  } else {
    this.dumbAITurn(callback);
  }
};

Game.prototype.runAILoop = function (overCallback) {
  if (this.board.isOver()) {
    console.log("The game is over!");
    this.board.discernWinner();
    overCallback();
  } else if (!this.board.hasMove(this.turn)) {
    console.log(`${this.turn} has no move!`);
    this._flipTurn();
    this.runAILoop();
  } else {
    this.substituteAI(this.runAILoop.bind(this, overCallback));
  }
};

module.exports = Game;