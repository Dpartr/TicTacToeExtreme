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
                if (board.every(row => row.every(cell => cell !== ''))) return 0;
                
                if (isMaximizing) {
                    let bestScore = -Infinity;
                    
                    for (let row = 0; row < 3; row++) {
                        for (let col = 0; col < 3; col++) {
                            if (board[row][col] === '') {
                                board[row][col] = this.symbol;
                                const score = this.mini