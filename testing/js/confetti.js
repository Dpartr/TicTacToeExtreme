/**
 * Confetti animation module
 */
const Confetti = (function() {
    // Confetti configuration
    const confettiCount = 150;
    const colors = ['red', 'blue']; // Will be adjusted based on winner
    const shapes = ['square', 'rectangle', 'circle'];
    
    // Create confetti elements with staggered animation
    function createConfetti(container, winnerSymbol) {
        // Use color based on winner symbol (X = red, O = blue)
        const colorClass = winnerSymbol === 'X' ? 'red' : 'blue';
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Use winner's color
            confetti.classList.add(colorClass);
            
            // Random shape
            const shapeClass = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.classList.add(shapeClass);
            
            // Random position
            confetti.style.left = Math.random() * 100 + '%';
            
            // Staggered starting position - some start higher above the viewport
            const startOffset = Math.random() * 300; // Random height offset
            confetti.style.top = -startOffset + 'px';
            
            // Random size
            const size = Math.random() * 5 + 5;
            
            // Don't override the size for shapes with predefined dimensions
            if (!confetti.classList.contains('square') && 
                !confetti.classList.contains('rectangle') && 
                !confetti.classList.contains('circle')) {
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
            }
            
            // Random rotation
            const rotation = Math.random() * 360;
            confetti.style.transform = `rotate(${rotation}deg)`;
            
            // Random animation duration - more variation
            const duration = Math.random() * 3 + 2;
            
            // Random animation delay - for staggered effect
            const delay = Math.random() * 1.5;
            confetti.style.animationDelay = `${delay}s`;
            
            // Apply animation
            confetti.style.animation = `fall ${duration}s linear ${delay}s forwards`;
            
            // Append to container
            container.appendChild(confetti);
        }
    }
    
    // Create fall animation dynamically
    function createFallAnimation() {
        // Create a style element if it doesn't exist
        const styleElement = document.getElementById('confetti-style') || document.createElement('style');
        styleElement.id = 'confetti-style';
        
        // Create the keyframes for falling confetti with horizontal movement
        const keyframes = `
            @keyframes fall {
                0% {
                    transform: translateY(0) translateX(0) rotate(0deg);
                    opacity: 0.7;
                }
                10% {
                    transform: translateY(10vh) translateX(5px) rotate(36deg);
                }
                20% {
                    transform: translateY(20vh) translateX(-5px) rotate(72deg);
                }
                30% {
                    transform: translateY(30vh) translateX(5px) rotate(108deg);
                }
                40% {
                    transform: translateY(40vh) translateX(-5px) rotate(144deg);
                }
                50% {
                    transform: translateY(50vh) translateX(5px) rotate(180deg);
                }
                60% {
                    transform: translateY(60vh) translateX(-5px) rotate(216deg);
                }
                70% {
                    transform: translateY(70vh) translateX(5px) rotate(252deg);
                }
                80% {
                    transform: translateY(80vh) translateX(-5px) rotate(288deg);
                }
                90% {
                    transform: translateY(90vh) translateX(5px) rotate(324deg);
                    opacity: 0.7;
                }
                100% {
                    transform: translateY(100vh) translateX(0) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        
        styleElement.textContent = keyframes;
        document.head.appendChild(styleElement);
    }
    
    // Add confetti to an element
    function addConfetti(element, winnerSymbol = 'X') {
        // Create confetti container
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        
        // Add container to element
        element.appendChild(confettiContainer);
        
        // Create fall animation
        createFallAnimation();
        
        // Create confetti elements
        createConfetti(confettiContainer, winnerSymbol);
        
        // Remove confetti after animation completes
        setTimeout(() => {
            try {
                element.removeChild(confettiContainer);
            } catch (e) {
                console.log('Confetti container already removed');
            }
        }, 8000); // Extended to account for delays
    }
    
    // Public API
    return {
        addConfetti
    };
})();