/**
 * Main game module that coordinates the entire game flow
 */
document.addEventListener('DOMContentLoaded', function() {
    // Game constants
    const PLAYER_SYMBOL = 'X';
    const AI_SYMBOL = 'O';
    const MAX_SCORE = 5;
    
    // Game state
    let gameActive = true;
    let currentPhase = '3x3'; // '3x3' or '5x5'
    let playerScore = 0;
    let computerScore = 0;
    let lastMoveHighlighted = false;
    
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
    
    // Initialize the game
    function initGame() {
        // Reset game state
        gameActive = true;
        currentPhase = '3x3';
        playerScore = 0;
        computerScore = 0;
        lastMoveHighlighted = false;
        isPlayerTurn = true; // Reset player turn
        
        // Hide score display in 3x3 phase
        scoreElement.classList.add('hidden');
        
        // Initialize and render the board
        Board.initializeBoard(3);
        Board.renderBoard();
        
        // Update game status
        updateStatus("Your turn! Place an X");
        
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
            playerScore = scores.X;
            computerScore = scores.O;
            
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
        
        // Reset player turn
        setTimeout(() => {
            isPlayerTurn = true; // Ensure it's player's turn after expansion
            updateStatus("Your turn! Now try to get the most three-in-a-rows");
        }, 1500);
    }
    
    // Track current player
    let isPlayerTurn = true;
    
    // Toggle between player and AI turns
    function togglePlayer() {
        isPlayerTurn = !isPlayerTurn;
        
        if (isPlayerTurn) {
            updateStatus("Your turn! Place an X");
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
        if (successfulRows.X.length > 0) {
            successfulRows.X.forEach(row => {
                Board.highlightCells(row, 'X');
            });
            updateStatus("You scored! Three in a row!");
        }
        
        // Highlight AI's successful rows
        if (successfulRows.O.length > 0) {
            successfulRows.O.forEach(row => {
                Board.highlightCells(row, 'O');
            });
            updateStatus("Computer scored! Three in a row!");
        }
        
        // Continue after a short delay
        setTimeout(() => {
            lastMoveHighlighted = false;
            
            // Check if game should end before continuing
            const scores = { X: playerScore, O: computerScore };
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
        
        if (isFinalPhase) {
            // Final 5x5 phase ending
            if (winner === 'player') {
                resultMessage.textContent = "You Win!";
                resultDetails.innerHTML = `
                    <p>Final Score: <strong>You ${playerScore}</strong> - ${computerScore} Computer</p>
                    <p>Congratulations! You've outscored the computer!</p>
                `;
            } else if (winner === 'computer') {
                resultMessage.textContent = "Computer Wins!";
                resultDetails.innerHTML = `
                    <p>Final Score: You ${playerScore} - <strong>${computerScore} Computer</strong></p>
                    <p>The computer outscored you this time.</p>
                `;
            } else {
                resultMessage.textContent = "It's a Tie!";
                resultDetails.innerHTML = `
                    <p>Final Score: <strong>You ${playerScore}</strong> - <strong>${computerScore} Computer</strong></p>
                    <p>An evenly matched game!</p>
                `;
            }
        } else {
            // 3x3 phase ending with a winner
            if (winner === 'player') {
                resultMessage.textContent = "You Win!";
                resultDetails.innerHTML = `
                    <p>You got three in a row in the 3x3 phase!</p>
                    <p>That's impressive - the computer is designed to never lose at 3x3.</p>
                `;
            } else {
                resultMessage.textContent = "Computer Wins!";
                resultDetails.innerHTML = `
                    <p>The computer got three in a row.</p>
                    <p>Don't worry! The 5x5 phase is more challenging and strategic.</p>
                `;
            }
        }
        
        // Show game over modal
        console.log("Showing game over modal");
        gameOverModal.classList.remove('hidden');
    }
    
    // Restart the game
    function restartGame() {
        // Hide game over modal if visible
        gameOverModal.classList.add('hidden');
        
        // Re-initialize the game
        initGame();
    }
    
    // Initialize the game when the page loads
    initGame();
});