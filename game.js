function generateBoard() {
   var board = document.getElementById("board");
   var isWhite = true;
   var labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
   var pieceSequence = ["R", "H", "B", "Q", "K", "B", "H", "R"];
   var piecesData = [];
   for (var i = 0; i < 8; i++) {
      piecesData.push({
         "color": "b",
         "piece": pieceSequence[i],
         "row": 0,
         "column": i
      });
      piecesData.push({
         "color": "b",
         "piece": "P",
         "row": 1,
         "column": i
      });
      piecesData.push({
         "color": "w",
         "piece": pieceSequence[i],
         "row": 7,
         "column": i
      });
      piecesData.push({
         "color": "w",
         "piece": "P",
         "row": 6,
         "column": i
      });
   }

   for (var row = 0; row < 8; row++) {
      var rowDiv = document.createElement("div");
      rowDiv.className = "row";

      for (var col = 0; col < 8; col++) {
         var square = document.createElement("div");
         square.className = "square " + (isWhite ? "white" : "black");
         square.innerText = labels[col] + (8 - row);
         square.dataset.row = row;
         square.dataset.col = col;
			square.dataset.moveInfo = null;

         for (var i = 0; i < piecesData.length; i++) {
            if (row === piecesData[i]["row"] && col === piecesData[i]["column"]) {
               var piece = createPiece(piecesData[i]["piece"], piecesData[i]["color"]);
               square.appendChild(piece);
            }
         }
         rowDiv.appendChild(square);
         isWhite = !isWhite;
      }
      board.appendChild(rowDiv);
      isWhite = !isWhite;
   }
}


var selectedPiece = null;
var moves = null;
var pawnSelection = 0;
var turnColor = "w";

function movePiece(square) {
	if (square.querySelector(".piece") && !selectedPiece){
		if (square.querySelector(".piece").dataset.color !== turnColor) return; 
	}
	if (pawnSelection === 1){
		pawnSelection = 0;
		return;
	}
	if (pawnSelection === 2) return;
	
   if (selectedPiece) {
      if (selectedPiece === square) {
         selectedPiece = null;
      } else  {
         if (isValidMove(selectedPiece.parentElement, square)) {
				var fromSquare = selectedPiece.parentElement;
				var pieceSquareGoOn = square.querySelector(".piece");
            if (square.querySelector(".piece")) {
               square.querySelector(".piece").remove(); // Remove the existing piece
            }
            if (square.dataset.moveInfo) {
               if (square.dataset.moveInfo === "en passent") {
                  var targetRow = parseInt(square.dataset.row);
                  var targetCol = parseInt(square.dataset.col);
                  var shiftField = 1;
                  var color = getPieceInfo(selectedPiece.parentElement)["color"];
                  if (color === "b") {
                     shiftField = -1;
                  }
                  var pawnSquare = getSquare(targetRow + shiftField, targetCol);
                  if (pawnSquare.querySelector(".piece")) {
                     pawnSquare.querySelector(".piece").remove(); // Remove the other pawn
                  }
               }


					if (square.dataset.moveInfo === "right castle"){
						getSquare(square.dataset.row, 5).appendChild(createPiece("R", getPieceInfo(selectedPiece.parentElement)["color"]));
						getSquare(square.dataset.row, 6).appendChild(selectedPiece);
						removeMarkers();
						selectedPiece = null;
						getSquare(square.dataset.row, 7).querySelector(".piece").remove();
						getSquare(square.dataset.row, 4).querySelector(".piece").remove();
						turnColor = (turnColor === "w") ? "b" : "w";
						return;
					}
					if (square.dataset.moveInfo === "left castle"){
						getSquare(square.dataset.row, 3).appendChild(createPiece("R", getPieceInfo(selectedPiece.parentElement)["color"]));
						getSquare(square.dataset.row, 2).appendChild(selectedPiece);
						removeMarkers();
						selectedPiece = null;
						getSquare(square.dataset.row, 0).querySelector(".piece").remove();
						getSquare(square.dataset.row, 4).querySelector(".piece").remove();
						turnColor = (turnColor === "w") ? "b" : "w";
						return;
					}
            }
				turnColor = (turnColor === "w") ? "b" : "w";
				selectedPiece.dataset.moved = true;
            square.appendChild(selectedPiece);
				var piece = getPieceInfo(square);
				if (piece.piece === "P" && (parseInt(square.dataset.row) === 0 || parseInt(square.dataset.row) === 7) ){
					// code for selecting a piece
					promotePawn(square, fromSquare, pieceSquareGoOn);
					//pawnSelection = 1;
         		selectedPiece = null;
         		removeMarkers();
					return;
				}
            moves = [{
               "row": parseInt(square.dataset.row),
               "col": parseInt(square.dataset.col),
               "fromRow": fromSquare.dataset.row,
               "fromCol": fromSquare.dataset.col,
               "piece": getPieceInfo(square)["piece"]
            }];
         } else {
				if (square.querySelector(".piece") !== selectedPiece){
					selectedPiece = square.querySelector(".piece");
      			showMarkers(square);
					return;
				
				}
         }
         selectedPiece = null;
         removeMarkers();
      }
   } else {
       selectedPiece = square.querySelector(".piece");
      showMarkers(square);
   }
}


function promotePawn(square, fromSquare, pieceSquareGoOn) {
	pawnSelection = 2;
    var piece = square.querySelector(".piece");
        var color = getPieceInfo(square)["color"];
        var row = parseInt(square.dataset.row);
         
            // Positioniere die Figuren um den Bauern
            var wrapper = document.createElement("div");
            wrapper.className = "piece-selection";
				
				var promoteData = ["Q", "H", "B", "R", "X"];
				var promotePieces = [];
				for(var i = 0; i< promoteData.length; i++){
					if (promoteData[i]=== "X"){
						var closeButton = document.createElement("div");
    					closeButton.className = "piece";
    					closeButton.dataset.color = "none";
    					closeButton.dataset.piece = "closeButton";
	 					closeButton.style.background = "white";
    					var pieceImg = document.createElement("img");
    					pieceImg.src = "assets/close.png";
    					closeButton.appendChild(pieceImg);
						promotePieces.push(closeButton);
					} else {
						promotePieces.push(createPiece(promoteData[i], color));
					}
					var shiftValue = 1;
					if (color === "b") shiftValue = -1;
					promotePieces[i].style.top  = (i * 70 * shiftValue) + "px";
					promotePieces[i].style.zIndex = "1";
					promotePieces[i].style.background = "white";
					wrapper.appendChild(promotePieces[i]);
				}
   
				square.appendChild(wrapper);

            

            // Füge den Klick-Event für die Figurenauswahl hinzu
            var pieces = wrapper.querySelectorAll(".piece");
            pieces.forEach(function(piece) {
                piece.onclick = function() {
                    var selectedPieceType = this.dataset.piece;
                    piece.querySelector("img").src = "assets/" + color + selectedPieceType + ".png";
                    piece.dataset.piece = selectedPieceType;

                    // Entferne die anderen Figuren
                    pieces.forEach(function(otherPiece) {
                        if (otherPiece !== piece) {
                            otherPiece.remove();
                        }
                    });
							pawnSelection = 1;
							if (selectedPieceType === "closeButton"){
								wrapper.remove();
								piece.remove();
								fromSquare.appendChild(createPiece("P", color));
								square.appendChild(pieceSquareGoOn);
								turnColor = (turnColor === "w") ? "b" : "w";
								return;
							}
                    // Erzeuge das ausgewählte Piece auf dem Feld des Bauerns
                    var selectedPiece = createPiece(selectedPieceType, color);
							selectedPiece.style.background = "transparent";
                    square.appendChild(selectedPiece);

                    // Entferne den Wrapper für die Figurenauswahl
                    wrapper.remove();
                };
            });

            // Entferne den Bauer
            piece.remove();
				return;
}

function createPiece(pieceType, color) {
    var piece = document.createElement("div");
    piece.className = "piece";
    piece.dataset.color = color;
    piece.dataset.piece = pieceType;
    piece.dataset.moved = false; // Add the "moved" attribute and set it to false initially
    var pieceImg = document.createElement("img");
    pieceImg.src = "assets/" + color + pieceType + ".png";
    piece.appendChild(pieceImg);
    return piece;
}


function showMarkers(square) {
   var markers = document.querySelectorAll(".marker");
   markers.forEach(function(marker) {
      marker.remove();
   });

   var sourceRow = parseInt(square.dataset.row);
   var sourceCol = parseInt(square.dataset.col);

   for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
         if (isValidMove(square, getSquare(row, col))) {
            var marker = document.createElement("div");
            var markerImg = document.createElement("img");
            markerImg.src = "assets/Punkt.png";
            marker.appendChild(markerImg);
            marker.className = "marker";
            getSquare(row, col).appendChild(marker);
         }
      }
   }
}

function getSquare(row, col) {
   var squares = document.querySelectorAll(".square");
   return squares[row * 8 + col];
}

function removeMarkers() {
   var markers = document.querySelectorAll(".marker");
   markers.forEach(function(marker) {
      marker.remove();
   });
}

function isValidMove(sourceSquare, targetSquare){
	if (!moveCalculation(sourceSquare, targetSquare)) return false;
	//if (targetSquare.dataset.moveInfo === "right castle") return true;
	//if (targetSquare.dataset.moveInfo === "left castle") return true;
	var oriPiece = sourceSquare.querySelector(".piece");
	var tarPiece = null;
	if(targetSquare.querySelector(".piece")) {
		tarPiece =  targetSquare.querySelector(".piece"); 		targetSquare.querySelector(".piece").remove();
	}
	var color = oriPiece.dataset.color;
	targetSquare.appendChild(oriPiece);
	var kingPiece = document.querySelector('.piece[data-color="' + color + '"][data-piece="K"]');
	var kingSquare = kingPiece.parentElement;
	var squareInCheck = isSquareInCheck(kingSquare, color);
	sourceSquare.appendChild(oriPiece);
	if (tarPiece) targetSquare.appendChild(tarPiece);
	if (squareInCheck) return false;
	return true;
}

function moveCalculation(sourceSquare, targetSquare) {
   var sourceRow = parseInt(sourceSquare.dataset.row);
   var sourceCol = parseInt(sourceSquare.dataset.col);
   var targetRow = parseInt(targetSquare.dataset.row);
   var targetCol = parseInt(targetSquare.dataset.col);
   var rowDiff = Math.abs(targetRow - sourceRow);
   var colDiff = Math.abs(targetCol - sourceCol);
   var onPiece = isPieceOn(targetSquare);
	var color = getPieceInfo(sourceSquare)["color"];
	targetSquare.dataset.moveInfo = null;
	var piece = getPieceInfo(sourceSquare)["piece"];
	
   if (sourceRow === targetRow && sourceCol === targetCol) {
      return false;
   }

	if (piece === "K" && sourceRow === targetRow && (targetCol === 7|| targetCol === 6) && !getSquare(sourceRow, 6).querySelector(".piece") && !getSquare(sourceRow, 5).querySelector(".piece") && getSquare(sourceRow, 7).querySelector(".piece")){ 
		if (getPieceInfo(sourceSquare)["moved"] === "false" && getPieceInfo(getSquare(sourceRow, 7))["moved"] === "false"){ 
			if(!isSquareInCheck(getSquare(sourceRow,4), color) && !isSquareInCheck(getSquare(sourceRow,5), color) && !isSquareInCheck(getSquare(sourceRow,6), color) && !isSquareInCheck(getSquare(sourceRow,7), color)){
				targetSquare.dataset.moveInfo = "right castle";
				return true;
			}
		}
	}
	if (piece === "K" && sourceRow === targetRow && (targetCol === 0|| targetCol === 2) && !getSquare(sourceRow, 1).querySelector(".piece") && !getSquare(sourceRow, 2).querySelector(".piece") && !getSquare(sourceRow, 3).querySelector(".piece")){ 
		if (getPieceInfo(sourceSquare)["moved"] === "false" && getPieceInfo(getSquare(sourceRow, 0))["moved"] === "false"){ 
			if(!isSquareInCheck(getSquare(sourceRow,0), color) && !isSquareInCheck(getSquare(sourceRow,1), color) && !isSquareInCheck(getSquare(sourceRow,2), color) && !isSquareInCheck(getSquare(sourceRow,3), color) && !isSquareInCheck(getSquare(sourceRow,4), color)){
				targetSquare.dataset.moveInfo = "left castle";
				return true;
			}
		}
	}
   if (targetSquare.querySelector(".piece") && getPieceInfo(sourceSquare)["color"] === getPieceInfo(targetSquare)["color"]) {
      return false;
   }

   if (piece === "R") {
      if (sourceRow === targetRow || sourceCol === targetCol) {
         // Check for any pieces in the path
         if (sourceRow === targetRow) {
            var minCol = Math.min(sourceCol, targetCol);
            var maxCol = Math.max(sourceCol, targetCol);
            for (var col = minCol + 1; col < maxCol; col++) {
               if (isPieceOn(getSquare(sourceRow, col))) {
                  return false;
               }
            }
         } else {
            var minRow = Math.min(sourceRow, targetRow);
            var maxRow = Math.max(sourceRow, targetRow);
            for (var row = minRow + 1; row < maxRow; row++) {
               if (isPieceOn(getSquare(row, sourceCol))) {
                  return false;
               }
            }
         }
         return true;
      } else {
         return false;
      }
   }
   if (piece === "H") {
      if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
         return true;
      } else {
         return false;
      }
   }
   if (piece === "B") {
      if (rowDiff === colDiff) {
         // Check for any pieces in the diagonal path
         var rowDirection = (targetRow > sourceRow) ? 1 : -1;
         var colDirection = (targetCol > sourceCol) ? 1 : -1;
         var row = sourceRow + rowDirection;
         var col = sourceCol + colDirection;
         while (row !== targetRow && col !== targetCol) {
            if (isPieceOn(getSquare(row, col))) {
               return false;
            }
            row += rowDirection;
            col += colDirection;
         }
         return true;
      } else {
         return false;
      }
   }
   if (piece === "Q") {
      if (rowDiff === colDiff) {
         // Check for any pieces in the diagonal path
         var rowDirection = (targetRow > sourceRow) ? 1 : -1;
         var colDirection = (targetCol > sourceCol) ? 1 : -1;
         var row = sourceRow + rowDirection;
         var col = sourceCol + colDirection;
         while (row !== targetRow && col !== targetCol) {
            if (isPieceOn(getSquare(row, col))) {
               return false;
            }
            row += rowDirection;
            col += colDirection;
         }
         return true;
      } else if (sourceRow === targetRow || sourceCol === targetCol) {
         // Check for any pieces in the horizontal or vertical path
         var rowDirection = (targetRow > sourceRow) ? 1 : (targetRow < sourceRow) ? -1 : 0;
         var colDirection = (targetCol > sourceCol) ? 1 : (targetCol < sourceCol) ? -1 : 0;
         var row = sourceRow + rowDirection;
         var col = sourceCol + colDirection;
         while (row !== targetRow || col !== targetCol) {
            if (isPieceOn(getSquare(row, col))) {
               return false;
            }
            row += rowDirection;
            col += colDirection;
         }
         return true;
      } else {
         return false;
      }
   }
   if (piece === "K") {
      if ((sourceRow === targetRow || sourceCol === targetCol || Math.abs(sourceRow - targetRow) === Math.abs(sourceCol - targetCol)) && Math.abs(sourceRow - targetRow) <= 1 && Math.abs(sourceCol - targetCol) <= 1) {
         return true;
      }
      if ((sourceRow === targetRow || sourceCol === targetCol || Math.abs(sourceRow - targetRow) === Math.abs(sourceCol - targetCol)) && Math.abs(sourceRow - targetRow) <= 1 && Math.abs(sourceCol - targetCol) <= 1) {
         return true;
      } 
		return false;
   }
   if (piece === "P") {
      var shiftField = 1;
      if (getPieceInfo(sourceSquare)["color"] === "b") {
         shiftField = -1;
      }
      if (moves) {
         var lastMove = moves[0];
			//en passent
			if(Math.abs(lastMove.fromRow-lastMove.row)===2 && lastMove.col === targetCol && lastMove.row === targetRow + shiftField&& Math.abs(lastMove.col-sourceCol) === 1&& lastMove.row === sourceRow){
				targetSquare.dataset.moveInfo = "en passent";
				return true;
			}
      }
      if ((sourceRow === 1 && color === "b" && !getSquare(2, sourceCol).querySelector(".piece")|| sourceRow === 6 && color === "w" && !getSquare(5, sourceCol).querySelector(".piece"))&& !onPiece && sourceRow === targetRow + shiftField * 2 && sourceCol === targetCol) {
			return true;
      }
      if (!onPiece && sourceRow === targetRow + shiftField && sourceCol === targetCol) {
         return true;
      }
      if (onPiece && sourceRow === targetRow + shiftField && Math.abs(sourceCol - targetCol) === 1) {
         return true;
      }
      return false;
   }

   return false;
}

function getPieceInfo(square) {
   var pieceElement = square.querySelector(".piece");
   if (pieceElement) {
      var pieceColor = pieceElement.dataset.color;
      var pieceData = pieceElement.dataset.piece;
		var pieceMoved = pieceElement.dataset.moved
      return {
         color: pieceColor,
         piece: pieceData,
			moved: pieceMoved
      };
   } else {
      return null; // No piece found in the square
   }
}

function isPieceOn(square) {
   var pieceElement = square.querySelector(".piece");
   if (pieceElement) {
      return true;
   }
   return false;
}
function isSquareInCheck(targetSquare, fellowColor) {
   var opponentColor = (fellowColor === "w") ? "b" : "w";
   var opponentPieces = document.querySelectorAll('.piece[data-color="' + opponentColor + '"]');
   
   for (var i = 0; i < opponentPieces.length; i++) {
      var pieceSquare = opponentPieces[i].parentElement;
      if (isValidMove(pieceSquare, targetSquare)) {
         return true;
      }
   }
   return false;
}


window.onload = function() {
   generateBoard();
   var squares = document.querySelectorAll(".square");
   squares.forEach(function(square) {
      square.onclick = function() {
         movePiece(this);
      };
   });
};