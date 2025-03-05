/**
 * Coin toss module for randomly assigning X or O to the player
 */
const CoinToss = (function() {
    // DOM elements that will be created and added to the page
    let coinTossContainer = null;
    let coinElement = null;
    let resultMessage = null;
    let continueButton = null;
    
    // Coin toss result
    let playerSymbol = 'X'; // Default
    let computerSymbol = 'O'; // Default
    let playerFirst = true; // Default
    
    // Initialize the coin toss
    function initCoinToss(gameInitCallback) {
        // Create the coin toss container and add it to the DOM
        createCoinTossUI();
        
        // Start with a slight delay to allow the UI to render
        setTimeout(() => {
            // Flip the coin after a short delay
            startCoinToss(gameInitCallback);
        }, 500);
    }
    
    // Create the coin toss UI elements
    function createCoinTossUI() {
        // Create container
        coinTossContainer = document.createElement('div');
        coinTossContainer.className = 'coin-toss-container';
        
        // Create content wrapper
        const content = document.createElement('div');
        content.className = 'coin-toss-content';
        
        // Add message
        const message = document.createElement('div');
        message.className = 'coin-message';
        message.textContent = 'Flipping coin to decide who goes first...';
        content.appendChild(message);
        
        // Create coin element
        coinElement = document.createElement('div');
        coinElement.className = 'coin';
        
        // Add coin sides
        const coinFront = document.createElement('div');
        coinFront.className = 'coin-side coin-front';
        coinFront.textContent = 'X';
        coinElement.appendChild(coinFront);
        
        const coinBack = document.createElement('div');
        coinBack.className = 'coin-side coin-back';
        coinBack.textContent = 'O';
        coinElement.appendChild(coinBack);
        
        // Add coin edge for 3D effect
        const coinEdge = document.createElement('div');
        coinEdge.className = 'coin-edge';
        coinElement.appendChild(coinEdge);
        
        content.appendChild(coinElement);
        
        // Add result message (hidden initially)
        resultMessage = document.createElement('div');
        resultMessage.className = 'result-message';
        content.appendChild(resultMessage);
        
        // Add continue button (hidden initially)
        continueButton = document.createElement('button');
        continueButton.className = 'continue-button';
        continueButton.textContent = 'Start Game';
        content.appendChild(continueButton);
        
        // Add the content to the container
        coinTossContainer.appendChild(content);
        
        // Add the container to the body
        document.body.appendChild(coinTossContainer);
    }
    
    // Start the coin toss animation
    function startCoinToss(gameInitCallback) {
        // Determine the result before starting the animation
        // 50% chance of getting X or O
        const getX = Math.random() < 0.5;
        
        playerSymbol = getX ? 'X' : 'O';
        computerSymbol = getX ? 'O' : 'X';
        
        // Player goes first if they get X, computer goes first if player gets O
        playerFirst = (playerSymbol === 'X');
        
        // Update AI symbols
        AI.setSymbols(playerSymbol, computerSymbol);
        
        // Add the flip animation
        coinElement.classList.add('coin-flip');
        
        // If the result is O, add the additional class
        if (!getX) {
            coinElement.classList.add('coin-flip-o');
        }
        
        // After the animation completes, show the result
        setTimeout(() => {
            // Display the result message
            resultMessage.textContent = getX 
                ? 'You got X! You go first.' 
                : 'You got O! Computer goes first.';
            resultMessage.classList.add('show-result');
            
            // Show the continue button
            setTimeout(() => {
                continueButton.classList.add('show-button');
                
                // Add click event to continue button
                continueButton.addEventListener('click', () => {
                    // Remove the coin toss container
                    document.body.removeChild(coinTossContainer);
                    
                    // Initialize the game with the determined symbols
                    gameInitCallback(playerSymbol, computerSymbol, playerFirst);
                });
            }, 1000);
        }, 2000); // Wait for coin flip animation to complete
    }
    
    // Public API
    return {
        initCoinToss,
    };
})();