/**
 * AI module for the computer opponent
 */
const AI = (function() {
    // Symbols - will be dynamically set if needed
    let PLAYER_SYMBOL = 'X';
    let AI_SYMBOL = 'O';
    
    // Internal playstyle - not exposed to user
    let PLAYSTYLE = 'balanced';
    
    // Track game history for adaptive AI
    let isFirstGame = true;
    let didAIWinLastGame = false;
    
    // Set the player and AI symbols
    function setSymbols(playerSymbol, aiSymbol) {
        PLAYER_SYMBOL = playerSymbol;
        AI_SYMBOL = aiSymbol;
        
        // Choose adaptive playstyle when symbols are set
        determineAdaptivePlaystyle();
    }
    
    // Determine adaptive playstyle based on game history
    function determineAdaptivePlaystyle() {
        if (isFirstGame) {
            // First game strategy
            if (AI_SYMBOL === 'X') {
                // AI goes first - randomly choose any playstyle
                const styles = ['aggressive', 'defensive', 'balanced'];
                PLAYSTYLE = styles[Math.floor(Math.random() * styles.length)];
            } else {
                // AI goes second - choose Aggressive or Balanced
                PLAYSTYLE = Math.random() < 0.5 ? 'aggressive' : 'balanced';
            }
        } else if (didAIWinLastGame) {
            // AI won last game - be more accommodating
            if (AI_SYMBOL === 'X') {
                // AI goes first - choose Defensive or Balanced
                PLAYSTYLE = Math.random() < 0.5 ? 'defensive' : 'balanced';
            } else {
                // AI goes second - choose Balanced
                PLAYSTYLE = 'balanced';
            }
        } else {
            // AI lost last game - be more challenging
            if (AI_SYMBOL === 'X') {
                // AI goes first - choose Aggressive or Balanced
                PLAYSTYLE = Math.random() < 0.6 ? 'aggressive' : 'balanced';
            } else {
                // AI goes second - choose Aggressive
                PLAYSTYLE = 'aggressive';
            }
        }
        
        console.log(`AI adaptive playstyle: ${PLAYSTYLE} (First Game: ${isFirstGame}, AI Won Last: ${didAIWinLastGame}, AI Symbol: ${AI_SYMBOL})`);
    }
    
    // Update game history
    function updateGameHistory(aiWon) {
        isFirstGame = false;
        didAIWinLastGame = aiWon;
    }
    
    // For the 3x3 phase: Minimax algorithm with alpha-beta pruning and playstyle influence
    function getBestMove3x3(boardState) {
        // If this is the first move (empty board), use playstyle-based opening strategy
        if (boardState.every(row => row.every(cell => cell === ''))) {
            return getOpeningMove();
        }
        
        let bestScore = -Infinity;
        let bestMoves = [];
        
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
                        bestMoves = [{ row, col }];
                    } else if (score === bestScore) {
                        bestMoves.push({ row, col });
                    }
                }
            }
        }
        
        // Apply playstyle preference for equally good moves
        if (bestMoves.length > 1) {
            return applyPlaystylePreference(boardState, bestMoves);
        }
        
        return bestMoves[0];
    }
    
    // Get opening move based on playstyle
    function getOpeningMove() {
        const corner = [
            { row: 0, col: 0 },
            { row: 0, col: 2 },
            { row: 2, col: 0 },
            { row: 2, col: 2 }
        ];
        const edge = [
            { row: 0, col: 1 },
            { row: 1, col: 0 },
            { row: 1, col: 2 },
            { row: 2, col: 1 }
        ];
        const center = { row: 1, col: 1 };
        
        // Randomly select a move based on playstyle preferences
        switch (PLAYSTYLE) {
            case 'aggressive':
                // Aggressive prefers center (70%) or corners (30%)
                if (Math.random() < 0.7) {
                    return center;
                } else {
                    return corner[Math.floor(Math.random() * corner.length)];
                }
            case 'defensive':
                // Defensive prefers corners (60%), center (30%), or edges (10%)
                const defensiveRand = Math.random();
                if (defensiveRand < 0.6) {
                    return corner[Math.floor(Math.random() * corner.length)];
                } else if (defensiveRand < 0.9) {
                    return center;
                } else {
                    return edge[Math.floor(Math.random() * edge.length)];
                }
            case 'balanced':
            default:
                // Balanced prefers center (50%), corners (40%), or edges (10%)
                const balancedRand = Math.random();
                if (balancedRand < 0.5) {
                    return center;
                } else if (balancedRand < 0.9) {
                    return corner[Math.floor(Math.random() * corner.length)];
                } else {
                    return edge[Math.floor(Math.random() * edge.length)];
                }
        }
    }
    
    // Apply playstyle preferences to equally good moves
    function applyPlaystylePreference(boardState, moves) {
        // Categorize moves
        const categorizedMoves = categorizeMoves(boardState, moves);
        
        // Select based on playstyle preferences
        switch (PLAYSTYLE) {
            case 'aggressive':
                // Prefer offensive moves, then central/corner, then defensive
                if (categorizedMoves.offensive.length > 0) {
                    return categorizedMoves.offensive[Math.floor(Math.random() * categorizedMoves.offensive.length)];
                } else if (categorizedMoves.central.length > 0) {
                    return categorizedMoves.central[Math.floor(Math.random() * categorizedMoves.central.length)];
                } else if (categorizedMoves.corner.length > 0) {
                    return categorizedMoves.corner[Math.floor(Math.random() * categorizedMoves.corner.length)];
                } else {
                    return categorizedMoves.defensive[Math.floor(Math.random() * categorizedMoves.defensive.length)];
                }
            case 'defensive':
                // Prefer defensive moves, then central/corner, then offensive
                if (categorizedMoves.defensive.length > 0) {
                    return categorizedMoves.defensive[Math.floor(Math.random() * categorizedMoves.defensive.length)];
                } else if (categorizedMoves.corner.length > 0) {
                    return categorizedMoves.corner[Math.floor(Math.random() * categorizedMoves.corner.length)];
                } else if (categorizedMoves.central.length > 0) {
                    return categorizedMoves.central[Math.floor(Math.random() * categorizedMoves.central.length)];
                } else {
                    return categorizedMoves.offensive[Math.floor(Math.random() * categorizedMoves.offensive.length)];
                }
            case 'balanced':
            default:
                // Randomly select from all moves with slight preference for central
                if (categorizedMoves.central.length > 0 && Math.random() < 0.6) {
                    return categorizedMoves.central[Math.floor(Math.random() * categorizedMoves.central.length)];
                } else {
                    return moves[Math.floor(Math.random() * moves.length)];
                }
        }
    }
    
    // Categorize moves for playstyle preferences
    function categorizeMoves(boardState, moves) {
        const result = {
            offensive: [], // Moves that can lead to AI win
            defensive: [], // Moves that block player wins
            central: [],   // Center or near-center moves
            corner: []     // Corner moves
        };
        
        moves.forEach(move => {
            const { row, col } = move;
            
            // Check if this is an offensive move (can lead to AI win)
            if (isOffensiveMove(boardState, row, col)) {
                result.offensive.push(move);
            }
            
            // Check if this is a defensive move (blocks player win)
            if (isDefensiveMove(boardState, row, col)) {
                result.defensive.push(move);
            }
            
            // Check if this is a central move
            if (row === 1 && col === 1) {
                result.central.push(move);
            }
            
            // Check if this is a corner move
            if ((row === 0 || row === 2) && (col === 0 || col === 2)) {
                result.corner.push(move);
            }
        });
        
        return result;
    }
    
    // Check if a move is offensive (can lead to AI win)
    function isOffensiveMove(boardState, row, col) {
        // Clone the board
        const boardCopy = boardState.map(r => [...r]);
        boardCopy[row][col] = AI_SYMBOL;
        
        // Check if this creates a potential winning line for AI
        // Check row
        let aiCount = 0;
        let emptyCount = 0;
        for (let c = 0; c < 3; c++) {
            if (boardCopy[row][c] === AI_SYMBOL) aiCount++;
            else if (boardCopy[row][c] === '') emptyCount++;
        }
        if (aiCount === 2 && emptyCount === 1) return true;
        
        // Check column
        aiCount = 0;
        emptyCount = 0;
        for (let r = 0; r < 3; r++) {
            if (boardCopy[r][col] === AI_SYMBOL) aiCount++;
            else if (boardCopy[r][col] === '') emptyCount++;
        }
        if (aiCount === 2 && emptyCount === 1) return true;
        
        // Check diagonals
        if (row === col) { // Main diagonal
            aiCount = 0;
            emptyCount = 0;
            for (let i = 0; i < 3; i++) {
                if (boardCopy[i][i] === AI_SYMBOL) aiCount++;
                else if (boardCopy[i][i] === '') emptyCount++;
            }
            if (aiCount === 2 && emptyCount === 1) return true;
        }
        
        if (row + col === 2) { // Other diagonal
            aiCount = 0;
            emptyCount = 0;
            for (let i = 0; i < 3; i++) {
                if (boardCopy[i][2-i] === AI_SYMBOL) aiCount++;
                else if (boardCopy[i][2-i] === '') emptyCount++;
            }
            if (aiCount === 2 && emptyCount === 1) return true;
        }
        
        return false;
    }
    
    // Check if a move is defensive (blocks player win)
    function isDefensiveMove(boardState, row, col) {
        // Clone the board
        const boardCopy = boardState.map(r => [...r]);
        boardCopy[row][col] = PLAYER_SYMBOL;
        
        // Check if this blocks a potential winning line for player
        // Check row
        let playerCount = 0;
        let emptyCount = 0;
        for (let c = 0; c < 3; c++) {
            if (boardCopy[row][c] === PLAYER_SYMBOL) playerCount++;
            else if (boardCopy[row][c] === '') emptyCount++;
        }
        if (playerCount === 2 && emptyCount === 1) return true;
        
        // Check column
        playerCount = 0;
        emptyCount = 0;
        for (let r = 0; r < 3; r++) {
            if (boardCopy[r][col] === PLAYER_SYMBOL) playerCount++;
            else if (boardCopy[r][col] === '') emptyCount++;
        }
        if (playerCount === 2 && emptyCount === 1) return true;
        
        // Check diagonals
        if (row === col) { // Main diagonal
            playerCount = 0;
            emptyCount = 0;
            for (let i = 0; i < 3; i++) {
                if (boardCopy[i][i] === PLAYER_SYMBOL) playerCount++;
                else if (boardCopy[i][i] === '') emptyCount++;
            }
            if (playerCount === 2 && emptyCount === 1) return true;
        }
        
        if (row + col === 2) { // Other diagonal
            playerCount = 0;
            emptyCount = 0;
            for (let i = 0; i < 3; i++) {
                if (boardCopy[i][2-i] === PLAYER_SYMBOL) playerCount++;
                else if (boardCopy[i][2-i] === '') emptyCount++;
            }
            if (playerCount === 2 && emptyCount === 1) return true;
        }
        
        return false;
    }

    // Minimax algorithm with alpha-beta pruning
    function minimax(board, depth, isMaximizing, alpha, beta) {
        // Check terminal states
        const winner = checkWinner(board);
        if (winner === AI_SYMBOL) return 10 - depth;
        if (winner === PLAYER_SYMBOL) return depth - 10;
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
                        board[row][col] = PLAYER_SYMBOL;
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
    
    // For the 5x5 phase: Strategic move placement with playstyle influence
    function getBestMove5x5(boardState, playerScore, aiScore) {
        // Calculate all potential 3-in-a-rows
        const potentialLines = calculatePotentialLines(boardState);
        
        // 1. First priority for all playstyles: Complete an AI 3-in-a-row if possible
        const winningMove = findWinningMove(potentialLines.ai, boardState);
        if (winningMove) return winningMove;
        
        // 2. Second priority: Block a player's 3-in-a-row (importance varies by playstyle)
        const blockingMove = findWinningMove(potentialLines.player, boardState);
        
        if (blockingMove) {
            // Aggressive might sometimes ignore blocking to pursue its own strategy
            if (PLAYSTYLE === 'aggressive' && Math.random() < 0.2) {
                console.log('AI ignoring blocking move to pursue offensive strategy');
                // Continue to other strategies
            } else {
                return blockingMove;
            }
        }
        
        // 3. Third priority: Create double threats (importance varies by playstyle)
        const doubleThreats = findDoubleThreatMoves(potentialLines.ai, boardState);
        if (doubleThreats.length > 0) {
            // Return the most strategic double threat
            return doubleThreats[0];
        }
        
        // 4. Strategic moves based on playstyle
        const strategicMove = findStrategicMove(boardState, potentialLines);
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
    
    // Find strategic moves based on playstyle
    function findStrategicMove(boardState, potentialLines) {
        // Get all empty cells
        const emptyCells = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (boardState[row][col] === '') {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        // Score each empty cell based on playstyle and position
        const scoredMoves = emptyCells.map(cell => {
            return {
                ...cell,
                score: calculateMoveScore(cell, boardState, potentialLines)
            };
        });
        
        // Sort by score in descending order
        scoredMoves.sort((a, b) => b.score - a.score);
        
        // Add some randomness based on playstyle
        let selectedIndex = 0;
        
        if (scoredMoves.length > 1) {
            switch (PLAYSTYLE) {
                case 'aggressive':
                    // Aggressive takes more risks - might select a lower-scored move sometimes
                    selectedIndex = Math.random() < 0.8 ? 0 : Math.floor(Math.random() * Math.min(3, scoredMoves.length));
                    break;
                case 'defensive':
                    // Defensive is more conservative - almost always picks the highest-scored move
                    selectedIndex = Math.random() < 0.9 ? 0 : Math.floor(Math.random() * Math.min(2, scoredMoves.length));
                    break;
                default: // balanced
                    // Balanced adds a moderate amount of randomness
                    selectedIndex = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * Math.min(3, scoredMoves.length));
            }
        }
        
        return scoredMoves[selectedIndex];
    }
    
    // Calculate a score for a move based on playstyle and position
    function calculateMoveScore(cell, boardState, potentialLines) {
        const { row, col } = cell;
        let score = 0;
        
        // Base score for position
        // Center is valuable
        if (row === 2 && col === 2) {
            score += 5;
        }
        // Corners are valuable
        else if ((row === 0 || row === 4) && (col === 0 || col === 4)) {
            score += 3;
        }
        // Middle of edges
        else if ((row === 0 && col === 2) || (row === 2 && col === 0) || 
                 (row === 2 && col === 4) || (row === 4 && col === 2)) {
            score += 2;
        }
        
        // Score for potential lines this move participates in
        let aiPotential = 0;
        let playerPotential = 0;
        
        // Count potential AI lines
        potentialLines.ai.forEach(potLine => {
            if (potLine.emptyCells.some(emptyCell => emptyCell.row === row && emptyCell.col === col)) {
                // Score based on how many of the AI's pieces are already in the line
                aiPotential += potLine.count * 2;
            }
        });
        
        // Count potential player lines to block
        potentialLines.player.forEach(potLine => {
            if (potLine.emptyCells.some(emptyCell => emptyCell.row === row && emptyCell.col === col)) {
                // Score based on how many of the player's pieces are already in the line
                playerPotential += potLine.count * 2;
            }
        });
        
        // Adjust scores based on playstyle
        switch (PLAYSTYLE) {
            case 'aggressive':
                score += aiPotential * 1.5;    // Value offense more
                score += playerPotential * 0.7; // Value defense less
                break;
            case 'defensive':
                score += aiPotential * 0.7;     // Value offense less
                score += playerPotential * 1.5;  // Value defense more
                break;
            default: // balanced
                score += aiPotential;          // Equal value for offense
                score += playerPotential;      // Equal value for defense
        }
        
        return score;
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
            if (cell.value === PLAYER_SYMBOL) playerCount++;
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
        setSymbols,
        updateGameHistory
    };
})();