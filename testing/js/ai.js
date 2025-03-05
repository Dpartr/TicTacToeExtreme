/**
 * AI module for the computer opponent
 */
const AI = (function() {
    // These will be updated dynamically during the game
    let PLAYER = 'X';
    let AI_SYMBOL = 'O';
    
    // Set the player and AI symbols
    function setSymbols(playerSymbol, aiSymbol) {
        PLAYER = playerSymbol;
        AI_SYMBOL = aiSymbol;
    }
    
    // For the 3x3 phase: Minimax algorithm with alpha-beta pruning
    function getBestMove3x3(boardState) {
        let bestScore = -Infinity;
        let bestMove = null;
        
        // Clone the board for AI calculations
        const boardCopy = boardState.map(row => [...row]);
        
        // Check all available moves
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                // If cell is empty
                if (boardCopy[row][col] === '') {
                    // Try this move
                    boardCopy[row][col] = AI_SYMBOL;
                    
                    // Calculate score for this move using minimax
                    const score = minimax(boardCopy, 0, false, -Infinity, Infinity);
                    
                    // Undo the move
                    boardCopy[row][col] = '';
                    
                    // Update best score and move if needed
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row, col };
                    }
                }
            }
        }
        
        return bestMove;
    }

    // Minimax algorithm with alpha-beta pruning
    function minimax(board, depth, isMaximizing, alpha, beta) {
        // Check terminal states
        const winner = checkWinner(board);
        if (winner === AI_SYMBOL) return 10 - depth;
        if (winner === PLAYER) return depth - 10;
        if (isBoardFull(board)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (board[row][col] === '') {
                        board[row][col] = AI_SYMBOL;
                        const score = minimax(board, depth + 1, false, alpha, beta);
                        board[row][col] = '';
                        bestScore = Math.max(score, bestScore);
                        alpha = Math.max(alpha, bestScore);
                        if (beta <= alpha) break;
                    }
                }
            }
            
            return bestScore;
        } else {
            let bestScore = Infinity;
            
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (board[row][col] === '') {
                        board[row][col] = PLAYER;
                        const score = minimax(board, depth + 1, true, alpha, beta);
                        board[row][col] = '';
                        bestScore = Math.min(score, bestScore);
                        beta = Math.min(beta, bestScore);
                        if (beta <= alpha) break;
                    }
                }
            }
            
            return bestScore;
        }
    }
    
    // Check for a winner in 3x3 mode
    function checkWinner(board) {
        // Check rows
        for (let row = 0; row < 3; row++) {
            if (board[row][0] !== '' && 
                board[row][0] === board[row][1] && 
                board[row][1] === board[row][2]) {
                return board[row][0];
            }
        }
        
        // Check columns
        for (let col = 0; col < 3; col++) {
            if (board[0][col] !== '' && 
                board[0][col] === board[1][col] && 
                board[1][col] === board[2][col]) {
                return board[0][col];
            }
        }
        
        // Check diagonals
        if (board[0][0] !== '' && 
            board[0][0] === board[1][1] && 
            board[1][1] === board[2][2]) {
            return board[0][0];
        }
        
        if (board[0][2] !== '' && 
            board[0][2] === board[1][1] && 
            board[1][1] === board[2][0]) {
            return board[0][2];
        }
        
        return null;
    }
    
    // Check if board is full
    function isBoardFull(board) {
        return board.every(row => row.every(cell => cell !== ''));
    }
    
    // For the 5x5 phase: Strategic move placement
    function getBestMove5x5(boardState, playerScore, aiScore) {
        // Calculate all potential 3-in-a-rows
        const potentialLines = calculatePotentialLines(boardState);
        
        // 1. First priority: Complete an AI 3-in-a-row if possible
        const winningMove = findWinningMove(potentialLines.ai, boardState);
        if (winningMove) return winningMove;
        
        // 2. Second priority: Block a player's 3-in-a-row
        const blockingMove = findWinningMove(potentialLines.player, boardState);
        if (blockingMove) return blockingMove;
        
        // 3. Third priority: Try to create a double threat (two potential 3-in-a-rows)
        const doubleThreats = findDoubleThreatMoves(potentialLines.ai, boardState);
        if (doubleThreats.length > 0) {
            // Return the most strategic double threat
            return doubleThreats[0];
        }
        
        // 4. Fourth priority: Strategic center and corner moves
        const strategicMove = findStrategicMove(boardState);
        if (strategicMove) return strategicMove;
        
        // 5. Last resort: Random available move
        const availableMoves = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (boardState[row][col] === '') {
                    availableMoves.push({ row, col });
                }
            }
        }
        
        if (availableMoves.length > 0) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        
        return null;
    }
    
    // Calculate potential 3-in-a-rows for both players
    function calculatePotentialLines(boardState) {
        const potentialLines = {
            player: [],
            ai: []
        };
        
        // Check rows
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 3; col++) {
                const line = [
                    { row, col, value: boardState[row][col] },
                    { row, col: col + 1, value: boardState[row][col + 1] },
                    { row, col: col + 2, value: boardState[row][col + 2] }
                ];
                categorizeLine(line, potentialLines);
            }
        }
        
        // Check columns
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                const line = [
                    { row, col, value: boardState[row][col] },
                    { row: row + 1, col, value: boardState[row + 1][col] },
                    { row: row + 2, col, value: boardState[row + 2][col] }
                ];
                categorizeLine(line, potentialLines);
            }
        }
        
        // Check diagonals (top-left to bottom-right)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const line = [
                    { row, col, value: boardState[row][col] },
                    { row: row + 1, col: col + 1, value: boardState[row + 1][col + 1] },
                    { row: row + 2, col: col + 2, value: boardState[row + 2][col + 2] }
                ];
                categorizeLine(line, potentialLines);
            }
        }
        
        // Check diagonals (top-right to bottom-left)
        for (let row = 0; row < 3; row++) {
            for (let col = 2; col < 5; col++) {
                const line = [
                    { row, col, value: boardState[row][col] },
                    { row: row + 1, col: col - 1, value: boardState[row + 1][col - 1] },
                    { row: row + 2, col: col - 2, value: boardState[row + 2][col - 2] }
                ];
                categorizeLine(line, potentialLines);
            }
        }
        
        return potentialLines;
    }
    
    // Categorize a line as potential for player or AI
    function categorizeLine(line, potentialLines) {
        let playerCount = 0;
        let aiCount = 0;
        let emptyCount = 0;
        
        line.forEach(cell => {
            if (cell.value === PLAYER) playerCount++;
            else if (cell.value === AI_SYMBOL) aiCount++;
            else emptyCount++;
        });
        
        // If line has only one type of symbol and some empty spaces, it's potential
        if (playerCount > 0 && aiCount === 0) {
            potentialLines.player.push({
                line,
                count: playerCount,
                emptyCells: line.filter(cell => cell.value === '')
            });
        } else if (aiCount > 0 && playerCount === 0) {
            potentialLines.ai.push({
                line,
                count: aiCount,
                emptyCells: line.filter(cell => cell.value === '')
            });
        }
    }
    
    // Find a winning move if exists
    function findWinningMove(potentialLines, boardState) {
        // Sort by count in descending order (prefer lines with 2 symbols already)
        potentialLines.sort((a, b) => b.count - a.count);
        
        for (const potLine of potentialLines) {
            if (potLine.count === 2 && potLine.emptyCells.length === 1) {
                const emptyCell = potLine.emptyCells[0];
                return { row: emptyCell.row, col: emptyCell.col };
            }
        }
        
        return null;
    }
    
    // Find moves that create double threats
    function findDoubleThreatMoves(potentialLines, boardState) {
        const threatsByPosition = {};
        
        // Count how many potential lines each empty cell participates in
        potentialLines.forEach(potLine => {
            potLine.emptyCells.forEach(cell => {
                const key = `${cell.row},${cell.col}`;
                if (!threatsByPosition[key]) {
                    threatsByPosition[key] = { 
                        position: { row: cell.row, col: cell.col },
                        count: 0,
                        lines: []
                    };
                }
                threatsByPosition[key].count++;
                threatsByPosition[key].lines.push(potLine);
            });
        });
        
        // Convert to array and sort by count
        const threats = Object.values(threatsByPosition);
        threats.sort((a, b) => b.count - a.count);
        
        // Return positions that create multiple threats
        return threats
            .filter(threat => threat.count > 1)
            .map(threat => threat.position);
    }
    
    // Find strategic moves (center, then corners, then edges)
    function findStrategicMove(boardState) {
        const center = { row: 2, col: 2 };
        if (boardState[center.row][center.col] === '') {
            return center;
        }
        
        // Corners
        const corners = [
            { row: 0, col: 0 },
            { row: 0, col: 4 },
            { row: 4, col: 0 },
            { row: 4, col: 4 }
        ];
        
        for (const corner of corners) {
            if (boardState[corner.row][corner.col] === '') {
                return corner;
            }
        }
        
        // Middle of edges
        const edges = [
            { row: 0, col: 2 },
            { row: 2, col: 0 },
            { row: 2, col: 4 },
            { row: 4, col: 2 }
        ];
        
        for (const edge of edges) {
            if (boardState[edge.row][edge.col] === '') {
                return edge;
            }
        }
        
        return null;
    }
    
    // Get the best move based on the game state
    function getBestMove(boardState, boardSize, playerScore, aiScore) {
        console.log(`AI choosing move for ${boardSize}x${boardSize} board`);
        
        if (boardSize === 3) {
            const move = getBestMove3x3(boardState);
            console.log(`AI 3x3 move: (${move.row}, ${move.col})`);
            return move;
        } else {
            const move = getBestMove5x5(boardState, playerScore, aiScore);
            console.log(`AI 5x5 move: (${move.row}, ${move.col})`);
            return move;
        }
    }
    
    // Public API
    return {
        getBestMove,
        checkWinner,
        setSymbols
    };
})();