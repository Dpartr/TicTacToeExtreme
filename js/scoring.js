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
            console.log("Game ending: Board is full");
            return true;
        }
        
        // Count remaining empty cells
        const remainingCells = boardState.flat().filter(cell => cell === '').length;
        console.log(`Remaining cells: ${remainingCells}`);
        
        // Calculate current score difference
        const scoreDifference = Math.abs(scores.X - scores.O);
        console.log(`Current score difference: ${scoreDifference}`);
        
        // Calculate maximum possible remaining score opportunities
        // For a 5x5 board, calculate how many more 3-in-a-rows could be formed
        // This is a more conservative estimate to prevent premature endings
        const maxPossibleNewLines = Math.ceil(remainingCells / 3);
        console.log(`Max possible new scoring lines: ${maxPossibleNewLines}`);
        
        // Only end the game if one player's lead is mathematically impossible to overcome
        if (scoreDifference > maxPossibleNewLines) {
            console.log("Game ending: Score difference is mathematically decisive");
            return true;
        }
        
        // End if either player has reached a high score (raised from 5 to 8)
        // This ensures the game doesn't end too quickly
        if (scores.X >= 8 || scores.O >= 8) {
            console.log(`Game ending: High score reached (${scores.X} vs ${scores.O})`);
            return true;
        }
        
        // Continue the game
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