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
        // End if board is full
        if (boardState.every(row => row.every(cell => cell !== ''))) {
            return true;
        }
        
        // End if score difference is too large (e.g., 3 or more)
        const scoreDifference = Math.abs(scores.X - scores.O);
        const remainingCells = boardState.flat().filter(cell => cell === '').length;
        
        // If one player is ahead by more points than there are remaining scoring opportunities
        // Each remaining cell can at most contribute to 3 new lines
        const maxRemainingScoreDelta = Math.floor(remainingCells / 3);
        if (scoreDifference > maxRemainingScoreDelta) {
            return true;
        }
        
        // End if either player has 5 or more points
        if (scores.X >= 5 || scores.O >= 5) {
            return true;
        }
        
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