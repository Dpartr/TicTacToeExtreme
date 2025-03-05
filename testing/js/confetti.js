/**
 * Confetti animation module
 */
const Confetti = (function() {
    // Confetti configuration
    const confettiCount = 150;
    const colors = ['red', 'blue', 'purple', 'green', 'yellow', 'orange'];
    const shapes = ['square', 'rectangle', 'circle'];
    
    // Create confetti elements
    function createConfetti(container) {
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random color
            const colorClass = colors[Math.floor(Math.random() * colors.length)];
            confetti.classList.add(colorClass);
            
            // Random shape
            const shapeClass = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.classList.add(shapeClass);
            
            // Random position
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = -10 + 'px';
            
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
            
            // Random animation duration
            const duration = Math.random() * 3 + 2;
            confetti.style.animationDuration = duration + 's';
            
            // Apply animation
            confetti.style.animation = `fall ${duration}s linear forwards`;
            
            // Append to container
            container.appendChild(confetti);
        }
    }
    
    // Create fall animation dynamically
    function createFallAnimation() {
        // Create a style element if it doesn't exist
        const styleElement = document.getElementById('confetti-style') || document.createElement('style');
        styleElement.id = 'confetti-style';
        
        // Create the keyframes for falling confetti
        const keyframes = `
            @keyframes fall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0.7;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        
        styleElement.textContent = keyframes;
        document.head.appendChild(styleElement);
    }
    
    // Add confetti to an element
    function addConfetti(element) {
        // Create confetti container
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        
        // Add container to element
        element.appendChild(confettiContainer);
        
        // Create fall animation
        createFallAnimation();
        
        // Create confetti elements
        createConfetti(confettiContainer);
        
        // Remove confetti after animation completes
        setTimeout(() => {
            try {
                element.removeChild(confettiContainer);
            } catch (e) {
                console.log('Confetti container already removed');
            }
        }, 5000);
    }
    
    // Public API
    return {
        addConfetti
    };
})();