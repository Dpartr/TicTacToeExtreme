/**
 * Playstyle selection module
 */
const PlaystyleSelection = (function() {
    // DOM elements that will be created and added to the page
    let playstyleContainer = null;
    let confirmButton = null;
    let selectedPlaystyle = 'random'; // Default
    
    // Initialize the playstyle selection
    function initPlaystyleSelection(gameInitCallback) {
        // Create the playstyle selection container and add it to the DOM
        createPlaystyleUI();
        
        // Add event listeners to playstyle options
        addEventListeners(gameInitCallback);
    }
    
    // Create the playstyle selection UI elements
    function createPlaystyleUI() {
        // Create container
        playstyleContainer = document.createElement('div');
        playstyleContainer.className = 'playstyle-container';
        
        // Create content wrapper
        const content = document.createElement('div');
        content.className = 'playstyle-content';
        
        // Add title
        const title = document.createElement('h2');
        title.className = 'playstyle-title';
        title.textContent = 'Choose Computer Difficulty';
        content.appendChild(title);
        
        // Add description
        const description = document.createElement('p');
        description.className = 'playstyle-description';
        description.textContent = 'Select how the computer will play against you. Each style has different strategies, but all are unbeatable in the 3x3 board!';
        content.appendChild(description);
        
        // Add playstyle options
        const options = document.createElement('div');
        options.className = 'playstyle-options';
        
        // Random option
        options.appendChild(createPlaystyleOption(
            'random',
            '🎲',
            'Random',
            'Unpredictable mix of all playstyles',
            true // Selected by default
        ));
        
        // Aggressive option
        options.appendChild(createPlaystyleOption(
            'aggressive',
            '⚔️',
            'Aggressive',
            'Prioritizes creating its own opportunities'
        ));
        
        // Defensive option
        options.appendChild(createPlaystyleOption(
            'defensive',
            '🛡️',
            'Defensive',
            'Focuses on blocking your moves'
        ));
        
        // Balanced option
        options.appendChild(createPlaystyleOption(
            'balanced',
            '⚖️',
            'Balanced',
            'Equal focus on offense and defense'
        ));
        
        content.appendChild(options);
        
        // Add confirm button
        confirmButton = document.createElement('button');
        confirmButton.className = 'confirm-button';
        confirmButton.textContent = 'Start Game';
        content.appendChild(confirmButton);
        
        // Add tournament button
        const tournamentButton = document.createElement('button');
        tournamentButton.className = 'tournament-button';
        tournamentButton.textContent = 'Run AI Tournament';
        tournamentButton.id = 'tournament-btn';
        content.appendChild(tournamentButton);
        
        // Add the content to the container
        playstyleContainer.appendChild(content);
        
        // Add the container to the body
        document.body.appendChild(playstyleContainer);
    }
    
    // Create a playstyle option element
    function createPlaystyleOption(id, icon, name, detail, isSelected = false) {
        const option = document.createElement('div');
        option.className = 'playstyle-option';
        option.dataset.playstyle = id;
        
        if (isSelected) {
            option.classList.add('selected');
            selectedPlaystyle = id;
        }
        
        const iconElement = document.createElement('div');
        iconElement.className = 'playstyle-icon';
        iconElement.textContent = icon;
        option.appendChild(iconElement);
        
        const nameElement = document.createElement('div');
        nameElement.className = 'playstyle-name';
        nameElement.textContent = name;
        option.appendChild(nameElement);
        
        const detailElement = document.createElement('div');
        detailElement.className = 'playstyle-detail';
        detailElement.textContent = detail;
        option.appendChild(detailElement);
        
        return option;
    }
    
    // Add event listeners to playstyle options and confirm button
    function addEventListeners(gameInitCallback) {
        // Get all playstyle options
        const options = playstyleContainer.querySelectorAll('.playstyle-option');
        
        // Add click event to each option
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selected class from all options
                options.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                option.classList.add('selected');
                
                // Update selected playstyle
                selectedPlaystyle = option.dataset.playstyle;
            });
        });
        
        // Add click event to confirm button
        confirmButton.addEventListener('click', () => {
            // Remove the playstyle container
            document.body.removeChild(playstyleContainer);
            
            // Initialize the game with the selected playstyle
            gameInitCallback(selectedPlaystyle);
        });
        
        // Add click event to tournament button
        const tournamentButton = document.getElementById('tournament-btn');
        if (tournamentButton) {
            tournamentButton.addEventListener('click', () => {
                // Run AI tournament
                AITournament.runAndDisplayTournament(100);
            });
        }
    }
    
    // Public API
    return {
        initPlaystyleSelection
    };
})();