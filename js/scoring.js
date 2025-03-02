/**
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
        // ONLY end if board is full
        const isFull = boardState.every(row => row.every(cell => cell !== ''));
        
        if (isFull) {
            console.log("Game ending: Board is completely filled");
            return true;
        }
        
        // Continue the game in all other cases
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
        resetScoring
    };
})();