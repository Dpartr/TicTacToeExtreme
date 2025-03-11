/**
 * Storage module for handling game state persistence
 */
const Storage = (function() {
    // Storage key
    const STORAGE_KEY = 'tictactoeExtreme_gameState';
    
    // Save the current game state to localStorage
    function saveGameState(gameState) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
            return true;
        } catch (error) {
            console.error('Failed to save game state:', error);
            return false;
        }
    }
    
    // Load game state from localStorage
    function loadGameState() {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (!savedState) return null;
            
            const gameState = JSON.parse(savedState);
            
            // Check if saved state is recent enough
            const hoursSinceSaved = (Date.now() - gameState.timestamp) / (1000 * 60 * 60);
            if (hoursSinceSaved > 24) {
                // State is too old, remove it and start fresh
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            
            // Additional validation: make sure the game is active
            // This prevents loading a completed game
            if (!gameState.gameActive) {
                console.log('Saved game is not active, clearing storage');
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            
            // Validate that the board state exists and is valid
            if (!gameState.boardState || !Array.isArray(gameState.boardState)) {
                console.log('Invalid board state in saved game, clearing storage');
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            
            return gameState;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return null;
        }
    }
    
    // Clear saved game state
    function clearGameState() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear game state:', error);
            return false;
        }
    }
    
    // Public API
    return {
        saveGameState,
        loadGameState,
        clearGameState
    };
})();