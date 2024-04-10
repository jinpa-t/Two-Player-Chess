/*
-  Author:github @jinpa-t
-  Notation: ++,+,x,=,o-o,o-o-o
-  Supports: Insufficent material, reset, resign, 50 moves draw, Threefold repitition
*/
let TURN = "white";
let GAME_OVER = false;

const VALID_POSITIONS = Array.from({ length: 8 }, (_, i) => {
  return Array.from({ length: 8 }, (_, j) => {
    return String.fromCharCode(97 + j) + (i + 1);
  });
}).flat();

// used for keeping track of number of pieces for both black and white.
const pieces = {
  black: [
    "bP1",
    "bP2",
    "bP3",
    "bP4",
    "bP5",
    "bP6",
    "bP7",
    "bP8",
    "bRb",
    "bKb",
    "bBb",
    "bQ",
    "BK",
    "bBw",
    "bKw",
    "bRw",
  ],
  white: [
    "wRw",
    "wKw",
    "wBw",
    "wQ",
    "WK",
    "wBb",
    "wKb",
    "wRb",
    "wP1",
    "wP2",
    "wP3",
    "wP4",
    "wP5",
    "wP6",
    "wP7",
    "wP8",
  ],
};

// all the default pieces and its position on the board
// and promoted pieces will be added if the pawn is promoted
let currentSetup = {
  wRb: "a1",
  wKw: "b1",
  wBb: "c1",
  wQ: "d1",
  WK: "e1",
  wBw: "f1",
  wKb: "g1",
  wRw: "h1",
  wP1: "a2",
  wP2: "b2",
  wP3: "c2",
  wP4: "d2",
  wP5: "e2",
  wP6: "f2",
  wP7: "g2",
  wP8: "h2",
  bP1: "a7",
  bP2: "b7",
  bP3: "c7",
  bP4: "d7",
  bP5: "e7",
  bP6: "f7",
  bP7: "g7",
  bP8: "h7",
  bRw: "a8",
  bKb: "b8",
  bBw: "c8",
  bQ: "d8",
  BK: "e8",
  bBb: "f8",
  bKw: "g8",
  bRb: "h8",
};
// conditions for castling for both white and black.
let movedPieces = {
  WK: false,
  wRw: false,
  wRb: false,
  BK: false,
  bRw: false,
  bRb: false,
};

// used for counting the number of pieces that got promoted for creating a unique id
// html codes for => Rook, Knight, Bishop, Queen.
let promotedPieceCounter = {
  // promoted white pieces counter for id
  w_R: [0, "&#9814"],
  w_K: [0, "&#9816"],
  w_B: [0, "&#9815"],
  w_Q: [0, "&#9813"],
  // promoted black pieces counter for id
  b_R: [0, "&#9820"],
  b_K: [0, "&#9822"],
  b_B: [0, "&#9821"],
  b_Q: [0, "&#9819"],
};

// get element by id
let $ = function (id) {
  return document.getElementById(id);
};
$("black-turn").style.display = "none";
// end get element

//// play sounds
let playSound = (type) => {
  const audio = new Audio();
  const soundMap = {
    move: "../sounds/move.mp3",
    notify: "../sounds/notify.mp3",
    promote: "../sounds/promote.mp3",
    capture: "../sounds/capture.mp3",
    castle: "../sounds/castle.mp3",
    check: "../sounds/check.mp3",
    gameover: "../sounds/gameOver.mp3",
  };

  audio.src = soundMap[type];
  audio.play();
};
//// end play sounds

// does not check whether the move will stop or result in check.
// just shows all the moves
function addHighlight(piece) {
  const currPos = currentSetup[piece.id];
  const numIndex = Number(currPos[1]);
  const charIndex = currPos.charCodeAt(0);

  function highlightIfEmpty(id) {
    if ($(id).children.length == 0) $(id).classList.add("highlight");
  }

  function addHighlightHelper(x, y) {
    if (x >= 97 && x <= 104 && y >= 1 && y <= 8) {
      const id = String.fromCharCode(x) + y;
      highlightIfEmpty(id);
    }
  }
  ////// Rook and queen
  if (piece.id.match(/^(wR|bR|wQ|bQ)/)) {
    //if ($(String.fromCharCode(charIndex) + i).children != 0) break;
    for (let i = numIndex + 1; i <= 8; i++) {
      if ($(String.fromCharCode(charIndex) + i).children.length != 0) break;
      addHighlightHelper(charIndex, i);
    }
    for (let i = numIndex - 1; i >= 1; i--) {
      if ($(String.fromCharCode(charIndex) + i).children.length != 0) break;
      addHighlightHelper(charIndex, i);
    }
    for (let i = charIndex + 1; i <= 104; i++) {
      if ($(String.fromCharCode(i) + numIndex).children.length != 0) break;
      addHighlightHelper(i, numIndex);
    }
    for (let i = charIndex - 1; i >= 97; i--) {
      if ($(String.fromCharCode(i) + numIndex).children.length != 0) break;
      addHighlightHelper(i, numIndex);
    }
  }
  ////// Bishop and queen
  if (piece.id.match(/^(wB|bB|wQ|bQ)/)) {
    const directions = [
      [1, -1],
      [1, 1],
      [-1, -1],
      [-1, 1],
    ];

    for (const [dx, dy] of directions) {
      let x = charIndex;
      let y = numIndex;
      while (x >= 97 && x <= 104 && y >= 1 && y <= 8) {
        x += dx;
        y += dy;
        const id = String.fromCharCode(x) + y;
        if (x < 97 || x > 104 || y < 1 || y > 8 || $(id).children.length != 0)
          break;
        $(id).classList.add("highlight");
      }
    }
  }
  ///////// Knight
  if (piece.id.match(/^(wK|bK)/)) {
    addHighlightHelper(charIndex - 1, numIndex + 2); // left up
    addHighlightHelper(charIndex - 1, numIndex - 2); // left down
    addHighlightHelper(charIndex + 1, numIndex + 2); // right up
    addHighlightHelper(charIndex + 1, numIndex - 2); // right down
    addHighlightHelper(charIndex - 2, numIndex + 1); // down right
    addHighlightHelper(charIndex - 2, numIndex - 1); // down left
    addHighlightHelper(charIndex + 2, numIndex + 1); // top right
    addHighlightHelper(charIndex + 2, numIndex - 1); // top left
  }
  ////// Black Pawns
  else if (piece.id.includes("bP")) {
    var id = currPos[0] + (numIndex - 1);
    var id2 = currPos[0] + (numIndex - 2);
    highlightIfEmpty(id);
    if (numIndex == 7 && $(id).children.length == 0) {
      highlightIfEmpty(id2);
    }
  }
  ////// White Pawns
  else if (piece.id.includes("wP")) {
    var id = currPos[0] + (numIndex + 1);
    var id2 = currPos[0] + (numIndex + 2);
    highlightIfEmpty(id);
    if (numIndex == 2 && $(id).children.length == 0) {
      highlightIfEmpty(id2);
    }
  }
  ////// King
  else if (piece.id == "BK" || piece.id == "WK") {
    const directions = [-1, 0, 1];
    directions.forEach((dx) => {
      directions.forEach((dy) => {
        if (dx !== 0 || dy !== 0) {
          const newCharIndex = charIndex + dx;
          const newNumIndex = numIndex + dy;
          if (
            newCharIndex >= 97 &&
            newCharIndex <= 104 &&
            newNumIndex >= 1 &&
            newNumIndex <= 8
          ) {
            const id = String.fromCharCode(newCharIndex) + newNumIndex;
            if ($(id).children.length == 0) $(id).classList.add("highlight");
          }
        }
      });
    });
    if (piece.id == "BK" && !movedPieces["BK"]) {
      const castleMoves = [
        {
          dx: 2,
          dy: 0,
          rook: "bRb",
          king: "BK",
          rookPos: "f8",
          emptySquares: ["f8", "g8"],
        },
        {
          dx: -2,
          dy: 0,
          rook: "bRw",
          king: "BK",
          rookPos: "d8",
          emptySquares: ["d8", "c8", "b8"],
        },
      ];
      castleMoves.forEach((move) => {
        if (
          !movedPieces[move.rook] &&
          currentSetup[move.rook] != "x" &&
          move.emptySquares.every((square) => $(square).children.length == 0)
        ) {
          const id = String.fromCharCode(charIndex + move.dx) + numIndex;
          $(id).classList.add("highlight");
        }
      });
    } else if (piece.id == "WK" && !movedPieces["WK"]) {
      const castleMoves = [
        {
          dx: 2,
          dy: 0,
          rook: "wRw",
          king: "WK",
          rookPos: "f1",
          emptySquares: ["f1", "g1"],
        },
        {
          dx: -2,
          dy: 0,
          rook: "wRb",
          king: "WK",
          rookPos: "d1",
          emptySquares: ["d1", "c1", "b1"],
        },
      ];
      castleMoves.forEach((move) => {
        if (
          !movedPieces[move.rook] &&
          currentSetup[move.rook] != "x" &&
          move.emptySquares.every((square) => $(square).children.length == 0)
        ) {
          const id = String.fromCharCode(charIndex + move.dx) + numIndex;
          highlightIfEmpty(id);
        }
      });
    }
  }
}

/* /////////////////////// Remove moves Highlight //////////////////// */
function removeHighlight(piece) {
  if(selected) $(currentSetup[selected.id]).classList.remove("selected");
  VALID_POSITIONS.forEach((id) => {
    $(id).classList.remove("highlight");
  });
}

// If the square is protected by the other king.
function isKingProtectingTheSquare(posId) {
  var currPos = TURN == "white" ? currentSetup["BK"] : currentSetup["WK"];
  var numIndex = Number(currPos[1]);
  var charIndex = currPos.charCodeAt(0);

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      var id = String.fromCharCode(charIndex + i) + (numIndex + j);
      if (id === posId) return true;
    }
  }

  return false;
}

// returns a number of possible moves
// used for cheking if the game is over or stalemate
function getAllPossibleMove() {
  // check all the possible legal moves and see if it can stop the check
  // add it to taotalMoves and return it
  var totalMoves = 0;
  if (TURN == "black") {
    for (const piece of pieces.black) {
      if (currentSetup[piece] == "x") continue;
      ////// Rook and Queen
      if (piece.startsWith("bR") || piece.startsWith("bQ")) {
        const currPos = currentSetup[piece];
        const [file, rank] = currPos;

        // Check horizontally and vertically
        for (let i = -1; i <= 1; i += 2) {
          let tempFile = file.charCodeAt(0) + i;
          let tempPos = String.fromCharCode(tempFile) + rank;

          while (tempFile >= 97 && tempFile <= 104) {
            if (currentSetup[tempPos] == "x") {
              const dummyBoard = { ...currentSetup };
              dummyBoard[piece] = tempPos;
              if (!IsKingInCheck(dummyBoard)) totalMoves++;
            } else if (
              pieces.white.includes(currentSetup[tempPos]) &&
              currentSetup[tempPos] != "WK"
            ) {
              const dummyBoard = { ...currentSetup };
              dummyBoard[piece] = tempPos;
              dummyBoard[currentSetup[tempPos]] = "x";
              if (!IsKingInCheck(dummyBoard)) totalMoves++;
              break;
            } else {
              break;
            }

            tempFile += i;
            tempPos = String.fromCharCode(tempFile) + rank;
          }
        }
      }
      ////// Bishop and Queen
      if (piece.startsWith("bB") || piece.startsWith("bQ")) {
        var currPos = currentSetup[piece];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        // left to downright
        while (charIndex < 104) {
          if (numIndex == 1) break;
          charIndex++;
          numIndex--;
          var id = String.fromCharCode(charIndex) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }
        // left to upright
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex < 104) {
          if (numIndex == 8) break;
          charIndex++;
          numIndex++;
          var id = String.fromCharCode(charIndex) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }
        // right to downleft
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex > 97) {
          if (numIndex == 1) break;
          charIndex--;
          numIndex--;
          var id = String.fromCharCode(charIndex) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }
        //right to upleft
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex > 97) {
          if (numIndex == 8) break;
          charIndex--;
          numIndex++;
          var id = String.fromCharCode(charIndex) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }
      }

      ///////// Knight
      if (piece.startsWith("bK")) {
        var currPos = currentSetup[piece];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        // up left and right
        if (charIndex - 1 >= 97 && numIndex + 2 <= 8) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex + 2);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 1 <= 104 && numIndex + 2 <= 8) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex + 2);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        // down : left and right;
        if (charIndex - 1 >= 97 && numIndex - 2 >= 1) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex - 2);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 1 <= 104 && numIndex - 2 >= 1) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex - 2);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        //left:  up and down
        if (charIndex - 2 >= 97 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex - 2) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex - 2 >= 97 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex - 2) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        //right: up and down
        if (charIndex + 2 <= 104 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex + 2) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 2 <= 104 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex + 2) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
      }
      ////// Black Pawns
      else if (piece.startsWith("bP")) {
        var currPos = currentSetup[piece];
        var numIndex = Number(currPos[1]);

        var id = currPos[0] + (numIndex - 1);
        var id2 = currPos[0] + (numIndex - 2);
        if ($(id).children.length == 0) {
          var dummyBoard = { ...currentSetup };
          dummyBoard[piece] = id;
          if (!IsKingInCheck(dummyBoard)) totalMoves++;
        }
        if (
          $(id).children.length == 0 &&
          numIndex == 7 &&
          $(id2).children.length == 0
        ) {
          var dummyBoard = { ...currentSetup };
          dummyBoard[piece] = id;
          if (!IsKingInCheck(dummyBoard)) totalMoves++;
        }
        // left
        var charIndex = currPos.charCodeAt(0);
        if (charIndex - 1 >= 97) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex - 1);
          var dummyBoard = { ...currentSetup };
          if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        //right
        if (charIndex + 1 <= 104) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex - 1);
          var dummyBoard = { ...currentSetup };
          dummyBoard[piece] = id;
          if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK"
          ) {
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
      }

      ////// King
      else if (piece == "BK") {
        var currPos = currentSetup[piece];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        if (charIndex + 1 <= 104) {
          var id = String.fromCharCode(charIndex + 1) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex - 1 >= 97) {
          var id = String.fromCharCode(charIndex - 1) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 1 <= 104 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 1 <= 104 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex - 1 >= 97 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex - 1 >= 97 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a white piece
          else if (
            $(id).children.length != 0 &&
            pieces.white.includes($(id).children[0].id) &&
            $(id).children[0].id != "WK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        // check if the square is seen by other king
      }
    }
  } else if (TURN == "white") {
    for (const piece of pieces.white) {
      if (currentSetup[piece] == "x") continue;
      ////// Rook and Queen
      if (piece.startsWith("wR") || piece.startsWith("wQ")) {
        var currPos = currentSetup[piece];
        var row = Number(currPos[1]);
        var col = currPos.charCodeAt(0);

        // Check rook movement in all directions
        for (var i = row - 1; i >= 1; i--) {
          var id = String.fromCharCode(col) + i.toString();
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }

        for (var i = row + 1; i <= 8; i++) {
          var id = String.fromCharCode(col) + i.toString();
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }

        for (var i = col - 1; i >= 97; i--) {
          var id = String.fromCharCode(i) + currPos[1];
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }

        for (var i = col + 1; i <= 104; i++) {
          var id = String.fromCharCode(i) + currPos[1];
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }
      }
      ////// Bishop and Queen
      if (piece.startsWith("wB") || piece.startsWith("wQ")) {
        var currPos = currentSetup[piece];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        // left to downright
        while (charIndex < 104) {
          if (numIndex == 1) break;
          charIndex++;
          numIndex--;
          var id = String.fromCharCode(charIndex) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }
        // left to upright
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex < 104) {
          if (numIndex == 8) break;
          charIndex++;
          numIndex++;
          var id = String.fromCharCode(charIndex) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }
        // right to downleft
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex > 97) {
          if (numIndex == 1) break;
          charIndex--;
          numIndex--;
          var id = String.fromCharCode(charIndex) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }
        //right to upleft
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex > 97) {
          if (numIndex == 8) break;
          charIndex--;
          numIndex++;
          var id = String.fromCharCode(charIndex) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
            break;
          } else {
            break;
          }
        }
      }
      ///////// Knight
      if (piece.startsWith("wK")) {
        var currPos = currentSetup[piece];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        // up left and right
        if (charIndex - 1 >= 97 && numIndex + 2 <= 8) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex + 2);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 1 <= 104 && numIndex + 2 <= 8) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex + 2);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        // down : left and right;
        if (charIndex - 1 >= 97 && numIndex - 2 >= 1) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex - 2);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 1 <= 104 && numIndex - 2 >= 1) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex - 2);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        //left:  up and down
        if (charIndex - 2 >= 97 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex - 2) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex - 2 >= 97 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex - 2) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        //right: up and down
        if (charIndex + 2 <= 104 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex + 2) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 2 <= 104 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex + 2) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          } else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[$(id).children[0].id] = "x";
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
      }
      ////// White Pawns
      else if (piece.startsWith("wP")) {
        // check left, up 1 or 2, right, en passant
        var currPos = currentSetup[piece];
        var numIndex = Number(currPos[1]);
        // up 1
        var id = currPos[0] + (numIndex + 1);
        if ($(id).children.length == 0) {
          var dummyBoard = { ...currentSetup };
          dummyBoard[piece] = id;
          if (!IsKingInCheck(dummyBoard)) totalMoves++;
        }
        // up 2
        var id2 = currPos[0] + (numIndex + 2);
        if (
          numIndex == 2 &&
          $(id).children.length == 0 &&
          $(id2).children.length == 0
        ) {
          var dummyBoard = { ...currentSetup };
          dummyBoard[piece] = id;
          if (!IsKingInCheck(dummyBoard)) totalMoves++;
        }
        // left
        var charIndex = currPos.charCodeAt(0);
        if (charIndex - 1 >= 97) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex + 1);
          var dummyBoard = { ...currentSetup };
          if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        //right
        if (charIndex + 1 <= 104) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex + 1);
          var dummyBoard = { ...currentSetup };
          dummyBoard[piece] = id;
          if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK"
          ) {
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        //en passant
      }
      ////// King
      else if (piece == "WK") {
        var currPos = currentSetup[piece];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        if (charIndex + 1 <= 104) {
          var id = String.fromCharCode(charIndex + 1) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex - 1 >= 97) {
          var id = String.fromCharCode(charIndex - 1) + numIndex;
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 1 <= 104 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex + 1 <= 104 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex - 1 >= 97 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex + 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        if (charIndex - 1 >= 97 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex - 1);
          if ($(id).children.length == 0) {
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              totalMoves++;
            }
          } // must be a black piece
          else if (
            $(id).children.length != 0 &&
            pieces.black.includes($(id).children[0].id) &&
            $(id).children[0].id != "BK" &&
            !isKingProtectingTheSquare(id)
          ) {
            // remove the piece, and see, then stop, don't go any further.
            var dummyBoard = { ...currentSetup };
            dummyBoard[piece] = id;
            dummyBoard[$(id).children[0].id] = "x";
            if (!IsKingInCheck(dummyBoard)) totalMoves++;
          }
        }
        // can't castle out of check!
      }
    }
  }

  return totalMoves;
}

// checking if the opponent is giving a check
// also, for checking in the background if the move will stop a incoming check and is a legal move.
function IsKingInCheck(board) {
  if (TURN == "white") {
    // check if there is check from black; and after move
    //  pawns
    var pawns = ["bP1", "bP2", "bP3", "bP4", "bP5", "bP6", "bP7", "bP8"];
    var pos = board["WK"];
    for (var i = 0; i < pawns.length; i++) {
      if (board[pawns[i]] != "x") {
        // check if pawn is still in the game
        var currPos = board[pawns[i]];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        if (charIndex + 1 <= 104) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex - 1);
          if (id == pos) return true;
        }
        if (charIndex - 1 >= 97) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex - 1);
          if (id == pos) return true;
        }
      }
    }
    //  Rook and Queen
    var rook = [];
    rook = rook.concat(
      pieces.black.filter(
        (elem) => elem.startsWith("bR") || elem.startsWith("bQ")
      )
    );
    for (var i = 0; i < rook.length; i++) {
      if (board[rook[i]] != "x") {
        var currPos = board[rook[i]];
        var temp = Number(currPos[1]);
        while (temp >= 1) {
          if (Number(currPos[1]) != temp) {
            var id = currPos[0] + temp.toString();
            if (Object.values(board).includes(id) && id != pos) break;
            if (id == pos) return true;
          }
          temp--;
        }
        var temp2 = Number(currPos[1]);
        while (temp2 <= 8) {
          if (Number(currPos[1]) != temp2) {
            var id = currPos[0] + temp2.toString();
            if (Object.values(board).includes(id) && id != pos) break;
            if (id == pos) return true;
          }
          temp2++;
        }
        var index = currPos.charCodeAt(0);
        while (index >= 97) {
          if (currPos.charCodeAt(0) != index) {
            var id = String.fromCharCode(index) + currPos[1];
            if (Object.values(board).includes(id) && id != pos) break;
            if (id == pos) return true;
          }
          index--;
        }
        var index2 = currPos.charCodeAt(0);
        while (index2 <= 104) {
          if (currPos.charCodeAt(0) != index2) {
            var id = String.fromCharCode(index2) + currPos[1];
            if (Object.values(board).includes(id) && id != pos) break;
            if (id == pos) return true;
          }
          index2++;
        }
      }
    }
    //   knights
    var knights = [];
    knights = knights.concat(
      pieces.black.filter((elem) => elem.startsWith("bK"))
    );
    for (var i = 0; i < knights.length; i++) {
      if (board[knights[i]] != "x") {
        var currPos = board[knights[i]];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        // up left and right
        if (charIndex - 1 >= 97 && numIndex + 2 <= 8) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex + 2);
          if (id == pos) return true;
        }
        if (charIndex + 1 <= 104 && numIndex + 2 <= 8) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex + 2);
          if (id == pos) return true;
        }
        // down : left and right;
        if (charIndex - 1 >= 97 && numIndex - 2 >= 1) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex - 2);
          if (id == pos) return true;
        }
        if (charIndex + 1 <= 104 && numIndex - 2 >= 1) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex - 2);
          if (id == pos) return true;
        }
        //left:  up and down
        if (charIndex - 2 >= 97 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex - 2) + (numIndex + 1);
          if (id == pos) return true;
        }
        if (charIndex - 2 >= 97 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex - 2) + (numIndex - 1);
          if (id == pos) return true;
        }
        //right: up and down
        if (charIndex + 2 <= 104 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex + 2) + (numIndex + 1);
          if (id == pos) return true;
        }
        if (charIndex + 2 <= 104 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex + 2) + (numIndex - 1);
          if (id == pos) return true;
        }
      }
    }
    //  Bishop and Queen
    var bishop = [];
    bishop = bishop.concat(
      pieces.black.filter(
        (elem) => elem.startsWith("bB") || elem.startsWith("bQ")
      )
    );
    for (var i = 0; i < bishop.length; i++) {
      if (board[bishop[i]] != "x") {
        var currPos = board[bishop[i]];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        // left to downright
        while (charIndex < 104) {
          if (numIndex == 1) break;
          charIndex++;
          numIndex--;
          var id = String.fromCharCode(charIndex) + numIndex;
          if (Object.values(board).includes(id) && id != pos) break;
          if (id == pos) return true;
        }
        // left to upright
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex < 104) {
          if (numIndex == 8) break;
          charIndex++;
          numIndex++;
          var id = String.fromCharCode(charIndex) + numIndex;
          if (Object.values(board).includes(id) && id != pos) break;
          if (id == pos) return true;
        }
        // right to downleft
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex > 97) {
          if (numIndex == 1) break;
          charIndex--;
          numIndex--;
          var id = String.fromCharCode(charIndex) + numIndex;
          if (Object.values(board).includes(id) && id != pos) break;
          if (id == pos) return true;
        }
        //right to upleft
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex > 97) {
          if (numIndex == 8) break;
          charIndex--;
          numIndex++;
          var id = String.fromCharCode(charIndex) + numIndex;
          if (Object.values(board).includes(id) && id != pos) break;
          if (id == pos) return true;
        }
      }
    }
  } else if (TURN == "black") {
    // check if there is check from white; and after move
    var pos = board["BK"];
    // pawns
    var pawns = ["wP1", "wP2", "wP3", "wP4", "wP5", "wP6", "wP7", "wP8"];
    for (var i = 0; i < pawns.length; i++) {
      if (board[pawns[i]] != "x") {
        //pawn still in the game
        var currPos = board[pawns[i]];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        if (charIndex + 1 <= 104) {
          var id2 = String.fromCharCode(charIndex + 1) + (numIndex + 1);
          if (id2 == pos) return true;
        }
        if (charIndex - 1 >= 97) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex + 1);
          if (id == pos) return true;
        }
      }
    }
    ////////  Rook and Queen
    var rook = [];
    rook = rook.concat(
      pieces.white.filter(
        (elem) => elem.startsWith("wR") || elem.startsWith("wQ")
      )
    );
    for (var i = 0; i < rook.length; i++) {
      if (board[rook[i]] != "x") {
        var currPos = board[rook[i]];
        var temp = Number(currPos[1]);
        while (temp >= 1) {
          if (Number(currPos[1]) != temp) {
            var id = currPos[0] + temp.toString();
            if (Object.values(board).includes(id) && id != pos) break;
            if (id == pos) return true;
          }
          temp--;
        }
        var temp2 = Number(currPos[1]);
        while (temp2 <= 8) {
          if (Number(currPos[1]) != temp2) {
            var id = currPos[0] + temp2.toString();
            if (Object.values(board).includes(id) && id != pos) break;
            if (id == pos) return true;
          }
          temp2++;
        }
        var index = currPos.charCodeAt(0);
        while (index >= 97) {
          if (currPos.charCodeAt(0) != index) {
            var id = String.fromCharCode(index) + currPos[1];
            if (Object.values(board).includes(id) && id != pos) break;
            if (id == pos) return true;
          }
          index--;
        }
        var index2 = currPos.charCodeAt(0);
        while (index2 <= 104) {
          if (currPos.charCodeAt(0) != index2) {
            var id = String.fromCharCode(index2) + currPos[1];
            if (Object.values(board).includes(id) && id != pos) break;
            if (id == pos) return true;
          }
          index2++;
        }
      }
    }
    //  knights
    var knights = [];
    knights = knights.concat(
      pieces.white.filter((elem) => elem.startsWith("wK"))
    );
    for (var i = 0; i < knights.length; i++) {
      if (board[knights[i]] != "x") {
        var currPos = board[knights[i]];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        // up left and right
        if (charIndex - 1 >= 97 && numIndex + 2 <= 8) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex + 2);
          if (id == pos) return true;
        }
        if (charIndex + 1 <= 104 && numIndex + 2 <= 8) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex + 2);
          if (id == pos) return true;
        }
        // down : left and right;
        if (charIndex - 1 >= 97 && numIndex - 2 >= 1) {
          var id = String.fromCharCode(charIndex - 1) + (numIndex - 2);
          if (id == pos) return true;
        }
        if (charIndex + 1 <= 104 && numIndex - 2 >= 1) {
          var id = String.fromCharCode(charIndex + 1) + (numIndex - 2);
          if (id == pos) return true;
        }
        //left:  up and down
        if (charIndex - 2 >= 97 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex - 2) + (numIndex + 1);
          if (id == pos) return true;
        }
        if (charIndex - 2 >= 97 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex - 2) + (numIndex - 1);
          if (id == pos) return true;
        }
        //right: up and down
        if (charIndex + 2 <= 104 && numIndex + 1 <= 8) {
          var id = String.fromCharCode(charIndex + 2) + (numIndex + 1);
          if (id == pos) return true;
        }
        if (charIndex + 2 <= 104 && numIndex - 1 >= 1) {
          var id = String.fromCharCode(charIndex + 2) + (numIndex - 1);
          if (id == pos) return true;
        }
      }
    }
    //  Bishop and Queen
    var bishop = [];
    bishop = bishop.concat(
      pieces.white.filter(
        (elem) => elem.startsWith("wB") || elem.startsWith("wQ")
      )
    );
    for (var i = 0; i < bishop.length; i++) {
      if (board[bishop[i]] != "x") {
        var currPos = board[bishop[i]];
        var numIndex = Number(currPos[1]);
        var charIndex = currPos.charCodeAt(0);
        // left to downright
        while (charIndex < 104) {
          if (numIndex == 1) break;
          charIndex++;
          numIndex--;
          var id = String.fromCharCode(charIndex) + numIndex;
          if (Object.values(board).includes(id) && id != pos) break;
          if (id == pos) return true;
        }
        // left to upright
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex < 104) {
          if (numIndex == 8) break;
          charIndex++;
          numIndex++;
          var id = String.fromCharCode(charIndex) + numIndex;
          if (Object.values(board).includes(id) && id != pos) break;
          if (id == pos) return true;
        }
        // right to downleft
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex > 97) {
          if (numIndex == 1) break;
          charIndex--;
          numIndex--;
          var id = String.fromCharCode(charIndex) + numIndex;
          if (Object.values(board).includes(id) && id != pos) break;
          if (id == pos) return true;
        }
        //right to upleft
        numIndex = Number(currPos[1]);
        charIndex = currPos.charCodeAt(0);
        while (charIndex > 97) {
          if (numIndex == 8) break;
          charIndex--;
          numIndex++;
          var id = String.fromCharCode(charIndex) + numIndex;
          if (Object.values(board).includes(id) && id != pos) break;
          if (id == pos) return true;
        }
      }
    }
  }

  return false;
}

// notify winner
function displayWinner(winner) {
  const messages = {
    white: "White wins!",
    black: "Black wins!",
    "draw-50": "Game draw! by 50 move rule.",
    "draw-agree": "Game draw! by agreement.",
    "draw-insuf-mate": "Game draw! by insufficient materiel.",
    "draw-threefold-rep": "Game draw! by threefold repetition.",
    stalemate: "Stalemate!",
  };

  $("gameOverNotice").children[0].innerHTML = messages[winner];
  $("gameOverNotice").style.display = "block";
}
// bool: check if the game is over for black or white
function checkIfGameOver() {
  if (TURN == "black" && IsKingInCheck({ ...currentSetup })) {
    // check if check is from white
    // test all the possible moves on the remaining black pieces
    var total = getAllPossibleMove();
    if (total == 0) {
      playSound("gameover");
      GAME_OVER = true;
      displayWinner("white");
      document
        .querySelectorAll(".move:last-child")[0]
        .getElementsByTagName("td")[0].innerHTML += "+";
      //alert("Game over! White win!");
    }
  } else if (TURN == "white" && IsKingInCheck({ ...currentSetup })) {
    // check if check is from black
    // test all the possible moves on the remaining white pieces
    var total = getAllPossibleMove();

    if (total == 0) {
      GAME_OVER = true;
      displayWinner("black");
      document
        .querySelectorAll(".move:last-child")[0]
        .getElementsByTagName("td")[1].innerHTML += "+";
      //alert("Game over! Black win!");
    }
  } else if (
    (TURN == "white" || TURN == "black") &&
    !IsKingInCheck({ ...currentSetup })
  ) {
    // check if check from white
    // test all the possible moves on the remaining black pieces
    var total = getAllPossibleMove();
    if (total == 0) {
      GAME_OVER = true;
      displayWinner("stalemate");
      //alert("Game over! Stalemate!");
    }
  }
  return false;
}

function checkInsufficientMaterial() {
  var bp = [],
    wp = [];
  for (var i = 0; i < pieces.black.length; i++) {
    if (currentSetup[pieces.black[i]] != "x") {
      bp.push(pieces.black[i]);
    }
  }
  for (var i = 0; i < pieces.white.length; i++) {
    if (currentSetup[pieces.white[i]] != "x") {
      wp.push(pieces.white[i]);
    }
  }
  if (bp.length == 1 && wp.length == 1) return true;
  if (bp.length == 2 && wp.length == 1) {
    // knight or bishop and king
    if (wp[0] == "BK" && (wp[1].startsWith("bK") || wp[1].startsWith("bB"))) {
      return true;
    }
    if (wp[1] == "BK" && (wp[0].startsWith("bK") || wp[0].startsWith("bB"))) {
      return true;
    }
  } else if (wp.length == 2 && bp.length == 1) {
    if (wp[0] == "WK" && (wp[1].startsWith("wK") || wp[1].startsWith("wB"))) {
      return true;
    }
    if (wp[1] == "WK" && (wp[0].startsWith("wK") || wp[0].startsWith("wB"))) {
      return true;
    }
  }
  return false;
}

/* /////////////////////// Move Pieces  //////////////////// */
let selected;
let previousBlackMove;
let previousWhiteMove;
let enPassant = false;
let blackCastle = false;
let whiteCastle = false;
let bcRight = false;
let bcLeft = false;
let wcRight = false;
let wcLeft = false;
let promoteBlackPawn = false;
let promoteWhitePawn = false;

// check whether moving a piece will stop the incoming check if there are any
// and can a piece be taken by you without resulting in incoming check.
// called from canMoveTo() returns bool
function canBeTaken(pos) {
  // stop pieces from taking king and same color pieces
  var piece = selected;
  if ($(pos.id).children.length != 0) {
    if ($(pos.id).children[0].id == "BK" || $(pos.id).children[0].id == "WK") {
      return false;
    } else if (pieces.black.includes(pos.children[0].id) && TURN == "black") {
      return false;
    } else if (pieces.white.includes(pos.children[0].id) && TURN == "white") {
      return false;
    }
  }
  ////// Rook
  var dummyBoard = { ...currentSetup };
  if (piece.id.match(/^(wR|bR|wQ|bQ)/)) {
    previousBlackMove = undefined;
    previousWhiteMove = undefined;
    var currPos = currentSetup[piece.id];
    var temp = Number(currPos[1]);
    while (temp >= 1) {
      if (Number(currPos[1]) != temp) {
        var id = currPos[0] + temp.toString();
        if (id != pos.id && $(id).children.length != 0) break;
        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
      }
      temp--;
    }
    dummyBoard = { ...currentSetup };
    var temp2 = Number(currPos[1]);
    while (temp2 <= 8) {
      if (Number(currPos[1]) != temp2) {
        var id = currPos[0] + temp2.toString();
        if (id != pos.id && $(id).children.length != 0) break;
        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
      }
      temp2++;
    }
    dummyBoard = { ...currentSetup };
    var index = currPos.charCodeAt(0);
    while (index >= 97) {
      if (currPos.charCodeAt(0) != index) {
        var id = String.fromCharCode(index) + currPos[1];
        if (id != pos.id && $(id).children.length != 0) break;

        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
      }
      index--;
    }
    dummyBoard = { ...currentSetup };
    var index2 = currPos.charCodeAt(0);
    while (index2 <= 104) {
      if (currPos.charCodeAt(0) != index2) {
        var id = String.fromCharCode(index2) + currPos[1];
        if (id != pos.id && $(id).children.length != 0) break;
        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
      }
      index2++;
    }
  }
  ////// Bishop
  if (piece.id.match(/^(wB|bB|wQ|bQ)/)) {
    previousBlackMove = undefined;
    previousWhiteMove = undefined;
    var currPos = currentSetup[piece.id];
    var numIndex = Number(currPos[1]);
    var charIndex = currPos.charCodeAt(0);
    // left to downright
    dummyBoard = { ...currentSetup };
    while (charIndex < 104) {
      if (numIndex == 1) break;
      charIndex++;
      numIndex--;
      var id = String.fromCharCode(charIndex) + numIndex;
      if (id != pos.id && $(id).children.length != 0) break;
      if (id == pos.id) {
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }

    // left to upright
    dummyBoard = { ...currentSetup };
    numIndex = Number(currPos[1]);
    charIndex = currPos.charCodeAt(0);
    while (charIndex < 104) {
      if (numIndex == 8) break;
      charIndex++;
      numIndex++;
      var id = String.fromCharCode(charIndex) + numIndex;
      if (id != pos.id && $(id).children.length != 0) break;
      if (id == pos.id) {
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }

    // right to downleft
    dummyBoard = { ...currentSetup };
    numIndex = Number(currPos[1]);
    charIndex = currPos.charCodeAt(0);
    while (charIndex > 97) {
      if (numIndex == 1) break;
      charIndex--;
      numIndex--;
      var id = String.fromCharCode(charIndex) + numIndex;
      if (id != pos.id && $(id).children.length != 0) break;
      if (id == pos.id) {
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }

    //right to upleft
    dummyBoard = { ...currentSetup };
    numIndex = Number(currPos[1]);
    charIndex = currPos.charCodeAt(0);
    while (charIndex > 97) {
      if (numIndex == 8) break;
      charIndex--;
      numIndex++;
      var id = String.fromCharCode(charIndex) + numIndex;
      if (id == pos.id) {
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
      if (id != pos.id && $(id).children.length != 0) break;
    }
  }
  ///////// Knight or Horse
  if (piece.id.startsWith("bK") || piece.id.startsWith("wK")) {
    var currPos = currentSetup[piece.id];
    var numIndex = Number(currPos[1]);
    var charIndex = currPos.charCodeAt(0);
    previousBlackMove = undefined;
    previousWhiteMove = undefined;
    // up left and right
    dummyBoard = { ...currentSetup };
    if (charIndex - 1 >= 97 && numIndex + 2 <= 8) {
      var id = String.fromCharCode(charIndex - 1) + (numIndex + 2);
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }
    dummyBoard = { ...currentSetup };
    if (charIndex + 1 <= 104 && numIndex + 2 <= 8) {
      var id = String.fromCharCode(charIndex + 1) + (numIndex + 2);
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }

    // down : left and right;
    dummyBoard = { ...currentSetup };
    if (charIndex - 1 >= 97 && numIndex - 2 >= 1) {
      var id = String.fromCharCode(charIndex - 1) + (numIndex - 2);
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }
    dummyBoard = { ...currentSetup };
    if (charIndex + 1 <= 104 && numIndex - 2 >= 1) {
      var id = String.fromCharCode(charIndex + 1) + (numIndex - 2);
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }

    //left:  up and down
    dummyBoard = { ...currentSetup };
    if (charIndex - 2 >= 97 && numIndex + 1 <= 8) {
      var id = String.fromCharCode(charIndex - 2) + (numIndex + 1);
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }
    dummyBoard = { ...currentSetup };
    if (charIndex - 2 >= 97 && numIndex - 1 >= 1) {
      var id = String.fromCharCode(charIndex - 2) + (numIndex - 1);
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }
    //right: up and down
    dummyBoard = { ...currentSetup };
    if (charIndex + 2 <= 104 && numIndex + 1 <= 8) {
      var id = String.fromCharCode(charIndex + 2) + (numIndex + 1);
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }
    dummyBoard = { ...currentSetup };
    if (charIndex + 2 <= 104 && numIndex - 1 >= 1) {
      var id = String.fromCharCode(charIndex + 2) + (numIndex - 1);
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (pos.children.length != 0) dummyBoard[pos.children[0].id] = "x";
        if (!IsKingInCheck(dummyBoard)) {
          return true;
        }
      }
    }
  }
  ////// Black Pawns
  else if (piece.id.startsWith("bP")) {
    var currPos = currentSetup[piece.id];
    var numIndex = Number(currPos[1]);
    var charIndex = currPos.charCodeAt(0);
    previousBlackMove = undefined;
    if (pos.children.length != 0) {
      dummyBoard = { ...currentSetup };
      if (charIndex + 1 <= 104) {
        var id2 = String.fromCharCode(charIndex + 1) + (numIndex - 1);
        if (id2 == pos.id) {
          dummyBoard[piece.id] = id2;
          dummyBoard[pos.children[0].id] = "x";
          if (numIndex - 1 == 1) promoteBlackPawn = true;
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
      }
      dummyBoard = { ...currentSetup };
      if (charIndex - 1 >= 97) {
        var id = String.fromCharCode(charIndex - 1) + (numIndex - 1);
        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          dummyBoard[pos.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            if (numIndex - 1 == 1) promoteBlackPawn = true;
            return true;
          }
        }
      }
    } else {
      if (numIndex == 7) {
        var id = currPos[0] + (numIndex - 1);
        var id2 = currPos[0] + (numIndex - 2);
        dummyBoard = { ...currentSetup };
        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
        dummyBoard = { ...currentSetup };
        dummyBoard[piece.id] = id2;
        if (
          $(id).children.length == 0 &&
          $(id2).children.length == 0 &&
          id2 == pos.id &&
          !IsKingInCheck(dummyBoard)
        ) {
          previousBlackMove = pos;
          return true;
        }
      } else if (
        numIndex == 4 &&
        previousWhiteMove &&
        previousWhiteMove.nodeType &&
        Number(previousWhiteMove.id[1]) == 4
      ) {
        var id = String.fromCharCode(charIndex - 1) + (numIndex - 1);
        var id2 = previousWhiteMove.id[0] + (numIndex - 1);
        var id3 = String.fromCharCode(charIndex + 1) + (numIndex - 1);
        dummyBoard = { ...currentSetup };
        if (pos.id == id2 && id == pos.id) {
          dummyBoard[piece.id] = id;
          dummyBoard[previousWhiteMove.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            // only set true if the move will not result in check from white
            enPassant = true;
            return true;
          }
        }
        dummyBoard = { ...currentSetup };
        if (id3 == id2 && id2 == pos.id) {
          dummyBoard[piece.id] = id;
          dummyBoard[previousWhiteMove.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            enPassant = true;
            return true;
          }
        }
        //enPassant did not pass check for move forward.
        dummyBoard = { ...currentSetup };
        var id4 = currPos[0] + (numIndex - 1);
        if (id4 == pos.id && pos.children.length == 0) {
          dummyBoard[piece.id] = id4;
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
      } else {
        //promote pawn
        var id = currPos[0] + (numIndex - 1);
        if (numIndex - 1 == 1) {
          dummyBoard = { ...currentSetup };
          dummyBoard[piece.id] = id;
          if (!IsKingInCheck(dummyBoard)) {
            promoteBlackPawn = true;
          }
        }
        dummyBoard = { ...currentSetup };
        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
      }
    }
  }
  ////// White Pawns
  else if (piece.id.startsWith("wP")) {
    var currPos = currentSetup[piece.id];
    var numIndex = Number(currPos[1]);
    var charIndex = currPos.charCodeAt(0);
    previousWhiteMove = undefined;
    if (pos.children.length != 0) {
      dummyBoard = { ...currentSetup };
      if (charIndex + 1 <= 104) {
        var id2 = String.fromCharCode(charIndex + 1) + (numIndex + 1);
        if (id2 == pos.id) {
          dummyBoard[piece.id] = pos.id;
          dummyBoard[pos.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            if (numIndex + 1 == 8) promoteWhitePawn = true;
            return true;
          }
        }
      }
      dummyBoard = { ...currentSetup };
      if (charIndex - 1 >= 97) {
        var id = String.fromCharCode(charIndex - 1) + (numIndex + 1);
        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          dummyBoard[pos.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            if (numIndex + 1 == 8) promoteWhitePawn = true;
            return true;
          }
        }
      }
    } else {
      // empty square
      if (numIndex == 2) {
        var id = currPos[0] + (numIndex + 1);
        var id2 = currPos[0] + (numIndex + 2);
        dummyBoard = { ...currentSetup };
        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
        dummyBoard = { ...currentSetup };
        dummyBoard[piece.id] = id2;
        if (
          $(id).children.length == 0 &&
          $(id2).children.length == 0 &&
          id2 == pos.id &&
          !IsKingInCheck(dummyBoard)
        ) {
          previousWhiteMove = pos;
          return true;
        }
      } else if (
        numIndex == 5 &&
        previousBlackMove &&
        previousBlackMove.nodeType &&
        Number(previousBlackMove.id[1]) == 5
      ) {
        // EnPassant
        var id = String.fromCharCode(charIndex - 1) + (numIndex + 1); //left
        var id2 = previousBlackMove.id[0] + (numIndex + 1);
        var id3 = String.fromCharCode(charIndex + 1) + (numIndex + 1); //right
        dummyBoard = { ...currentSetup };
        if (id == id2 && id == pos.id) {
          dummyBoard[piece.id] = id;
          dummyBoard[previousBlackMove.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            enPassant = true;
            return true;
          }
        }
        dummyBoard = { ...currentSetup };
        if (id3 == id2 && id2 == pos.id) {
          dummyBoard[piece.id] = id;
          dummyBoard[previousBlackMove.children[0].id] = "x";
          if (!IsKingInCheck(dummyBoard)) {
            enPassant = true;
            return true;
          }
        }
        //enPassant did not pass check for move forward.
        dummyBoard = { ...currentSetup };
        var id4 = currPos[0] + (numIndex + 1);
        if (id4 == pos.id && pos.children.length == 0) {
          dummyBoard[piece.id] = id4;
          if (!IsKingInCheck(dummyBoard)) {
            return true;
          }
        }
      } else {
        var id = currPos[0] + (numIndex + 1);
        if (numIndex + 1 == 8) {
          dummyBoard = { ...currentSetup };
          dummyBoard[piece.id] = id;
          if (!IsKingInCheck(dummyBoard)) {
            promoteWhitePawn = true;
          }
        }
        //only move forward.
        dummyBoard = { ...currentSetup };
        if (id == pos.id) {
          dummyBoard[piece.id] = id;
          if (!IsKingInCheck(dummyBoard)) {
            if (numIndex + 1 == 8) promoteWhitePawn = true;
            return true;
          }
        }
      }
    }
  }
  ////// King
  else if (piece.id == "BK" || piece.id == "WK") {
    previousBlackMove = undefined;
    previousWhiteMove = undefined;
    var currPos = currentSetup[piece.id];
    var numIndex = Number(currPos[1]);
    var charIndex = currPos.charCodeAt(0);
    dummyBoard = { ...currentSetup };
    if (charIndex + 1 <= 104) {
      var id = String.fromCharCode(charIndex + 1) + numIndex;
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id))
          return true;
      }
    }
    if (charIndex - 1 >= 97) {
      var id = String.fromCharCode(charIndex - 1) + numIndex;
      dummyBoard = { ...currentSetup };
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id))
          return true;
      }
    }
    if (numIndex + 1 <= 8) {
      var id = String.fromCharCode(charIndex) + (numIndex + 1);
      dummyBoard = { ...currentSetup };
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id))
          return true;
      }
    }
    if (numIndex - 1 >= 1) {
      var id = String.fromCharCode(charIndex) + (numIndex - 1);
      dummyBoard = { ...currentSetup };
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id))
          return true;
      }
    }
    if (charIndex + 1 <= 104 && numIndex + 1 <= 8) {
      var id = String.fromCharCode(charIndex + 1) + (numIndex + 1);
      dummyBoard = { ...currentSetup };
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id))
          return true;
      }
    }
    if (charIndex + 1 <= 104 && numIndex - 1 >= 1) {
      var id = String.fromCharCode(charIndex + 1) + (numIndex - 1);
      dummyBoard = { ...currentSetup };
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id))
          return true;
      }
    }
    if (charIndex - 1 >= 97 && numIndex + 1 <= 8) {
      var id = String.fromCharCode(charIndex - 1) + (numIndex + 1);
      dummyBoard = { ...currentSetup };
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id))
          return true;
      }
    }
    if (charIndex - 1 >= 97 && numIndex - 1 >= 1) {
      var id = String.fromCharCode(charIndex - 1) + (numIndex - 1);
      dummyBoard = { ...currentSetup };
      if (id == pos.id) {
        dummyBoard[piece.id] = id;
        if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id))
          return true;
      }
    }
    // castling check
    if (piece.id == "BK" && !movedPieces["BK"]) {
      if (!movedPieces["bRb"]) {
        if ($("f8").children.length == 0 && $("g8").children.length == 0) {
          var id2 = String.fromCharCode(charIndex + 1) + numIndex;
          dummyBoard = { ...currentSetup };
          dummyBoard[piece.id] = id2;
          if (IsKingInCheck(dummyBoard)) return false;
          var id = String.fromCharCode(charIndex + 2) + numIndex;
          dummyBoard = { ...currentSetup };

          if (id == pos.id) {
            if (IsKingInCheck(dummyBoard)) return false;
            dummyBoard["BK"] = id;
            dummyBoard["bRb"] = "f8";
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              blackCastle = true;
              bcRight = true;
              return true;
            }
          }
        }
      }
      if (!movedPieces["bRw"]) {
        if (
          $("d8").children.length == 0 &&
          $("c8").children.length == 0 &&
          $("b8").children.length == 0
        ) {
          var id2 = String.fromCharCode(charIndex - 1) + numIndex;
          dummyBoard = { ...currentSetup };
          dummyBoard[piece.id] = id2;
          if (IsKingInCheck(dummyBoard)) return false;
          var id = String.fromCharCode(charIndex - 2) + numIndex;
          dummyBoard = { ...currentSetup };
          if (id == pos.id) {
            if (IsKingInCheck(dummyBoard)) return false;
            dummyBoard["BK"] = id;
            dummyBoard["bRw"] = "d8";
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              blackCastle = true;
              bcLeft = true;
              return true;
            }
          }
        }
      }
    } else if (piece.id == "WK" && !movedPieces["WK"]) {
      if (!movedPieces["wRw"]) {
        if ($("f1").children.length == 0 && $("g1").children.length == 0) {
          var id2 = String.fromCharCode(charIndex + 1) + numIndex;
          dummyBoard = { ...currentSetup };
          dummyBoard[piece.id] = id2;
          if (IsKingInCheck(dummyBoard)) return false;
          var id = String.fromCharCode(charIndex + 2) + numIndex;
          dummyBoard = { ...currentSetup };
          if (id == pos.id) {
            if (IsKingInCheck(dummyBoard)) return false;
            dummyBoard["WK"] = id;
            dummyBoard["wRw"] = "f1";
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              whiteCastle = true;
              wcRight = true;
              return true;
            }
          }
        }
      }
      if (!movedPieces["wRb"]) {
        if (
          $("d1").children.length == 0 &&
          $("c1").children.length == 0 &&
          $("b1").children.length == 0
        ) {
          var id2 = String.fromCharCode(charIndex - 1) + numIndex;
          dummyBoard = { ...currentSetup };
          dummyBoard[piece.id] = id2;
          if (IsKingInCheck(dummyBoard)) return false;
          var id = String.fromCharCode(charIndex - 2) + numIndex;
          dummyBoard = { ...currentSetup };
          if (id == pos.id) {
            if (IsKingInCheck(dummyBoard)) return false;
            dummyBoard["WK"] = id;
            dummyBoard["wRb"] = "d1";
            if (!IsKingInCheck(dummyBoard) && !isKingProtectingTheSquare(id)) {
              whiteCastle = true;
              wcLeft = true;
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

/////// check if piece can be taken or move there ////////////
let removePiece = "";
let pieceCaptured = false;

function canMoveTo(elem) {
  // check if the spot is empty && can move there
  if (elem.children.length == 0 && canBeTaken(elem)) {
    if (enPassant == true) {
      if (TURN == "white") {
        currentSetup[previousBlackMove.children[0].id] = "x";
        $("blackTaken").appendChild(previousBlackMove.children[0]);
        previousBlackMove = undefined;
        previousWhiteMove = undefined;
      } else {
        currentSetup[previousWhiteMove.children[0].id] = "x";
        $("whiteTaken").appendChild(previousWhiteMove.children[0]);
        previousBlackMove = undefined;
        previousWhiteMove = undefined;
      }
      enPassant = false;
    }
    if (whiteCastle) {
      if (wcLeft) {
        $("d1").appendChild($("wRb"));
        movedPieces["wRb"] = true;
        currentSetup["wRb"] = "d1";
        removePiece = "O-O-O";
      } else if (wcRight) {
        $("f1").appendChild($("wRw"));
        currentSetup["wRw"] = "f1";
        movedPieces["wRw"] = true;
        removePiece = "O-O";
      }
      whiteCastle = false;
    }
    if (blackCastle) {
      if (bcLeft) {
        $("d8").appendChild($("bRw"));
        currentSetup["bRw"] = "d8";
        movedPieces["bRw"] = true;
        removePiece = "O-O-O";
      } else if (bcRight) {
        $("f8").appendChild($("bRb"));
        currentSetup["bRb"] = "f8";
        movedPieces["bRb"] = true;
        removePiece = "O-O";
      }
      blackCastle = false;
    }
    return true;
  } else if (elem.children.length != 0) {
    if (pieces.white.includes(elem.children[0].id, 0) && TURN == "white") {
      return false;
    } else if (
      pieces.white.includes(elem.children[0].id, 0) &&
      TURN == "black" &&
      canBeTaken(elem)
    ) {
      removePiece = currentSetup[elem.children[0].id];
      currentSetup[elem.children[0].id] = "x";
      $("whiteTaken").appendChild(elem.children[0]);
      console.log("Black takes white piece.");
      pieceCaptured = true;
      return true;
    } else if (
      pieces.black.includes(elem.children[0].id, 0) &&
      TURN == "black"
    ) {
      return false;
    } else if (
      pieces.black.includes(elem.children[0].id, 0) &&
      TURN == "white" &&
      canBeTaken(elem)
    ) {
      removePiece = currentSetup[elem.children[0].id];
      currentSetup[elem.children[0].id] = "x";
      $("blackTaken").appendChild(elem.children[0]);
      console.log("White takes black piece.");
      pieceCaptured = true;
      return true;
    }
  } else {
    console.log("Piece can't be taken");
  }
  return false;
}

let blackKingInCheck = false;
let whiteKingInCheck = false;

let promoteBlackPawnTo;
let promoteWhitePawnTo;

let movesHistory = [0];
let fiftyMoveCounter = 0;

// called when square in chess board is clicked.
function movePiece(elem) {
  if (GAME_OVER) return;
  if (selected && selected.nodeType) {
    if (elem.id == currentSetup[selected.id]) return;
    removeHighlight(selected);
    var prevWKingPos = currentSetup["WK"];
    var prevBKingPos = currentSetup["BK"];
    if (
      pieces.white.includes(selected.id, 0) &&
      TURN == "white" &&
      canMoveTo(elem)
    ) {
      TURN = "black";
      var moveNote = selected.id[1];
      if (selected.id[1] == "P" && pieceCaptured)
        moveNote = currentSetup[selected.id][0];
      $("white-turn").style.display = "none";
      $("black-turn").style.display = "inline-block";
      $(currentSetup[selected.id]).classList.remove("selected");
      if (selected.id == "WK") {
        movedPieces[selected.id] = true;
      }
      if (selected.id == "wRb" || selected.id == "wRw") {
        movedPieces[selected.id] = true;
      }
      // promote pawn
      if (promoteWhitePawn) {
        $("whiteTaken").appendChild(selected);
        promoteWhitePawnTo = elem.id;
        currentSetup[selected.id] = "x";
        $("prompt").style.display = "grid";
        $("whiteChoice").style.display = "block";
        $("blackChoice").style.display = "none";
        promoteWhitePawn = false;
        playSound("promote");
      } else {
        removeHighlight(selected);
        elem.appendChild(selected);
        currentSetup[selected.id] = elem.id;
        if (moveNote == "P" && !pieceCaptured)
          moveNote = currentSetup[selected.id];
        else moveNote = moveNote + elem.id;
        if (!pieceCaptured) playSound("move");
      }
      if (removePiece != "" && removePiece != "O-O-O" && removePiece != "O-O") {
        moveNote = moveNote[0] + "x" + removePiece;
        removePiece = "";
        playSound("capture");
      }

      console.log("Moved WhitePiece");
      if (IsKingInCheck({ ...currentSetup })) {
        $(currentSetup["BK"]).classList.add("danger");
        $(currentSetup["WK"]).classList.remove("danger");
        moveNote = moveNote + "+";
        playSound("check");
      } else {
        $(prevWKingPos).classList.remove("danger");
      }
      if (removePiece == "O-O-O" || removePiece == "O-O") {
        moveNote = removePiece;
        removePiece = "";
        playSound("castle");
      }
      if (selected.id.startsWith("wP") || pieceCaptured) {
        fiftyMoveCounter = 0;
        pieceCaptured = false;
      } else {
        fiftyMoveCounter++;
      }
      var newRow = document
        .getElementById("move-template")
        .content.cloneNode(true);
      newRow.querySelectorAll("td")[0].innerHTML = moveNote;
      document.getElementById("move-history").appendChild(newRow);
      // check for threefold repetition
      let key = Object.keys(currentSetup).map((key) => key + currentSetup[key]);
      movesHistory[key] == undefined
        ? (movesHistory[key] = 1)
        : (movesHistory[key] += 1);
      if (movesHistory[key] == 3) {
        GAME_OVER = true;
        displayWinner("draw-threefold-rep");
      }
    } else if (
      pieces.black.includes(selected.id, 0) &&
      TURN == "black" &&
      canMoveTo(elem)
    ) {
      TURN = "white";
      var moveNote = selected.id[1];
      if (selected.id[1] == "P" && pieceCaptured)
        moveNote = currentSetup[selected.id][0];
      $("black-turn").style.display = "none";
      $("white-turn").style.display = "inline-block";

      $(currentSetup[selected.id]).classList.remove("selected");
      if (selected.id == "BK") {
        movedPieces[selected.id] = true;
      }
      if (selected.id == "bRb" || selected.id == "bRw") {
        movedPieces[selected.id] = true;
      }
      if (promoteBlackPawn) {
        $("whiteTaken").appendChild(selected);
        promoteBlackPawnTo = elem.id;
        currentSetup[selected.id] = "x";
        $("prompt").style.display = "grid";
        $("blackChoice").style.display = "block";
        $("whiteChoice").style.display = "none";
        promoteBlackPawn = false;
        playSound("promote");
      } else {
        elem.appendChild(selected);
        currentSetup[selected.id] = elem.id;
        if (moveNote == "P" && !pieceCaptured)
          moveNote = currentSetup[selected.id];
        else moveNote = moveNote + elem.id;
        if (!pieceCaptured) playSound("move");
      }
      if (removePiece != "" && removePiece != "O-O-O" && removePiece != "O-O") {
        moveNote = moveNote[0] + "x" + removePiece;
        removePiece = "";
        playSound("capture");
      }
      console.log("Moved BlackPiece");
      if (IsKingInCheck({ ...currentSetup })) {
        $(currentSetup["WK"]).classList.add("danger");
        $(currentSetup["BK"]).classList.remove("danger");
        // King in check
        moveNote = moveNote + "+";
        playSound("check");
      } else {
        // King no longer in check
        $(prevBKingPos).classList.remove("danger");
      }
      if (removePiece == "O-O-O" || removePiece == "O-O") {
        moveNote = removePiece;
        removePiece = "";
        playSound("castle");
      }
      if (selected.id.startsWith("bP") || pieceCaptured) {
        fiftyMoveCounter = 0;
        pieceCaptured = false;
      } else {
        fiftyMoveCounter++;
      }
      document.querySelector(".move:last-child td:nth-child(2)").innerHTML =
        moveNote;
      // check for threefold repetition
      let key = Object.keys(currentSetup).map((key) => key + currentSetup[key]);
      movesHistory[key] == undefined
        ? (movesHistory[key] = 1)
        : (movesHistory[key] += 1);
      if (movesHistory[key] == 3) {
        GAME_OVER = true;
        displayWinner("draw-threefold-rep");
      }
    } else {
      console.log("Move failed: ", selected.id, " to ", elem.id);
    }

    // check if game is over after this move
    checkFiftyMoveRule();
    checkIfGameOver();
    if (checkInsufficientMaterial()) {
      GAME_OVER = true;
      displayWinner("draw-insuf-mate");
    }
  }
  // else  console.log("Nothing Selected");
}

// called from click on whitePiece
// function defines the piece to move
function moveWhite(elem) {
  if (GAME_OVER || TURN == "black") return;
  //remove same piece move highlights
  if (selected && selected.nodeType) {
    if (selected.id == elem.id) {
      removeHighlight(selected);
      $(currentSetup[selected.id]).classList.remove("selected");
      selected = undefined;
      return;
    }
  }
  if (TURN == "white") {
    if (selected && selected.nodeType) {
      $(currentSetup[selected.id]).classList.remove("selected");
      removeHighlight(selected);
    }
    selected = elem;
    $(currentSetup[elem.id]).classList.add("selected");
    addHighlight(elem);
  }
}

// called from click on blackPiece
// function defines the piece to move
function moveBlack(elem) {
  if (GAME_OVER || TURN == "white") return;
  //remove same piece move highlights
  if (selected && selected.nodeType) {
    if (selected.id == elem.id) {
      removeHighlight(selected);
      $(currentSetup[selected.id]).classList.remove("selected");
      selected = undefined;
      return;
    }
  }
  if (TURN == "black") {
    if (selected && selected.nodeType) {
      $(currentSetup[selected.id]).classList.remove("selected");
      removeHighlight(selected);
    }
    selected = elem;
    addHighlight(elem);
    $(currentSetup[elem.id]).classList.add("selected");
  }
}

// This function is called after user has selected the choice for promoting a pawn
function promotePawn(selectedPiece) {
  if (selectedPiece.id.match(/^(b_R|b_B|b_K|b_Q)/)) {
    var newPiece = selectedPiece.cloneNode();
    newPiece.setAttribute("onclick", "moveBlack(this)");
    var id =
      selectedPiece.id.replace("_", "") +
      promotedPieceCounter[selectedPiece.id][0];
    promotedPieceCounter[selectedPiece.id][0]++;
    newPiece.setAttribute("id", id);
    newPiece.innerHTML = promotedPieceCounter[selectedPiece.id][1];
    newPiece.classList.remove(selectedPiece.id);
    $(promoteBlackPawnTo).appendChild(newPiece);

    // push the new piece name with positon in the list to the pieces.black
    pieces.black.push(id);
    //push the position in the board
    currentSetup[id] = promoteBlackPawnTo;
    // check if king in check
    if (IsKingInCheck({ ...currentSetup })) {
      $(currentSetup["WK"]).classList.add("danger");
      checkIfGameOver();
    }
    selected = undefined;
    document
      .querySelectorAll(".move:last-child")[0]
      .getElementsByTagName("td")[1].innerHTML += "=";
    document
      .querySelectorAll(".move:last-child")[0]
      .getElementsByTagName("td")[1].innerHTML += id;
  } else if (selectedPiece.id.match(/^(w_R|w_B|w_K|w_Q)/)) {
    var id =
      selectedPiece.id.replace("_", "") +
      promotedPieceCounter[selectedPiece.id][0];
    promotedPieceCounter[selectedPiece.id][0]++;
    var newPiece = selectedPiece.cloneNode();
    newPiece.setAttribute("onclick", "moveWhite(this)");
    newPiece.setAttribute("id", id);
    newPiece.innerHTML = promotedPieceCounter[selectedPiece.id][1];
    newPiece.classList.remove(selectedPiece.id);
    $(promoteWhitePawnTo).appendChild(newPiece);
    // push the new piece name with positon in the list to the pieces.white
    pieces.white.push(id);
    //push the position in the board
    currentSetup[id] = promoteWhitePawnTo;
    if (IsKingInCheck({ ...currentSetup })) {
      $(currentSetup["BK"]).classList.add("danger");
      checkIfGameOver();
    }
    selected = undefined;
    document
      .querySelectorAll(".move:last-child")[0]
      .getElementsByTagName("td")[0].innerHTML += "=";
    document
      .querySelectorAll(".move:last-child")[0]
      .getElementsByTagName("td")[0].innerHTML += id;
  }
  $("prompt").style.display = "none";
}

// 50 move rule: 50 move without capture or pawn move from both players
function checkFiftyMoveRule() {
  if (fiftyMoveCounter == 50) {
    GAME_OVER = true;
    displayWinner("draw");
  }
}

// resign and agree draw between two player
const blackResign = $("black-resign");
const whiteResign = $("white-resign");
const blackDraw = $("black-draw");
const whiteDraw = $("white-draw");
const agreeDraw = $("agree-draw");
const disagreeDraw = $("disagree-draw");
const restartGame = $("restart");

let whiteWantsDraw = false;
let blackWantsDraw = false;

blackResign.onclick = () => {
  if (GAME_OVER) return;
  GAME_OVER = true;
  $("gameOverNotice").style.display = "block";
  $("gameOverNotice").children[0].innerHTML = "Black Player Resigned!";
  alert("Game over! Black Player resigned!");
  playSound("notify");
};

whiteResign.onclick = function () {
  if (GAME_OVER) return;
  GAME_OVER = true;
  $("gameOverNotice").style.display = "block";
  $("gameOverNotice").children[0].innerHTML = "White Player Resigned!";
  alert("Game over! White Player resigned!");
  playSound("notify");
};

blackDraw.onclick = function () {
  if (GAME_OVER) return;
  if (!blackWantsDraw) {
    blackWantsDraw = true;
    playSound("notify");
    // notify other player
    $("draw-notice").style.display = "block";
    $("resigning-player").innerHTML = "Black wants a draw?";
  }
};

whiteDraw.onclick = function () {
  if (GAME_OVER) return;
  if (!whiteWantsDraw) {
    whiteWantsDraw = true;
    playSound("notify");
    // notify other player
    $("draw-notice").style.display = "block";
    $("resigning-player").innerHTML = "White wants to draw?";
  }
};

agreeDraw.onclick = function () {
  if (GAME_OVER) return;
  $("draw-notice").style.display = "none";
  if (whiteWantsDraw || blackWantsDraw) {
    GAME_OVER = true;
    displayWinner("draw-agree");
    //alert("Game drawn by agreement!");
  }
};

disagreeDraw.onclick = function () {
  if (GAME_OVER) return;
  $("draw-notice").style.display = "none";
  whiteWantsDraw = false;
  blackWantsDraw = false;
  alert("Draw request declined.");
};

// -------------- RESET THE GAME --------- //
// alot of variables to rest
restartGame.onclick = function () {
  TURN = "white";
  $("black-turn").style.display = "none";
  $("white-turn").style.display = "inline-block";
  GAME_OVER = false;
  fiftyMoveCounter = 0;
  removeHighlight()
  // reset conditions for castling for both white and black.
  Object.keys(movedPieces).forEach((key) => {
    movedPieces[key] = false;
  });
  // rest to original 16 pieces for both black and white
  pieces.black = pieces.black.slice(0, 16);
  pieces.white = pieces.white.slice(0, 16);

  movesHistory = [];
  // all the default pieces and its position on the board
  // and promoted pieces will be added if the pawn is promoted
  currentSetup = {
    wRb: "a1",
    wKw: "b1",
    wBb: "c1",
    wQ: "d1",
    WK: "e1",
    wBw: "f1",
    wKb: "g1",
    wRw: "h1",

    wP1: "a2",
    wP2: "b2",
    wP3: "c2",
    wP4: "d2",
    wP5: "e2",
    wP6: "f2",
    wP7: "g2",
    wP8: "h2",

    bP1: "a7",
    bP2: "b7",
    bP3: "c7",
    bP4: "d7",
    bP5: "e7",
    bP6: "f7",
    bP7: "g7",
    bP8: "h7",

    bRw: "a8",
    bKb: "b8",
    bBw: "c8",
    bQ: "d8",
    BK: "e8",
    bBb: "f8",
    bKw: "g8",
    bRb: "h8",
  };
  // used for counting the number of pieces that got promoted for creating a unique id
  // html codes for => Rook, Knight, Bishop, Queen.
  Object.keys(promotedPieceCounter).forEach((key) => {
    promotedPieceCounter[key][0] = 0;
  });

  selected = undefined;
  previousBlackMove = undefined;
  previousWhiteMove = undefined;
  enPassant = false;
  blackCastle = false;
  whiteCastle = false;
  bcRight = false;
  bcLeft = false;
  wcRight = false;
  wcLeft = false;
  promoteBlackPawn = false;
  promoteWhitePawn = false;

  removePiece = "";
  pieceCaptured = false;
  blackKingInCheck = false;
  whiteKingInCheck = false;

  promoteBlackPawnTo = undefined;
  promoteWhitePawnTo = undefined;
  $("prompt").style.display = "none";
  $("gameOverNotice").style.display = "none";
  $("draw-notice").style.display = "none";
  whiteWantsDraw = false;
  blackWantsDraw = false;

  //rebuild the board
  //clear the promoted peices if any
  for (var pos of VALID_POSITIONS) {
    if ($(pos).children.length != 0) {
      $(pos).classList.remove(...["select", "highlight", "danger"]);
      $("whiteTaken").appendChild($(pos).children[0]);
    }
  }
  // add pieces
  for (var key in currentSetup) {
    $(currentSetup[key]).appendChild($(key));
  }
  // remove captured pieces
  $("whiteTaken").replaceChildren();
  $("blackTaken").replaceChildren();
  //alert("Resetting game");
  // we are done resetting the game
};
