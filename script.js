(()=>{
	const scriptEl = document.createElement("script");
	scriptEl.src = "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js";
	document.body.appendChild(scriptEl);
	scriptEl.onload = initBlindfold;
})()
function getMoves(){
	return Array.from(document.querySelectorAll(".node")).map(move=>{
                const hasPiece = move.querySelector("span[data-figurine]");
                if(hasPiece){
                        return (hasPiece.getAttribute("data-figurine") + move.innerText).replaceAll(/\s+/g, "")
                }
                return move.innerText.replaceAll(/\s+/g, "")
        });
}

function initBlindfold(){
	const boardEl = document.querySelector(".board");

	boardEl.style.visibility = "hidden";

	const boardParent = document.querySelector("#board-layout-chessboard");

	const blindfoldInterface = document.createElement("div");

	blindfoldInterface.innerHTML = `<h1 style="color:#2255AA">Blindfolded chess!</h1>
		<input id="blindfold-input"><button id="blindfold-play">Play</button>`;
	boardParent.appendChild(blindfoldInterface);
	document.querySelector("#blindfold-play").addEventListener("click", triggerPlay);
	const inputField = document.getElementById('blindfold-input');

	inputField.addEventListener('keypress', function(event) {
		if (event.keyCode === 13 || event.key === 'Enter') {
			triggerPlay();
		}
	});

	setInterval(()=>{
		if(document.querySelector("#toggleboard")){
			return
		}
		// Selecting the .player-tagline element
		const playerTagline = document.querySelector('.user-tagline-component');

		// Creating a toggle button
		const toggleButton = document.createElement('input');
		toggleButton.id = "toggleboard";
		toggleButton.type = 'checkbox';

		// Creating a label for the toggle button
		const label = document.createElement('a');
		label.innerHTML = 'Show board?';
		label.style.color = "white"

		// Appending the toggle button and label to the .player-tagline element
		playerTagline.appendChild(toggleButton);
		playerTagline.appendChild(label);

		// Selecting the .board element
		const board = document.querySelector('.board');

		// Adding event listener to toggle button
		toggleButton.addEventListener('change', function() {
			// If toggle button is checked, hide the board, otherwise show it
			board.style.visibility = this.checked ? 'visible' : 'hidden';
		});
	}, 2000)

}
function sqToArr(square){
	let rank = Number(square[1]) - 1;
	let file = ["a", "b", "c", "d", "e", "f", "g", "h"].indexOf(square[0]);
	return [file, rank];
}
function applyEvent(x, y, isUp){
	const eventType = isUp?"pointerup":"pointerdown";
	const mouseUpEvent = new MouseEvent(eventType, {
		bubbles: true,
		cancelable: true,
		clientX: x,
		clientY: y
	});
	document.querySelector(".board").dispatchEvent(mouseUpEvent)

}
function applyMove(dimensions, isWhite, start, end){
	const boardx = dimensions.left;
	const boardy = dimensions.top;
	const sidel  = dimensions.width;

	const sqSize = sidel/8;
	let x1, x2, y1, y2;

	if(isWhite){
		x1 = boardx + (sqSize * start[0]) + sqSize/2; 
		x2 = boardx + (sqSize * end[0]) + sqSize/2; 

		y1 = boardy + sidel - (sqSize * start[1]) - (sqSize/2)
		y2 = boardy + sidel - (sqSize * end[1]) - (sqSize/2)
	}
	else{
		x1 = boardx + sidel - (sqSize * start[0]) - (sqSize/2);
		x2 = boardx + sidel - (sqSize * end[0]) - (sqSize/2);
		y1 = boardy + (sqSize * start[1]) + sqSize/2;
		y2 = boardy + (sqSize * end[1]) + sqSize/2;
	}
	applyEvent(x1, y1);
	setTimeout(()=>{applyEvent(x2, y2, true)}, 50)
}

function playMove(move){
	const movesPlayed = getMoves();
	const boardEl = document.querySelector(".board");
	const dimensions = boardEl.getBoundingClientRect();
	const isWhite = movesPlayed.length % 2 == 0;

	const chessBoard = new Chess();
	chessBoard.load_pgn(movesPlayed.join(" "));

	const userMove = chessBoard.move(move);
	if(!userMove){
		say("Invalid move: " + move)
		return;
	}
	const startSquare = sqToArr(userMove.from);
	const endMove = sqToArr(userMove.to); 
	applyMove(dimensions, isWhite, startSquare, endMove);
}
function triggerPlay(){
	const move = document.querySelector("#blindfold-input").value;
	document.querySelector("#blindfold-input").value = "";
	playMove(move);
}


function transformNotation(notation) {
    let result = '';
    if (notation === 'O-O') {
        result = 'kingside castles';
    } else if (notation === 'O-O-O') {
        result = 'queenside castles';
    } else if (notation.endsWith('+')) {
        // Checking notation
        const strippedNotation = notation.slice(0, -1);
        result = `Check: ${transformNotation(strippedNotation)}`;
    } else if (notation.endsWith('#')) {
        // Checkmate notation
        const strippedNotation = notation.slice(0, -1);
        result = `Checkmate: ${transformNotation(strippedNotation)}`;
    } else {
        const pieceMap = {
            'N': 'knight',
            'B': 'bishop',
            'R': 'rook',
            'Q': 'queen',
            'K': 'king'
        };
        const actionMap = {
            'x': 'captures',
            '-': 'moves to'
        };
        let piece = 'pawn';
        let action = 'moves to';
        let target = '';
        for (let i = 0; i < notation.length; i++) {
            if (pieceMap[notation[i]]) {
                piece = pieceMap[notation[i]];
            } else if (actionMap[notation[i]]) {
                action = actionMap[notation[i]];
            } else {
                target += notation[i];
            }
        }
        result = `${piece} ${action} ${target}`;
    }
    return result;
}



function sayMove(move){
	say(transformNotation(move))
}
function say(words){
	const utterance = new SpeechSynthesisUtterance(words);

	utterance.lang = 'en-UK';

	speechSynthesis.speak(utterance);
}
window.numMoves = 0;
setInterval(()=>{
	const moves = getMoves();
	const currMoveCount = moves.length
	if(currMoveCount != numMoves){
		numMoves = currMoveCount;
		sayMove(moves[moves.length - 1]);
	}

}, 100)
