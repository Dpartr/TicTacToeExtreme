/**
 * AI Tournament simulation
 * Simulates games between different AI playstyles to determine relative difficulty
 */
const AITournament = (function() {
    // Available playstyles to test
    const playstyles = ['aggressive', 'defensive', 'balanced'];
    
    // Tournament results
    const results = {
        rankings: [],
        matchResults: {},
        winRates: {},
        scoreDistribution: {},
        firstMoveStats: {} // Track who goes first and how it affects win rates
    };
    
    // Initialize a simulated game between two AI playstyles
    function simulateGame(style1, style2, rounds = 100) {
        console.log(`Simulating ${rounds} games: ${style1} vs ${style2}`);
        
        const matchKey = `${style1} vs ${style2}`;
        results.matchResults[matchKey] = {
            totalGames: rounds,
            style1Wins: 0,
            style2Wins: 0,
            ties: 0,
            avgScore1: 0,
            avgScore2: 0,
            // Track first move advantage
            style1First: {
                total: 0,
                wins: 0,
                losses: 0,
                ties: 0
            },
            style2First: {
                total: 0,
                wins: 0,
                losses: 0,
                ties: 0
            }
        };
        
        let totalScore1 = 0;
        let totalScore2 = 0;
        
        // Run multiple rounds to get statistical significance
        for (let i = 0; i < rounds; i++) {
            const gameResult = simulateSingleGame(style1, style2);
            
            if (gameResult.winner === style1) {
                results.matchResults[matchKey].style1Wins++;
                
                // Update first-move stats
                if (gameResult.firstPlayer === 'ai1') {
                    results.matchResults[matchKey].style1First.wins++;
                } else {
                    results.matchResults[matchKey].style2First.losses++;
                }
            } else if (gameResult.winner === style2) {
                results.matchResults[matchKey].style2Wins++;
                
                // Update first-move stats
                if (gameResult.firstPlayer === 'ai2') {
                    results.matchResults[matchKey].style2First.wins++;
                } else {
                    results.matchResults[matchKey].style1First.losses++;
                }
            } else {
                results.matchResults[matchKey].ties++;
                
                // Update first-move stats for ties
                if (gameResult.firstPlayer === 'ai1') {
                    results.matchResults[matchKey].style1First.ties++;
                } else {
                    results.matchResults[matchKey].style2First.ties++;
                }
            }
            
            // Update first-move totals
            if (gameResult.firstPlayer === 'ai1') {
                results.matchResults[matchKey].style1First.total++;
            } else {
                results.matchResults[matchKey].style2First.total++;
            }
            
            totalScore1 += gameResult.score1;
            totalScore2 += gameResult.score2;
            
            // Track score distribution for further analysis
            const scoreDiff = Math.abs(gameResult.score1 - gameResult.score2);
            if (!results.scoreDistribution[matchKey]) {
                results.scoreDistribution[matchKey] = {};
            }
            
            if (!results.scoreDistribution[matchKey][scoreDiff]) {
                results.scoreDistribution[matchKey][scoreDiff] = 0;
            }
            
            results.scoreDistribution[matchKey][scoreDiff]++;
        }
        
        // Calculate average scores
        results.matchResults[matchKey].avgScore1 = totalScore1 / rounds;
        results.matchResults[matchKey].avgScore2 = totalScore2 / rounds;
        
        return results.matchResults[matchKey];
    }
    
    // Simulate a single game between two AI playstyles
    function simulateSingleGame(style1, style2) {
        // Create virtual AI instances
        const ai1 = createVirtualAI(style1);
        const ai2 = createVirtualAI(style2);
        
        // Initialize game state
        let boardState = Array(5).fill().map(() => Array(5).fill(''));
        
        // Randomly determine who goes first
        const firstPlayer = Math.random() < 0.5 ? 'ai1' : 'ai2';
        
        // Simulate the 3x3 phase
        const phase1Result = simulate3x3Phase(ai1, ai2, firstPlayer);
        
        // If there's a winner in 3x3, return the result
        if (phase1Result.winner) {
            return {
                winner: phase1Result.winner === 'ai1' ? style1 : style2,
                score1: 0,
                score2: 0,
                firstPlayer: firstPlayer
            };
        }
        
        // Otherwise, the 3x3 game is a tie, expand to 5x5
        // Copy the 3x3 board to the center of the 5x5 board
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                boardState[row + 1][col + 1] = phase1Result.boardState[row][col];
            }
        }
        
        // Simulate the 5x5 phase
        const phase2Result = simulate5x5Phase(ai1, ai2, boardState, phase1Result.nextTurn, style1, style2);
        
        // Add the first player information to the result
        return {
            ...phase2Result,
            firstPlayer: firstPlayer
        };
    }
    
    // Simulate the 3x3 phase of a game
    function simulate3x3Phase(ai1, ai2, firstPlayer = null) {
        let boardState = Array(3).fill().map(() => Array(3).fill(''));
        let currentTurn = firstPlayer || (Math.random() < 0.5 ? 'ai1' : 'ai2');
        let movesCount = 0;
        
        // Set symbols - X always goes first
        ai1.symbol = currentTurn === 'ai1' ? 'X' : 'O';
        ai2.symbol = currentTurn === 'ai1' ? 'O' : 'X';
        
        // Simulate moves until game is over or board is full
        while (movesCount < 9) {
            // Current AI makes a move
            const currentAI = currentTurn === 'ai1' ? ai1 : ai2;
            const move = currentAI.getBestMove3x3(boardState);
            
            if (!move) break; // No valid moves
            
            boardState[move.row][move.col] = currentAI.symbol;
            movesCount++;
            
            // Check for winner
            const winner = checkWinner3x3(boardState);
            if (winner) {
                return {
                    winner: winner === ai1.symbol ? 'ai1' : 'ai2',
                    boardState,
                    nextTurn: currentTurn === 'ai1' ? 'ai2' : 'ai1'
                };
            }
            
            // Switch turns
            currentTurn = currentTurn === 'ai1' ? 'ai2' : 'ai1';
        }
        
        // If we reach here, it's a tie
        return {
            winner: null,
            boardState,
            nextTurn: currentTurn // Who would play next in 5x5
        };
    }
    
    // Simulate the 5x5 phase of a game
    function simulate5x5Phase(ai1, ai2, boardState, nextTurn, style1, style2) {
        let currentTurn = nextTurn;
        let movesCount = 9; // 9 moves already made in 3x3 phase
        let scores = { 'X': 0, 'O': 0 };
        
        // Simulate moves until game is over or board is full
        while (movesCount < 25) {
            // Current AI makes a move
            const currentAI = currentTurn === 'ai1' ? ai1 : ai2;
            const move = currentAI.getBestMove5x5(boardState, scores[ai1.symbol], scores[ai2.symbol]);
            
            if (!move) break; // No valid moves
            
            boardState[move.row][move.col] = currentAI.symbol;
            movesCount++;
            
            // Calculate scores after this move
            const newScores = calculateScores(boardState);
            scores = newScores;
            
            // Check if game should end
            if (movesCount === 25 || !canFormMoreThreeInARows(boardState)) {
                break;
            }
            
            // Switch turns
            currentTurn = currentTurn === 'ai1' ? 'ai2' : 'ai1';
        }
        
        // Determine winner based on final scores
        let winner;
        if (scores[ai1.symbol] > scores[ai2.symbol]) {
            winner = style1;
        } else if (scores[ai2.symbol] > scores[ai1.symbol]) {
            winner = style2;
        } else {
            winner = 'tie';
        }
        
        return {
            winner,
            score1: scores[ai1.symbol],
            score2: scores[ai2.symbol]
        };
    }
    
    // Create a virtual AI instance with the specified playstyle
    function createVirtualAI(playstyle) {
        return {
            playstyle,
            symbol: '', // Will be set during game setup
            
            // Implement core AI methods for simulation
            getBestMove3x3: function(boardState) {
                // First move (empty board) - playstyle-based opening
                if (boardState.every(row => row.every(cell => cell === ''))) {
                    return this.getOpeningMove();
                }
                
                // Use minimax for optimal play in 3x3
                const bestMove = this.minimaxMove(boardState);
                return bestMove;
            },
            
            getOpeningMove: function() {
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
                switch (this.playstyle) {
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
            },
            
            minimaxMove: function(boardState) {
                let bestScore = -Infinity;
                let bestMoves = [];
                
                // Check all available moves
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        // If cell is empty
                        if (boardState[row][col] === '') {
                            // Try this move
                            boardState[row][col] = this.symbol;
                            
                            // Calculate score using minimax
                            const score = this.minimax(boardState, 0, false);
                            
                            // Undo the move
                            boardState[row][col] = '';
                            
                            // Update best score and move
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
                    return this.applyPlaystylePreference(boardState, bestMoves);
                }
                
                return bestMoves[0];
            },
            
            minimax: function(board, depth, isMaximizing) {
                // Check terminal states
                const winner = checkWinner3x3(board);
                const opponentSymbol = this.symbol === 'X' ? 'O' : 'X';
                
                if (winner === this.symbol) return 10 - depth;
                if (winner === opponentSymbol) return depth - 10;
                if (isBoardFull3x3(board)) return 0;
                
                if (isMaximizing) {
                    let bestScore = -Infinity;
                    
                    for (let row = 0; row < 3; row++) {
                        for (let col = 0; col < 3; col++) {
                            if (board[row][col] === '') {
                                board[row][col] = this.symbol;
                                const score = this.minimax(board, depth + 1, false);
                                board[row][col] = '';
                                bestScore = Math.max(score, bestScore);
                            }
                        }
                    }
                    
                    return bestScore;
                } else {
                    let bestScore = Infinity;
                    
                    for (let row = 0; row < 3; row++) {
                        for (let col = 0; col < 3; col++) {
                            if (board[row][col] === '') {
                                board[row][col] = opponentSymbol;
                                const score = this.minimax(board, depth + 1, true);
                                board[row][col] = '';
                                bestScore = Math.min(score, bestScore);
                            }
                        }
                    }
                    
                    return bestScore;
                }
            },
            
            applyPlaystylePreference: function(boardState, moves) {
                // Categorize moves
                const categorizedMoves = this.categorizeMoves(boardState, moves);
                
                // Select based on playstyle preferences
                switch (this.playstyle) {
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
            },
            
            categorizeMoves: function(boardState, moves) {
                const result = {
                    offensive: [], // Moves that can lead to AI win
                    defensive: [], // Moves that block player wins
                    central: [],   // Center or near-center moves
                    corner: []     // Corner moves
                };
                
                moves.forEach(move => {
                    const { row, col } = move;
                    
                    // Check if this is an offensive move (can lead to AI win)
                    if (this.isOffensiveMove(boardState, row, col)) {
                        result.offensive.push(move);
                    }
                    
                    // Check if this is a defensive move (blocks opponent win)
                    if (this.isDefensiveMove(boardState, row, col)) {
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
            },
            
            isOffensiveMove: function(boardState, row, col) {
                // Clone the board
                const boardCopy = boardState.map(r => [...r]);
                boardCopy[row][col] = this.symbol;
                
                // Check if this creates a potential winning line for AI
                // Check row
                let aiCount = 0;
                let emptyCount = 0;
                for (let c = 0; c < 3; c++) {
                    if (boardCopy[row][c] === this.symbol) aiCount++;
                    else if (boardCopy[row][c] === '') emptyCount++;
                }
                if (aiCount === 2 && emptyCount === 1) return true;
                
                // Check column
                aiCount = 0;
                emptyCount = 0;
                for (let r = 0; r < 3; r++) {
                    if (boardCopy[r][col] === this.symbol) aiCount++;
                    else if (boardCopy[r][col] === '') emptyCount++;
                }
                if (aiCount === 2 && emptyCount === 1) return true;
                
                // Check diagonals
                if (row === col) { // Main diagonal
                    aiCount = 0;
                    emptyCount = 0;
                    for (let i = 0; i < 3; i++) {
                        if (boardCopy[i][i] === this.symbol) aiCount++;
                        else if (boardCopy[i][i] === '') emptyCount++;
                    }
                    if (aiCount === 2 && emptyCount === 1) return true;
                }
                
                if (row + col === 2) { // Other diagonal
                    aiCount = 0;
                    emptyCount = 0;
                    for (let i = 0; i < 3; i++) {
                        if (boardCopy[i][2-i] === this.symbol) aiCount++;
                        else if (boardCopy[i][2-i] === '') emptyCount++;
                    }
                    if (aiCount === 2 && emptyCount === 1) return true;
                }
                
                return false;
            },
            
            isDefensiveMove: function(boardState, row, col) {
                // Clone the board
                const boardCopy = boardState.map(r => [...r]);
                const opponentSymbol = this.symbol === 'X' ? 'O' : 'X';
                boardCopy[row][col] = opponentSymbol;
                
                // Check if this blocks a potential winning line for opponent
                // Check row
                let opponentCount = 0;
                let emptyCount = 0;
                for (let c = 0; c < 3; c++) {
                    if (boardCopy[row][c] === opponentSymbol) opponentCount++;
                    else if (boardCopy[row][c] === '') emptyCount++;
                }
                if (opponentCount === 2 && emptyCount === 1) return true;
                
                // Check column
                opponentCount = 0;
                emptyCount = 0;
                for (let r = 0; r < 3; r++) {
                    if (boardCopy[r][col] === opponentSymbol) opponentCount++;
                    else if (boardCopy[r][col] === '') emptyCount++;
                }
                if (opponentCount === 2 && emptyCount === 1) return true;
                
                // Check diagonals
                if (row === col) { // Main diagonal
                    opponentCount = 0;
                    emptyCount = 0;
                    for (let i = 0; i < 3; i++) {
                        if (boardCopy[i][i] === opponentSymbol) opponentCount++;
                        else if (boardCopy[i][i] === '') emptyCount++;
                    }
                    if (opponentCount === 2 && emptyCount === 1) return true;
                }
                
                if (row + col === 2) { // Other diagonal
                    opponentCount = 0;
                    emptyCount = 0;
                    for (let i = 0; i < 3; i++) {
                        if (boardCopy[i][2-i] === opponentSymbol) opponentCount++;
                        else if (boardCopy[i][2-i] === '') emptyCount++;
                    }
                    if (opponentCount === 2 && emptyCount === 1) return true;
                }
                
                return false;
            },
            
            getBestMove5x5: function(boardState, playerScore, aiScore) {
                // Calculate all potential 3-in-a-rows
                const potentialLines = this.calculatePotentialLines(boardState);
                
                // 1. First priority for all playstyles: Complete an AI 3-in-a-row if possible
                const winningMove = this.findWinningMove(potentialLines.ai, boardState);
                if (winningMove) return winningMove;
                
                // 2. Second priority: Block a player's 3-in-a-row (importance varies by playstyle)
                const blockingMove = this.findWinningMove(potentialLines.player, boardState);
                
                if (blockingMove) {
                    // Aggressive might sometimes ignore blocking to pursue its own strategy
                    if (this.playstyle === 'aggressive' && Math.random() < 0.2) {
                        // Continue to other strategies
                    } else {
                        return blockingMove;
                    }
                }
                
                // 3. Third priority: Create double threats (importance varies by playstyle)
                const doubleThreats = this.findDoubleThreatMoves(potentialLines.ai, boardState);
                if (doubleThreats.length > 0) {
                    // Return the most strategic double threat
                    return doubleThreats[0];
                }
                
                // 4. Strategic moves based on playstyle
                const strategicMove = this.findStrategicMove(boardState, potentialLines);
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
            },
            
            calculatePotentialLines: function(boardState) {
                const potentialLines = {
                    player: [],
                    ai: []
                };
                const opponentSymbol = this.symbol === 'X' ? 'O' : 'X';
                
                // Check rows
                for (let row = 0; row < 5; row++) {
                    for (let col = 0; col < 3; col++) {
                        const line = [
                            { row, col, value: boardState[row][col] },
                            { row, col: col + 1, value: boardState[row][col + 1] },
                            { row, col: col + 2, value: boardState[row][col + 2] }
                        ];
                        this.categorizeLine(line, potentialLines, opponentSymbol);
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
                        this.categorizeLine(line, potentialLines, opponentSymbol);
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
                        this.categorizeLine(line, potentialLines, opponentSymbol);
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
                        this.categorizeLine(line, potentialLines, opponentSymbol);
                    }
                }
                
                return potentialLines;
            },
            
            categorizeLine: function(line, potentialLines, opponentSymbol) {
                let aiCount = 0;
                let playerCount = 0;
                let emptyCount = 0;
                
                line.forEach(cell => {
                    if (cell.value === this.symbol) aiCount++;
                    else if (cell.value === opponentSymbol) playerCount++;
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
            },
            
            findWinningMove: function(potentialLines, boardState) {
                // Sort by count in descending order (prefer lines with 2 symbols already)
                potentialLines.sort((a, b) => b.count - a.count);
                
                for (const potLine of potentialLines) {
                    if (potLine.count === 2 && potLine.emptyCells.length === 1) {
                        const emptyCell = potLine.emptyCells[0];
                        return { row: emptyCell.row, col: emptyCell.col };
                    }
                }
                
                return null;
            },
            
            findDoubleThreatMoves: function(potentialLines, boardState) {
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
            },
            
            findStrategicMove: function(boardState, potentialLines) {
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
                        score: this.calculateMoveScore(cell, boardState, potentialLines)
                    };
                });
                
                // Sort by score in descending order
                scoredMoves.sort((a, b) => b.score - a.score);
                
                // Add some randomness based on playstyle
                let selectedIndex = 0;
                
                if (scoredMoves.length > 1) {
                    switch (this.playstyle) {
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
            },
            
            calculateMoveScore: function(cell, boardState, potentialLines) {
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
                switch (this.playstyle) {
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
        };
    }
    
    // Check for a winner in 3x3 mode
    function checkWinner3x3(board) {
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
    
    // Check if 3x3 board is full
    function isBoardFull3x3(board) {
        return board.every(row => row.every(cell => cell !== ''));
    }
    
    // Calculate scores for both players in 5x5 mode
    function calculateScores(boardState) {
        const scores = {
            X: 0,
            O: 0
        };
        
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
    
    // Run the tournament
    function runTournament(rounds = 100) {
        // Reset previous results
        results.rankings = [];
        results.matchResults = {};
        results.winRates = {};
        results.scoreDistribution = {};
        results.firstMoveStats = {};
        
        // Run matches between all playstyle combinations
        for (let i = 0; i < playstyles.length; i++) {
            const style1 = playstyles[i];
            
            // Initialize win rates for this playstyle
            results.winRates[style1] = {
                wins: 0,
                losses: 0,
                ties: 0,
                winRate: 0,
                totalMatches: 0
            };
            
            for (let j = 0; j < playstyles.length; j++) {
                // Include self-matches to see how styles perform against themselves
                const style2 = playstyles[j];
                
                // Simulate the match
                const matchResult = simulateGame(style1, style2, rounds);
                
                // Update win rates
                results.winRates[style1].wins += matchResult.style1Wins;
                results.winRates[style1].losses += matchResult.style2Wins;
                results.winRates[style1].ties += matchResult.ties;
                results.winRates[style1].totalMatches += matchResult.totalGames;
            }
            
            // Calculate win rate percentage
            const totalGames = results.winRates[style1].totalMatches;
            if (totalGames > 0) {
                results.winRates[style1].winRate = (
                    (results.winRates[style1].wins + 0.5 * results.winRates[style1].ties) / 
                    totalGames * 100
                ).toFixed(2);
            }
        }
        
        // Create rankings
        results.rankings = playstyles.slice().sort((a, b) => {
            return parseFloat(results.winRates[b].winRate) - parseFloat(results.winRates[a].winRate);
        });
        
        return results;
    }
    
    // Create a tournament UI and display results
    function displayTournamentResults(results) {
        // Create tournament UI container
        const tournamentContainer = document.createElement('div');
        tournamentContainer.className = 'tournament-container';
        
        // Add tournament title and description
        const title = document.createElement('h2');
        title.textContent = 'AI Tournament Results';
        tournamentContainer.appendChild(title);
        
        const description = document.createElement('p');
        description.textContent = 'This tournament simulates matches between different AI playstyles to determine their relative strength.';
        tournamentContainer.appendChild(description);
        
        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'tournament-results';
        
        // 1. Overall Rankings Section
        const rankingsSection = createRankingsSection(results);
        resultsContainer.appendChild(rankingsSection);
        
        // 2. Self-Match Analysis Section
        const selfMatchSection = createSelfMatchSection(results);
        resultsContainer.appendChild(selfMatchSection);
        
        // 3. Matchup Results Section
        const matchupSection = createMatchupSection(results);
        resultsContainer.appendChild(matchupSection);
        
        // 4. First Move Advantage Section
        const firstMoveSection = createFirstMoveSection(results);
        resultsContainer.appendChild(firstMoveSection);
        
        // Add the results container to the tournament container
        tournamentContainer.appendChild(resultsContainer);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'tournament-close-btn';
        closeButton.textContent = 'Close Tournament Results';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(tournamentContainer);
        });
        tournamentContainer.appendChild(closeButton);
        
        // Add the tournament container to the body
        document.body.appendChild(tournamentContainer);
    }
    
    // Create the rankings section of the tournament UI
    function createRankingsSection(results) {
        const section = document.createElement('div');
        section.className = 'tournament-section';
        
        const heading = document.createElement('h3');
        heading.textContent = 'Overall Rankings';
        section.appendChild(heading);
        
        const table = document.createElement('table');
        table.className = 'tournament-table';
        
        // Table header
        const header = document.createElement('tr');
        ['Rank', 'Playstyle', 'Win %', 'Wins', 'Losses', 'Ties'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            header.appendChild(th);
        });
        table.appendChild(header);
        
        // Table body
        results.rankings.forEach((style, index) => {
            const row = document.createElement('tr');
            
            // Rank
            const rankCell = document.createElement('td');
            rankCell.textContent = `${index + 1}`;
            row.appendChild(rankCell);
            
            // Playstyle
            const styleCell = document.createElement('td');
            styleCell.textContent = style.charAt(0).toUpperCase() + style.slice(1);
            row.appendChild(styleCell);
            
            // Win %
            const winRateCell = document.createElement('td');
            winRateCell.textContent = `${results.winRates[style].winRate}%`;
            row.appendChild(winRateCell);
            
            // Wins
            const winsCell = document.createElement('td');
            winsCell.textContent = results.winRates[style].wins;
            row.appendChild(winsCell);
            
            // Losses
            const lossesCell = document.createElement('td');
            lossesCell.textContent = results.winRates[style].losses;
            row.appendChild(lossesCell);
            
            // Ties
            const tiesCell = document.createElement('td');
            tiesCell.textContent = results.winRates[style].ties;
            row.appendChild(tiesCell);
            
            table.appendChild(row);
        });
        
        section.appendChild(table);
        
        // Add summary analysis
        const summary = document.createElement('div');
        summary.className = 'tournament-summary';
        
        const summaryHeading = document.createElement('h4');
        summaryHeading.textContent = 'Playstyle Analysis';
        summary.appendChild(summaryHeading);
        
        const summaryList = document.createElement('ol');
        results.rankings.forEach(style => {
            const item = document.createElement('li');
            
            switch (style) {
                case 'aggressive':
                    item.textContent = `Aggressive (${results.winRates[style].winRate}%): Prioritizes creating its own scoring opportunities, sometimes at the expense of blocking the opponent.`;
                    break;
                case 'defensive':
                    item.textContent = `Defensive (${results.winRates[style].winRate}%): Focuses on preventing opponent's scores first, then creating its own opportunities.`;
                    break;
                case 'balanced':
                    item.textContent = `Balanced (${results.winRates[style].winRate}%): Equal focus on both offense and defense, adapting to the game state.`;
                    break;
            }
            
            summaryList.appendChild(item);
        });
        
        summary.appendChild(summaryList);
        section.appendChild(summary);
        
        return section;
    }
    
    // Create the matchup section of the tournament UI
    function createMatchupSection(results) {
        const section = document.createElement('div');
        section.className = 'tournament-section';
        
        const heading = document.createElement('h3');
        heading.textContent = 'Matchup Results';
        section.appendChild(heading);
        
        const matchupGrid = document.createElement('div');
        matchupGrid.className = 'matchup-grid';
        
        // Create a card for each matchup
        Object.keys(results.matchResults).forEach(matchKey => {
            const match = results.matchResults[matchKey];
            const [style1, style2] = matchKey.split(' vs ');
            
            const card = document.createElement('div');
            card.className = 'matchup-card';
            
            // Matchup header
            const header = document.createElement('div');
            header.className = 'matchup-header';
            // Add a special indicator for self-matches
            if (style1 === style2) {
                header.textContent = `${style1.charAt(0).toUpperCase() + style1.slice(1)} vs Self`;
                header.style.backgroundColor = '#555';
            } else {
                header.textContent = `${style1.charAt(0).toUpperCase() + style1.slice(1)} vs ${style2.charAt(0).toUpperCase() + style2.slice(1)}`;
            }
            card.appendChild(header);
            
            // Matchup results
            const result = document.createElement('div');
            result.className = 'matchup-result';
            
            // Style 1 wins
            const style1Result = document.createElement('div');
            style1Result.className = 'style1-result';
            style1Result.textContent = `${style1.charAt(0).toUpperCase() + style1.slice(1)} wins: ${match.style1Wins} (${(match.style1Wins / match.totalGames * 100).toFixed(1)}%)`;
            result.appendChild(style1Result);
            
            // Style 2 wins
            const style2Result = document.createElement('div');
            style2Result.className = 'style2-result';
            style2Result.textContent = `${style2.charAt(0).toUpperCase() + style2.slice(1)} wins: ${match.style2Wins} (${(match.style2Wins / match.totalGames * 100).toFixed(1)}%)`;
            result.appendChild(style2Result);
            
            // Ties
            const tiesResult = document.createElement('div');
            tiesResult.className = 'ties-result';
            tiesResult.textContent = `Ties: ${match.ties} (${(match.ties / match.totalGames * 100).toFixed(1)}%)`;
            result.appendChild(tiesResult);
            
            card.appendChild(result);
            
            // Average score
            const scoreInfo = document.createElement('div');
            scoreInfo.className = 'matchup-score';
            scoreInfo.textContent = `Avg Score: ${match.avgScore1.toFixed(2)} - ${match.avgScore2.toFixed(2)}`;
            
            // Add advantage indicator
            const advantage = match.avgScore1 - match.avgScore2;
            if (Math.abs(advantage) > 0.1) {
                const advantageSpan = document.createElement('span');
                advantageSpan.textContent = ` (${advantage > 0 ? '+' : ''}${advantage.toFixed(2)})`;
                advantageSpan.className = advantage > 0 ? 'positive-advantage' : 'negative-advantage';
                scoreInfo.appendChild(advantageSpan);
            }
            
            card.appendChild(scoreInfo);
            
            // First move advantage
            const firstMoveInfo = document.createElement('div');
            firstMoveInfo.className = 'matchup-first-move';
            
            const firstMoveHeader = document.createElement('div');
            firstMoveHeader.className = 'first-move-header';
            firstMoveHeader.textContent = 'First Move Stats:';
            firstMoveInfo.appendChild(firstMoveHeader);
            
            // Style 1 going first
            const style1First = document.createElement('div');
            const style1FirstWinRate = match.style1First.total > 0 
                ? ((match.style1First.wins / match.style1First.total) * 100).toFixed(1) 
                : '0.0';
            style1First.textContent = `${style1} first: ${match.style1First.wins}/${match.style1First.total} (${style1FirstWinRate}%)`;
            firstMoveInfo.appendChild(style1First);
            
            // Style 2 going first
            const style2First = document.createElement('div');
            const style2FirstWinRate = match.style2First.total > 0 
                ? ((match.style2First.wins / match.style2First.total) * 100).toFixed(1) 
                : '0.0';
            style2First.textContent = `${style2} first: ${match.style2First.wins}/${match.style2First.total} (${style2FirstWinRate}%)`;
            firstMoveInfo.appendChild(style2First);
            
            card.appendChild(firstMoveInfo);
            
            matchupGrid.appendChild(card);
        });
        
        section.appendChild(matchupGrid);
        return section;
    }
    
    // Create the first move advantage section of the tournament UI
    function createFirstMoveSection(results) {
        const section = document.createElement('div');
        section.className = 'tournament-section';
        
        const heading = document.createElement('h3');
        heading.textContent = 'First Move Advantage Analysis';
        section.appendChild(heading);
        
        const table = document.createElement('table');
        table.className = 'tournament-table';
        
        // Table header
        const header = document.createElement('tr');
        ['Playstyle', 'Win % Going First', 'Win % Going Second', 'Advantage'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            header.appendChild(th);
        });
        table.appendChild(header);
        
        // Calculate first move statistics for each playstyle
        const firstMoveStats = {};
        
        // Initialize stats
        playstyles.forEach(style => {
            firstMoveStats[style] = {
                goingFirst: { wins: 0, total: 0 },
                goingSecond: { wins: 0, total: 0 }
            };
        });
        
        // Gather data from match results
        Object.keys(results.matchResults).forEach(matchKey => {
            const match = results.matchResults[matchKey];
            const [style1, style2] = matchKey.split(' vs ');
            
            // Style 1 going first
            firstMoveStats[style1].goingFirst.wins += match.style1First.wins;
            firstMoveStats[style1].goingFirst.total += match.style1First.total;
            
            // Style 2 going second against style 1
            firstMoveStats[style2].goingSecond.wins += match.style1First.losses;
            firstMoveStats[style2].goingSecond.total += match.style1First.total;
            
            // Style 2 going first
            firstMoveStats[style2].goingFirst.wins += match.style2First.wins;
            firstMoveStats[style2].goingFirst.total += match.style2First.total;
            
            // Style 1 going second against style 2
            firstMoveStats[style1].goingSecond.wins += match.style2First.losses;
            firstMoveStats[style1].goingSecond.total += match.style2First.total;
        });
        
        // Add rows for each playstyle
        playstyles.forEach(style => {
            const row = document.createElement('tr');
            
            // Playstyle
            const styleCell = document.createElement('td');
            styleCell.textContent = style.charAt(0).toUpperCase() + style.slice(1);
            row.appendChild(styleCell);
            
            // Win % Going First
            const firstWinRate = firstMoveStats[style].goingFirst.total > 0
                ? ((firstMoveStats[style].goingFirst.wins / firstMoveStats[style].goingFirst.total) * 100).toFixed(1)
                : '0.0';
            const firstCell = document.createElement('td');
            firstCell.textContent = `${firstWinRate}% (${firstMoveStats[style].goingFirst.wins}/${firstMoveStats[style].goingFirst.total})`;
            row.appendChild(firstCell);
            
            // Win % Going Second
            const secondWinRate = firstMoveStats[style].goingSecond.total > 0
                ? ((firstMoveStats[style].goingSecond.wins / firstMoveStats[style].goingSecond.total) * 100).toFixed(1)
                : '0.0';
            const secondCell = document.createElement('td');
            secondCell.textContent = `${secondWinRate}% (${firstMoveStats[style].goingSecond.wins}/${firstMoveStats[style].goingSecond.total})`;
            row.appendChild(secondCell);
            
            // Advantage
            const advantage = parseFloat(firstWinRate) - parseFloat(secondWinRate);
            const advantageCell = document.createElement('td');
            advantageCell.textContent = `${advantage > 0 ? '+' : ''}${advantage.toFixed(1)}%`;
            
            if (Math.abs(advantage) > 5) {
                advantageCell.className = advantage > 0 ? 'positive-advantage' : 'negative-advantage';
            }
            
            row.appendChild(advantageCell);
            
            table.appendChild(row);
        });
        
        section.appendChild(table);
        
        // Add summary analysis
        const summary = document.createElement('div');
        summary.className = 'tournament-summary';
        
        const summaryHeading = document.createElement('h4');
        summaryHeading.textContent = 'First Move Advantage Summary';
        summary.appendChild(summaryHeading);
        
        const summaryContent = document.createElement('p');
        
        // Calculate overall first move advantage
        let totalFirstWins = 0;
        let totalFirstGames = 0;
        
        playstyles.forEach(style => {
            totalFirstWins += firstMoveStats[style].goingFirst.wins;
            totalFirstGames += firstMoveStats[style].goingFirst.total;
        });
        
        const overallFirstAdvantage = totalFirstGames > 0
            ? ((totalFirstWins / totalFirstGames) * 100).toFixed(1)
            : '0.0';
        
        summaryContent.textContent = `Overall, the first player wins ${overallFirstAdvantage}% of games. `;
        
        // Add playstyle-specific analysis
        const styleWithHighestAdvantage = playstyles.reduce((highest, style) => {
            const advantage = parseFloat(
                ((firstMoveStats[style].goingFirst.wins / firstMoveStats[style].goingFirst.total) * 100).toFixed(1)
            ) - parseFloat(
                ((firstMoveStats[style].goingSecond.wins / firstMoveStats[style].goingSecond.total) * 100).toFixed(1)
            );
            
            if (!highest || advantage > highest.advantage) {
                return { style, advantage };
            }
            return highest;
        }, null);
        
        if (styleWithHighestAdvantage) {
            summaryContent.textContent += `The ${styleWithHighestAdvantage.style} playstyle benefits most from going first, with a ${styleWithHighestAdvantage.advantage.toFixed(1)}% advantage.`;
        }
        
        summary.appendChild(summaryContent);
        section.appendChild(summary);
        
        return section;
    }
    
    // Create the self-match analysis section
    function createSelfMatchSection(results) {
        const section = document.createElement('div');
        section.className = 'tournament-section';
        
        const heading = document.createElement('h3');
        heading.textContent = 'Self-Match Analysis';
        section.appendChild(heading);
        
        const description = document.createElement('p');
        description.textContent = 'How each playstyle performs when playing against itself. This shows the impact of first-move advantage for each style.';
        section.appendChild(description);
        
        const table = document.createElement('table');
        table.className = 'tournament-table';
        
        // Table header
        const header = document.createElement('tr');
        ['Playstyle', 'First Player Win %', 'Second Player Win %', 'Tie %', 'First-Move Advantage'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            header.appendChild(th);
        });
        table.appendChild(header);
        
        // Add rows for each playstyle
        playstyles.forEach(style => {
            const matchKey = `${style} vs ${style}`;
            if (!results.matchResults[matchKey]) return;
            
            const match = results.matchResults[matchKey];
            const row = document.createElement('tr');
            
            // Playstyle
            const styleCell = document.createElement('td');
            styleCell.textContent = style.charAt(0).toUpperCase() + style.slice(1);
            row.appendChild(styleCell);
            
            // First Player Win %
            const firstWinRate = ((match.style1Wins / match.totalGames) * 100).toFixed(1);
            const firstCell = document.createElement('td');
            firstCell.textContent = `${firstWinRate}% (${match.style1Wins}/${match.totalGames})`;
            row.appendChild(firstCell);
            
            // Second Player Win %
            const secondWinRate = ((match.style2Wins / match.totalGames) * 100).toFixed(1);
            const secondCell = document.createElement('td');
            secondCell.textContent = `${secondWinRate}% (${match.style2Wins}/${match.totalGames})`;
            row.appendChild(secondCell);
            
            // Tie %
            const tieRate = ((match.ties / match.totalGames) * 100).toFixed(1);
            const tieCell = document.createElement('td');
            tieCell.textContent = `${tieRate}% (${match.ties}/${match.totalGames})`;
            row.appendChild(tieCell);
            
            // First-Move Advantage
            const advantage = (parseFloat(firstWinRate) - parseFloat(secondWinRate)).toFixed(1);
            const advantageCell = document.createElement('td');
            advantageCell.textContent = `${advantage > 0 ? '+' : ''}${advantage}%`;
            
            if (Math.abs(advantage) > 5) {
                advantageCell.className = advantage > 0 ? 'positive-advantage' : 'negative-advantage';
            }
            
            row.appendChild(advantageCell);
            table.appendChild(row);
        });
        
        section.appendChild(table);
        
        // Add summary analysis
        const summary = document.createElement('div');
        summary.className = 'tournament-summary';
        summary.innerHTML = '<h4>Self-Match Insights</h4>';
        
        const p = document.createElement('p');
        p.textContent = 'When a playstyle faces itself, any advantage is purely due to move order. A perfectly symmetric game with perfect play should result in the same outcome regardless of who goes first, but the differences above highlight the inherent biases in each AI strategy when going first vs. second.';
        summary.appendChild(p);
        
        section.appendChild(summary);
        return section;
    }
    
    // Run tournament and display results
    function runAndDisplayTournament(rounds = 100) {
        const tournamentResults = runTournament(rounds);
        displayTournamentResults(tournamentResults);
    }
    
    // Public API
    return {
        runAndDisplayTournament,
        runTournament
    };
})();