/**
 * Board module for handling the game board state and rendering
 */
const Board = (function() {
    // Private variables
    let boardSize = 3;
    let boardState = [];
    let boardElement = null;
    let cellElements = [];
    
    // Initialize the board with empty cells
    function initializeBoard(size = 3) {
        boardSize = size;
        boardState = Array(size).fill().map(() => Array(size).fill(''));
        return boardState;
    }
    
    // Create and render the game board in the DOM
    function renderBoard() {
        boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        cellElements = [];
        
        // Update the board class based on size
        boardElement.className = `board board-${boardSize}x${boardSize}`;
        
        // Create cells
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add content if the cell is not empty
                if (boardState[row][col]) {
                    cell.classList.add(boardState[row][col].toLowerCase());
                    cell.textContent = boardState[row][col];
                }
                
                boardElement.appendChild(cell);
                cellElements.push(cell);
            }
        }
    }
    
    // Make a move on the board
    function makeMove(row, col, symbol) {
        if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
            return false; // Out of bounds
        }
        
        if (boardState[row][col] !== '') {
            return false; // Cell already occupied
        }
        
        boardState[row][col] = symbol;
        return true;
    }
    
    // Check if the board is full
    function isBoardFull() {
        return boardState.every(row => row.every(cell => cell !== ''));
    }
    
    // Get available moves
    function getAvailableMoves() {
        const moves = [];
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (boardState[row][col] === '') {
                    moves.push({ row, col });
                }
            }
        }
        return moves;
    }
    
    // Expand the board to 5x5
    function expandBoard() {
        const newBoardState = Array(5).fill().map(() => Array(5).fill(''));
        
        // Copy the existing 3x3 board to the center of the new 5x5 board
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                newBoardState[row + 1][col + 1] = boardState[row][col];
            }
        }
        
        boardSize = 5;
        boardState = newBoardState;
        return boardState;
    }
    
    // Reset the board to a specific size
    function resetBoard(size = 3) {
        return initializeBoard(size);
    }
    
    // Get a copy of the current board state
    function getBoardState() {
        return boardState.map(row => [...row]);
    }
    
    // Set a specific board state (useful for AI calculations)
    function setBoardState(newState) {
        boardState = newState.map(row => [...row]);
    }
    
    // Get the current board size
    function getBoardSize() {
        return boardSize;
    }
    
    // Highlight winning combinations
    function highlightCells(cellsToHighlight, playerSymbol) {
        cellsToHighlight.forEach(({row, col}) => {
            const index = row * boardSize + col;
            if (index >= 0 && index < cellElements.length) {
                cellElements[index].classList.add('highlight');
                // Add the symbol class for specific highlighting
                if (playerSymbol) {
                    cellElements[index].classList.add(playerSymbol.toLowerCase());
                }
            }
        });
    }
    
    // Public API
    return {
        initializeBoard,
        renderBoard,
        makeMove,
        isBoardFull,
        getAvailableMoves,
        expandBoard,
        resetBoard,
        getBoardState,
        setBoardState,
        getBoardSize,
        highlightCells
    };
})();