/**
 * Main game module that coordinates the entire game flow
 */
document.addEventListener('DOMContentLoaded', function() {
    // Game constants
    let PLAYER_SYMBOL = 'X'; // Will be set by coin toss
    let AI_SYMBOL = 'O'; // Will be set by coin toss
    let AI_PLAYSTYLE = 'balanced'; // Default playstyle
    const MAX_SCORE = 5;
    
    // Game state
    let gameActive = false; // Set to false initially until coin toss completes
    let currentPhase = '3x3'; // '3x3' or '5x5'
    let playerScore = 0;
    let computerScore = 0;
    let lastMoveHighlighted = false;
    let isPlayerTurn = true; // Will be set by coin toss
    
    // DOM elements
    const statusElement = document.getElementById('status');
    const scoreElement = document.getElementById('score');
    const playerScoreElement = document.getElementById('player-score');
    const computerScoreElement = document.getElementById('computer-score');
    const boardElement = document.getElementById('game-board');
    const restartButton = document.getElementById('restart-btn');
    const gameOverModal = document.getElementById('game-over');
    const resultMessage = document.getElementById('result-message');
    const resultDetails = document.getElementById('result-details');
    const playAgainButton = document.getElementById('play-again-btn');
    
    // Initialize after playstyle selection
    function initGameAfterPlaystyleSelection(playstyle) {
        // Set AI playstyle
        AI_PLAYSTYLE = playstyle;
        AI.setPlaystyle(playstyle);
        
        // Now start the coin toss to determine symbols and first player
        CoinToss.initCoinToss(initGameAfterCoinToss);
    }
    
    // Initialize after coin toss
    function initGameAfterCoinToss(playerSym, computerSym, playerFirst) {
        // Set symbols based on coin toss
        PLAYER_SYMBOL = playerSym;
        AI_SYMBOL = computerSym;
        isPlayerTurn = playerFirst;
        
        // Set AI symbols
        AI.setSymbols(PLAYER_SYMBOL, AI_SYMBOL);
        
        // Reset game state
        gameActive = true;
        currentPhase = '3x3';
        playerScore = 0;
        computerScore = 0;
        lastMoveHighlighted = false;
        
        // Hide score display in 3x3 phase
        scoreElement.classList.add('hidden');
        
        // Initialize and render the board
        Board.initializeBoard(3);
        Board.renderBoard();
        
        // Update game status based on who goes first
        if (isPlayerTurn) {
            updateStatus(`Your turn! Place a ${PLAYER_SYMBOL}`);
        } else {
            updateStatus("Computer's turn...");
            // Let the computer make the first move after a short delay
            setTimeout(makeAIMove, 500);
        }
        
        // Add event listeners
        addEventListeners();
    }
    
    // Start the game with playstyle selection
    function startGame() {
        // First show playstyle selection
        PlaystyleSelection.initPlaystyleSelection(initGameAfterPlaystyleSelection);
    }
    
    // Add event listeners to the game elements
    function addEventListeners() {
        // Cell click event
        boardElement.addEventListener('click', handleCellClick);
        
        // Restart button
        restartButton.addEventListener('click', restartGame);
        
        // Play again button
        playAgainButton.addEventListener('click', restartGame);
    }
    
    // Handle cell click event
    function handleCellClick(event) {
        const clickedCell = event.target;
        
        // Ignore if not clicking a cell or if game is not active
        if (!clickedCell.classList.contains('cell') || !gameActive || lastMoveHighlighted) {
            return;
        }
        
        const row = parseInt(clickedCell.dataset.row);
        const col = parseInt(clickedCell.dataset.col);
        
        // Make player's move
        if (makePlayerMove(row, col)) {
            // Process after player's move
            processGameStateAfterMove();
        }
    }
    
    // Make player's move
    function makePlayerMove(row, col) {
        if (Board.makeMove(row, col, PLAYER_SYMBOL)) {
            Board.renderBoard();
            return true;
        }
        return false;
    }
    
    // Make AI's move
    function makeAIMove() {
        setTimeout(() => {
            const boardState = Board.getBoardState();
            const boardSize = Board.getBoardSize();
            
            // Get the best move for AI
            const bestMove = AI.getBestMove(boardState, boardSize, playerScore, computerScore);
            
            if (bestMove) {
                Board.makeMove(bestMove.row, bestMove.col, AI_SYMBOL);
                Board.renderBoard();
                
                // Process after AI's move
                processGameStateAfterMove();
            }
        }, 500); // Slight delay for better UX
    }
    
    // Process game state after each move
    function processGameStateAfterMove() {
        const boardState = Board.getBoardState();
        const boardSize = Board.getBoardSize();
        
        if (currentPhase === '3x3') {
            // Check for 3x3 win conditions
            const winner = AI.checkWinner(boardState);
            
            if (winner) {
                endGame(winner === PLAYER_SYMBOL ? 'player' : 'computer');
                return;
            }
            
            // Check for tie in 3x3
            if (Board.isBoardFull()) {
                // Transition to 5x5 phase
                transitionTo5x5Phase();
                return;
            }
            
            // Continue 3x3 game
            togglePlayer();
        } else {
            // 5x5 phase - calculate scores
            const scores = Scoring.calculateScores(boardState);
            playerScore = scores[PLAYER_SYMBOL];
            computerScore = scores[AI_SYMBOL];
            
            // Update score display
            updateScoreDisplay();
            
            // Display current score status in the status element
            updateScoreStatus();
            
            // Check for new successful rows
            if (Scoring.hasNewSuccessfulRows()) {
                highlightSuccessfulRows();
                return;
            }
            
            // Check if 5x5 game should end
            if (Scoring.shouldEndGame(scores, boardState)) {
                const result = playerScore > computerScore ? 'player' : 
                               computerScore > playerScore ? 'computer' : 'tie';
                endGame(result, true);
                return;
            }
            
            // Continue 5x5 game
            togglePlayer();
        }
    }
    
    // Update score status
    function updateScoreStatus() {
        let message = `Score: You ${playerScore} - ${computerScore} Computer`;
        
        if (playerScore > computerScore) {
            message += " (You're winning!)";
        } else if (computerScore > playerScore) {
            message += " (Computer's ahead!)";
        } else {
            message += " (It's a tie!)";
        }
        
        // Display this beneath the main status
        const scoreStatus = document.createElement('div');
        scoreStatus.textContent = message;
        scoreStatus.style.fontSize = '0.9rem';
        scoreStatus.style.marginTop = '5px';
        
        // Remove any existing score status
        const existingStatus = document.querySelector('.score-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        scoreStatus.className = 'score-status';
        statusElement.appendChild(scoreStatus);
    }
    
    // Transition from 3x3 to 5x5 phase
    function transitionTo5x5Phase() {
        currentPhase = '5x5';
        
        // Update status
        updateStatus("It's a tie! Expanding to 5x5 board");
        
        // Expand the board
        Board.expandBoard();
        Board.renderBoard();
        
        // Show score display
        scoreElement.classList.remove('hidden');
        updateScoreDisplay();
        
        // After expanding the board, we should toggle the turn
        // This ensures the player who just made the last move doesn't get a bonus turn
        setTimeout(() => {
            // The current player just made the move that filled the board
            // So we need to give the turn to the other player
            if (isPlayerTurn) {
                // It was player's turn, so now it should be computer's turn
                isPlayerTurn = false;
                updateStatus("Computer's turn...");
                makeAIMove();
            } else {
                // It was computer's turn, so now it should be player's turn
                isPlayerTurn = true;
                updateStatus(`Your turn! Now try to get the most three-in-a-rows with ${PLAYER_SYMBOL}`);
            }
        }, 1500);
    }
    
    // Toggle between player and AI turns
    function togglePlayer() {
        isPlayerTurn = !isPlayerTurn;
        
        if (isPlayerTurn) {
            updateStatus(`Your turn! Place a ${PLAYER_SYMBOL}`);
        } else {
            let computerMessage = "Computer's turn...";
            
            // Add some personality based on playstyle
            if (AI_PLAYSTYLE === 'aggressive' && Math.random() < 0.3) {
                computerMessage = "Computer is planning an attack...";
            } else if (AI_PLAYSTYLE === 'defensive' && Math.random() < 0.3) {
                computerMessage = "Computer is analyzing your strategy...";
            }
            
            updateStatus(computerMessage);
            makeAIMove();
        }
    }
    
    // Update game status display
    function updateStatus(message) {
        statusElement.textContent = message;
    }
    
    // Update score display
    function updateScoreDisplay() {
        playerScoreElement.textContent = playerScore;
        computerScoreElement.textContent = computerScore;
        console.log(`Score updated - Player: ${playerScore}, Computer: ${computerScore}`);
    }
    
    // Highlight successful rows
    function highlightSuccessfulRows() {
        lastMoveHighlighted = true;
        
        const successfulRows = Scoring.getSuccessfulRows();
        
        // Highlight player's successful rows
        if (successfulRows[PLAYER_SYMBOL].length > 0) {
            successfulRows[PLAYER_SYMBOL].forEach(row => {
                Board.highlightCells(row, PLAYER_SYMBOL);
            });
            updateStatus("You scored! Three in a row!");
        }
        
        // Highlight AI's successful rows
        if (successfulRows[AI_SYMBOL].length > 0) {
            successfulRows[AI_SYMBOL].forEach(row => {
                Board.highlightCells(row, AI_SYMBOL);
            });
            
            // Add some flavor based on playstyle
            let message = "Computer scored! Three in a row!";
            if (AI_PLAYSTYLE === 'aggressive' && Math.random() < 0.5) {
                message = "Computer scores and presses the advantage!";
            } else if (AI_PLAYSTYLE === 'defensive' && Math.random() < 0.5) {
                message = "Computer counters with a score!";
            }
            
            updateStatus(message);
        }
        
        // Continue after a short delay
        setTimeout(() => {
            lastMoveHighlighted = false;
            
            // Check if game should end before continuing
            const scores = {};
            scores[PLAYER_SYMBOL] = playerScore;
            scores[AI_SYMBOL] = computerScore;
            const boardState = Board.getBoardState();
            
            if (Scoring.shouldEndGame(scores, boardState)) {
                const result = playerScore > computerScore ? 'player' : 
                              computerScore > playerScore ? 'computer' : 'tie';
                endGame(result, true);
            } else {
                togglePlayer();
            }
        }, 1500);
    }
    
    // End the game and show result
    function endGame(winner, isFinalPhase = false) {
        gameActive = false;
        
        // Add the win-modal class to apply special styling
        gameOverModal.classList.add('win-modal');
        
        // Include AI playstyle in result message
        const playstyleText = AI_PLAYSTYLE === 'random' ? 'random strategy' : 
                             `${AI_PLAYSTYLE} playstyle`;
        
        if (winner === 'player') {
            resultMessage.textContent = "You Win!";
            
            // Create trophy container with gentle glow
            const trophyHTML = `
                <div class="trophy-container">
                    <div class="trophy-glow"></div>
                    <span class="trophy-animate">🏆</span>
                </div>
                <p>Final Score: <strong>You ${playerScore}</strong> - ${computerScore} Computer</p>
                <p>The computer was using a ${playstyleText}.</p>
            `;
            
            resultDetails.innerHTML = trophyHTML;
            
            // Add confetti animation
            setTimeout(() => {
                Confetti.addConfetti(gameOverModal);
            }, 300);
            
        } else if (winner === 'computer') {
            resultMessage.textContent = "Computer Wins!";
            resultDetails.innerHTML = `
                <div class="trophy-container">
                    <span class="trophy-animate">🤖</span>
                </div>
                <p>Final Score: You ${playerScore} - <strong>${computerScore} Computer</strong></p>
                <p>The computer was using a ${playstyleText}.</p>
            `;
        } else {
            resultMessage.textContent = "It's a Tie!";
            resultDetails.innerHTML = `
                <div class="trophy-container">
                    <span class="trophy-animate">🤝</span>
                </div>
                <p>Final Score: <strong>You ${playerScore}</strong> - <strong>${computerScore} Computer</strong></p>
                <p>The computer was using a ${playstyleText}.</p>
            `;
        }
        
        // Show game over modal
        console.log("Showing game over modal");
        gameOverModal.classList.remove('hidden');
    }
    
    // Restart the game
    function restartGame() {
        // Hide game over modal if visible
        gameOverModal.classList.add('hidden');
        
        // Start the game with playstyle selection
        startGame();
    }
    
    // Initialize the game with playstyle selection
    startGame();
});