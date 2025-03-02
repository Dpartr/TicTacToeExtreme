// Check if it's possible to form any more three-in-a-rows with the remaining empty cells
function canFormMoreThreeInARows(boardState) {
    const emptyCells = [];
    
    // Find all empty cells
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (boardState[row][col] === '') {
                emptyCells.push({ row, col });
            }
        }
    }
    
    // Check each empty cell to see if it can participate in a potential three-in-a-row
    for (const cell of emptyCells) {
        // Check horizontal lines
        if (canFormHorizontalLine(boardState, cell)) return true;
        
        // Check vertical lines
        if (canFormVerticalLine(boardState, cell)) return true;
        
        // Check diagonal lines (top-left to bottom-right)
        if (canFormDiagonalLine1(boardState, cell)) return true;
        
        // Check diagonal lines (top-right to bottom-left)
        if (canFormDiagonalLine2(boardState, cell)) return true;
    }
    
    // If we've checked all cells and found no potential lines, return false
    return false;
}

// Check if a cell can participate in a horizontal three-in-a-row
function canFormHorizontalLine(boardState, cell) {
    const { row, col } = cell;
    
    // Check for each possible position in a horizontal line
    
    // Position 1: cell is the first in a potential line
    if (col <= 2) {
        const cell2 = boardState[row][col + 1];
        const cell3 = boardState[row][col + 2];
        if ((cell2 === '' || cell3 === '') || 
            (cell2 !== '' && cell3 !== '' && cell2 === cell3)) {
            return true;
        }
    }
    
    // Position 2: cell is in the middle of a potential line
    if (col >= 1 && col <= 3) {
        const cell1 = boardState[row][col - 1];
        const cell3 = boardState[row][col + 1];
        if ((cell1 === '' || cell3 === '') || 
            (cell1 !== '' && cell3 !== '' && cell1 === cell3)) {
            return true;
        }
    }
    
    // Position 3: cell is the last in a potential line
    if (col >= 2) {
        const cell1 = boardState[row][col - 2];
        const cell2 = boardState[row][col - 1];
        if ((cell1 === '' || cell2 === '') || 
            (cell1 !== '' && cell2 !== '' && cell1 === cell2)) {
            return true;
        }
    }
    
    return false;
}

// Check if a cell can participate in a vertical three-in-a-row
function canFormVerticalLine(boardState, cell) {
    const { row, col } = cell;
    
    // Position 1: cell is the first in a potential line
    if (row <= 2) {
        const cell2 = boardState[row + 1][col];
        const cell3 = boardState[row + 2][col];
        if ((cell2 === '' || cell3 === '') || 
            (cell2 !== '' && cell3 !== '' && cell2 === cell3)) {
            return true;
        }
    }
    
    // Position 2: cell is in the middle of a potential line
    if (row >= 1 && row <= 3) {
        const cell1 = boardState[row - 1][col];
        const cell3 = boardState[row + 1][col];
        if ((cell1 === '' || cell3 === '') || 
            (cell1 !== '' && cell3 !== '' && cell1 === cell3)) {
            return true;
        }
    }
    
    // Position 3: cell is the last in a potential line
    if (row >= 2) {
        const cell1 = boardState[row - 2][col];
        const cell2 = boardState[row - 1][col];
        if ((cell1 === '' || cell2 === '') || 
            (cell1 !== '' && cell2 !== '' && cell1 === cell2)) {
            return true;
        }
    }
    
    return false;
}

// Check diagonal (top-left to bottom-right)
function canFormDiagonalLine1(boardState, cell) {
    const { row, col } = cell;
    
    // Position 1: cell is the first in a potential line
    if (row <= 2 && col <= 2) {
        const cell2 = boardState[row + 1][col + 1];
        const cell3 = boardState[row + 2][col + 2];
        if ((cell2 === '' || cell3 === '') || 
            (cell2 !== '' && cell3 !== '' && cell2 === cell3)) {
            return true;
        }
    }
    
    // Position 2: cell is in the middle of a potential line
    if (row >= 1 && row <= 3 && col >= 1 && col <= 3) {
        const cell1 = boardState[row - 1][col - 1];
        const cell3 = boardState[row + 1][col + 1];
        if ((cell1 === '' || cell3 === '') || 
            (cell1 !== '' && cell3 !== '' && cell1 === cell3)) {
            return true;
        }
    }
    
    // Position 3: cell is the last in a potential line
    if (row >= 2 && col >= 2) {
        const cell1 = boardState[row - 2][col - 2];
        const cell2 = boardState[row - 1][col - 1];
        if ((cell1 === '' || cell2 === '') || 
            (cell1 !== '' && cell2 !== '' && cell1 === cell2)) {
            return true;
        }
    }
    
    return false;
}

// Check diagonal (top-right to bottom-left)
function canFormDiagonalLine2(boardState, cell) {
    const { row, col } = cell;
    
    // Position 1: cell is the first in a potential line
    if (row <= 2 && col >= 2) {
        const cell2 = boardState[row + 1][col - 1];
        const cell3 = boardState[row + 2][col - 2];
        if ((cell2 === '' || cell3 === '') || 
            (cell2 !== '' && cell3 !== '' && cell2 === cell3)) {
            return true;
        }
    }
    
    // Position 2: cell is in the middle of a potential line
    if (row >= 1 && row <= 3 && col >= 1 && col <= 3) {
        const cell1 = boardState[row - 1][col + 1];
        const cell3 = boardState[row + 1][col - 1];
        if ((cell1 === '' || cell3 === '') || 
            (cell1 !== '' && cell3 !== '' && cell1 === cell3)) {
            return true;
        }
    }
    
    // Position 3: cell is the last in a potential line
    if (row >= 2 && col <= 2) {
        const cell1 = boardState[row - 2][col + 2];
        const cell2 = boardState[row - 1][col + 1];
        if ((cell1 === '' || cell2 === '') || 
            (cell1 !== '' && cell2 !== '' && cell1 === cell2)) {
            return true;
        }
    }
    
    return false;
}/**
* Scoring module for the 5x5 game phase
*/
const Scoring = (function() {
// Store successful rows for highlighting
let successfulRows = {
    X: [],
    O: []
};

// Reset scoring data
function resetScoring() {
    successfulRows = { X: [], O: [] };
}

// Calculate scores for both players
function calculateScores(boardState) {
    resetScoring();
    
    const scores = {
        X: 0,
        O: 0
    };
    
    console.log("Calculating scores...");
    
    // Check rows
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= 2; col++) {
            const symbol = checkThreeInARow(
                boardState[row][col],
                boardState[row][col + 1],
                boardState[row][col + 2]
            );
            
            if (symbol) {
                scores[symbol]++;
                successfulRows[symbol].push([
                    { row, col },
                    { row, col: col + 1 },
                    { row, col: col + 2 }
                ]);
            }
        }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row <= 2; row++) {
            const symbol = checkThreeInARow(
                boardState[row][col],
                boardState[row + 1][col],
                boardState[row + 2][col]
            );
            
            if (symbol) {
                scores[symbol]++;
                successfulRows[symbol].push([
                    { row, col },
                    { row: row + 1, col },
                    { row: row + 2, col }
                ]);
            }
        }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row <= 2; row++) {
        for (let col = 0; col <= 2; col++) {
            const symbol = checkThreeInARow(
                boardState[row][col],
                boardState[row + 1][col + 1],
                boardState[row + 2][col + 2]
            );
            
            if (symbol) {
                scores[symbol]++;
                successfulRows[symbol].push([
                    { row, col },
                    { row: row + 1, col: col + 1 },
                    { row: row + 2, col: col + 2 }
                ]);
            }
        }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let row = 0; row <= 2; row++) {
        for (let col = 4; col >= 2; col--) {
            const symbol = checkThreeInARow(
                boardState[row][col],
                boardState[row + 1][col - 1],
                boardState[row + 2][col - 2]
            );
            
            if (symbol) {
                scores[symbol]++;
                successfulRows[symbol].push([
                    { row, col },
                    { row: row + 1, col: col - 1 },
                    { row: row + 2, col: col - 2 }
                ]);
            }
        }
    }
    
    return scores;
}

// Check if three cells form a three-in-a-row
function checkThreeInARow(cell1, cell2, cell3) {
    if (cell1 === '' || cell2 === '' || cell3 === '') {
        return null;
    }
    
    if (cell1 === cell2 && cell2 === cell3) {
        return cell1;
    }
    
    return null;
}

// Get successful rows for highlighting
function getSuccessfulRows() {
    return successfulRows;
}

// Check if game should end based on scores or board fullness
function shouldEndGame(scores, boardState) {
    // End if board is full
    const isFull = boardState.every(row => row.every(cell => cell !== ''));
    
    if (isFull) {
        console.log("Game ending: Board is completely filled");
        return true;
    }
    
    // Check if no more three-in-a-rows are possible
    const canFormMore = canFormMoreThreeInARows(boardState);
    
    if (!canFormMore) {
        console.log("Game ending: No more three-in-a-rows possible");
        return true;
    }
    
    // Continue the game if there are still potential three-in-a-rows
    return false;
}

// Check if there are successful rows to highlight
function hasNewSuccessfulRows() {
    return successfulRows.X.length > 0 || successfulRows.O.length > 0;
}

// Public API
return {
    calculateScores,
    getSuccessfulRows,
    shouldEndGame,
    hasNewSuccessfulRows,
    resetScoring,
    canFormMoreThreeInARows
};
})();