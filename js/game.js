/**
 * Main game module that coordinates the entire game flow
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved game on startup
    let savedGame = null;
    try {
        // Get saved game state - the Storage module will validate it
        savedGame = Storage.loadGameState();
        
        // Extra check to ensure we don't try to restore an invalid game
        if (savedGame && (!savedGame.gameActive || !savedGame.boardState)) {
            console.log('Invalid saved game detected, clearing...');
            Storage.clearGameState();
            savedGame = null;
        }
    } catch (error) {
        console.error('Error loading saved game:', error);
        // If there's any error, clear the storage to be safe
        Storage.clearGameState();
    }
    // Fun message constants
    const WIN_MESSAGES = [
        "Winner Winner Chicken Winner!",
        "Don't quit while you're ahead",
        "I bet you can't do that again!",
        "Supreme Victory!",
        "I don't want to play anymore!"
    ];

    const LOSS_MESSAGES = [
        "One... more.. game..",
        "SORRY! Please try again!",
        "The computer got lucky!",
        "Don't give up!",
        "You zigged when you should have zagged!"
    ];

    const TIE_MESSAGES = [
        "I demand a recount",
        "Nothing is worse than a tie",
        "Cat's game?! I thought we were playing tic-tac-toe EXTREME!",
        "Touché",
        "Perfect balance achieved"
    ];
    
    // Game constants
    let PLAYER_SYMBOL = 'X'; // Will be set by coin toss
    let AI_SYMBOL = 'O'; // Will be set by coin toss
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
    
    // Initialize after coin toss
    function initGameAfterCoinToss(playerSym, computerSym, playerFirst) {
        // Clear any saved game state when starting a new game
        Storage.clearGameState();
        
        // Set symbols based on coin toss
        PLAYER_SYMBOL = playerSym;
        AI_SYMBOL = computerSym;
        isPlayerTurn = playerFirst;
        
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
    
    // Initialize the game
    function initGame() {
        // Check if there's a saved game to restore
        if (savedGame) {
            // Show restore game dialog
            showRestoreGamePrompt();
        } else {
            // Start with coin toss
            CoinToss.initCoinToss(initGameAfterCoinToss);
        }
    }
    
    // Show prompt to restore saved game
    function showRestoreGamePrompt() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'restore-game-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Saved Game Found</h2>
                <p>Would you like to continue your previous game?</p>
                <div class="modal-buttons">
                    <button id="restore-game-btn" class="btn">Continue Game</button>
                    <button id="new-game-btn" class="btn">Start New Game</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Button event listeners
        document.getElementById('restore-game-btn').addEventListener('click', function() {
            restoreGame(savedGame);
            modal.remove();
        });
        
        document.getElementById('new-game-btn').addEventListener('click', function() {
            // Clear saved game
            Storage.clearGameState();
            savedGame = null;
            // Start new game
            CoinToss.initCoinToss(initGameAfterCoinToss);
            modal.remove();
        });
    }
    
    // Restore saved game state
    function restoreGame(gameState) {
        // Set symbols and turn
        PLAYER_SYMBOL = gameState.playerSymbol;
        AI_SYMBOL = gameState.aiSymbol;
        isPlayerTurn = gameState.isPlayerTurn;
        
        // Restore game state
        gameActive = gameState.gameActive;
        currentPhase = gameState.currentPhase;
        playerScore = gameState.playerScore;
        computerScore = gameState.computerScore;
        lastMoveHighlighted = false; // Always reset this to prevent getting stuck
        
        // Restore board state
        Board.initializeBoard(gameState.boardSize);
        Board.setBoardState(gameState.boardState);
        
        // Update score display visibility
        if (currentPhase === '5x5') {
            scoreElement.classList.remove('hidden');
            updateScoreDisplay();
        } else {
            scoreElement.classList.add('hidden');
        }
        
        // Render the board
        Board.renderBoard();
        
        // Update status based on whose turn it is
        if (isPlayerTurn) {
            updateStatus(`Your turn! Place a ${PLAYER_SYMBOL}`);
        } else {
            updateStatus("Computer's turn...");
            // Set a slightly longer delay for AI move after restore
            // This gives players time to understand the board state
            setTimeout(makeAIMove, 800);
        }
        
        // Let's log the restored state for debugging
        console.log('Restored game state:', gameState);
        
        // Add event listeners
        addEventListeners();
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
        if (!clickedCell.classList.contains('cell') || !gameActive || lastMoveHighlighted || !isPlayerTurn) {
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
            // Only proceed if it's still the computer's turn
            // This prevents double moves after loading a saved game
            if (!isPlayerTurn && gameActive) {
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
            }
        }, 500); // Slight delay for better UX
    }
    
    // Save current game state
    function saveCurrentGameState() {
        const gameState = {
            playerSymbol: PLAYER_SYMBOL,
            aiSymbol: AI_SYMBOL,
            isPlayerTurn: isPlayerTurn,
            gameActive: gameActive,
            currentPhase: currentPhase,
            playerScore: playerScore,
            computerScore: computerScore,
            boardSize: Board.getBoardSize(),
            boardState: Board.getBoardState(),
            timestamp: Date.now()
        };
        
        Storage.saveGameState(gameState);
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
        
        // Save game state AFTER toggling the turn but BEFORE the AI makes its move
        // This ensures we save who's turn it WILL be next
        if (gameActive) {
            saveCurrentGameState();
        }
        
        if (isPlayerTurn) {
            updateStatus(`Your turn! Place a ${PLAYER_SYMBOL}`);
        } else {
            updateStatus("Computer's turn...");
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
            updateStatus("Computer scored! Three in a row!");
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
        
        // Clear saved game when game ends
        Storage.clearGameState();
        // Also clear the savedGame variable to prevent it from showing up on refresh
        savedGame = null;

        // Update AI game history for adaptive strategy
        const didAIWin = winner === 'computer';
        AI.updateGameHistory(didAIWin);
        
        // Add the win-modal class to apply special styling
        gameOverModal.classList.add('win-modal');
        
        // Get random fun message based on outcome
        let randomMessageIndex = Math.floor(Math.random() * 5);
        
        if (winner === 'player') {
            resultMessage.textContent = WIN_MESSAGES[randomMessageIndex];
            
            // Create trophy container with gentle glow
            const trophyHTML = `
                <div class="trophy-container">
                    <div class="trophy-glow"></div>
                    <span class="trophy-animate">🏆</span>
                </div>
                <p>Final Score: <strong>You ${playerScore}</strong> - ${computerScore} Computer</p>
            `;
            
            resultDetails.innerHTML = trophyHTML;
            
            // Add confetti animation with winner's symbol color
            setTimeout(() => {
                Confetti.addConfetti(gameOverModal, PLAYER_SYMBOL);
            }, 300);
            
        } else if (winner === 'computer') {
            resultMessage.textContent = LOSS_MESSAGES[randomMessageIndex];
            resultDetails.innerHTML = `
                <div class="trophy-container">
                    <span class="trophy-animate">🤖</span>
                </div>
                <p>Final Score: You ${playerScore} - <strong>${computerScore} Computer</strong></p>
            `;
        } else {
            resultMessage.textContent = TIE_MESSAGES[randomMessageIndex];
            resultDetails.innerHTML = `
                <div class="trophy-container">
                    <span class="trophy-animate">🤝</span>
                </div>
                <p>Final Score: <strong>You ${playerScore}</strong> - <strong>${computerScore} Computer</strong></p>
            `;
        }
        
        // Show game over modal
        console.log("Showing game over modal");
        gameOverModal.classList.remove('hidden');
    }
    
    // Restart the game
    function restartGame(event) {
        // Hide game over modal if visible
        gameOverModal.classList.add('hidden');
        gameOverModal.classList.remove('win-modal');
        
        // Clear any saved game
        Storage.clearGameState();
        // Also clear the savedGame variable
        savedGame = null;
        
        // Check if this is a "Play Again" action or "Restart" action
        const isPlayAgain = event && event.target.id === 'play-again-btn';
        
        if (isPlayAgain) {
            // For "Play Again" after a completed game, just swap sides
            // Swap symbols between player and AI
            const tempSymbol = PLAYER_SYMBOL;
            PLAYER_SYMBOL = AI_SYMBOL;
            AI_SYMBOL = tempSymbol;
            
            // Player who gets X goes first
            isPlayerTurn = (PLAYER_SYMBOL === 'X');
            
            // Update AI symbols
            if (typeof AI !== 'undefined' && AI.setSymbols) {
                AI.setSymbols(PLAYER_SYMBOL, AI_SYMBOL);
            }
            
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
        } else {
            // For a regular Restart, do the coin toss
            initGame();
        }
    }
    
    // Initialize the game when the page loads
    initGame();
});