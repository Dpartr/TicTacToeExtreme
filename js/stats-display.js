/**
 * Enhanced Stats Display module for Tic Tac Toe Extreme
 * Handles theme toggling, tabbed stats interface, and data visualization
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase Analytics
    if (typeof Analytics !== 'undefined' && Analytics.initialize) {
        console.log('Starting Firebase Analytics initialization...');
        Analytics.initialize().then(result => {
            console.log('Firebase initialization result:', result);
        }).catch(error => {
            console.error('Error during Firebase initialization:', error);
        });
    } else {
        console.error('Analytics object not found or initialize method missing');
    }
    
    // Theme functionality
    setupThemeToggle();
    
    // Stats functionality
    setupStatsDisplay();
    
    /**
     * Sets up theme toggle functionality
     */
    function setupThemeToggle() {
        // Check system preference for dark mode
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme based on system preference
        document.body.classList.add(prefersDarkMode ? 'dark-theme' : 'light-theme');
        
        // Theme toggle functionality
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        
        // Set initial button text based on current theme
        updateThemeButtonText();
        
        themeToggleBtn.addEventListener('click', function() {
            if (document.body.classList.contains('dark-theme')) {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            }
            updateThemeButtonText();
        });
        
        function updateThemeButtonText() {
            if (document.body.classList.contains('dark-theme')) {
                themeToggleBtn.innerHTML = '☀️ Light';
            } else {
                themeToggleBtn.innerHTML = '🌙 Dark';
            }
        }
    }
    
    /**
     * Sets up enhanced statistics display
     */
    function setupStatsDisplay() {
        // Stats Modal functionality
        const statsBtn = document.getElementById('stats-btn');
        const statsModal = document.getElementById('stats-modal');
        const closeStatsBtn = document.getElementById('close-stats-btn');
        const statsContent = document.getElementById('stats-content');
        
        // Charts objects for reuse
        let outcomeChart = null;
        let styleChart = null;
        
        // State variables
        let currentPeriod = 'all';
        let currentTab = 'game';
        let currentStats = null;
        
        // Tab navigation
        const tabs = document.querySelectorAll('.stats-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                currentTab = this.dataset.tab;
                renderStats(currentStats);
            });
        });
        
        // Period selector
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                periodBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentPeriod = this.dataset.period;
                // In a real implementation, we would filter stats by period here
                // For now, we'll just re-render with the same data
                renderStats(currentStats);
            });
        });
        
        statsBtn.addEventListener('click', async function() {
            statsModal.classList.remove('hidden');
            statsContent.innerHTML = 'Loading...';
            
            try {
                currentStats = await Analytics.getStatistics();
                renderStats(currentStats);
            } catch (error) {
                console.error('Error fetching statistics:', error);
                statsContent.innerHTML = 'An error occurred while loading statistics.';
            }
        });
        
        closeStatsBtn.addEventListener('click', function() {
            statsModal.classList.add('hidden');
            // Destroy charts to prevent memory leaks
            if (outcomeChart) {
                outcomeChart.destroy();
                outcomeChart = null;
            }
            if (styleChart) {
                styleChart.destroy();
                styleChart = null;
            }
        });
        
        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === statsModal) {
                statsModal.classList.add('hidden');
                // Destroy charts to prevent memory leaks
                if (outcomeChart) {
                    outcomeChart.destroy();
                    outcomeChart = null;
                }
                if (styleChart) {
                    styleChart.destroy();
                    styleChart = null;
                }
            }
        });
        
        /**
         * Render statistics based on current tab and period
         */
        function renderStats(stats) {
            if (!stats) {
                statsContent.innerHTML = 'Statistics are not available at this time.';
                return;
            }
            
            // Calculate win streak (this would normally be calculated server-side)
            // For now we'll just set a placeholder value
            const winStreak = 3; 
            
            // Create tab container divs
            let gameTabHtml = '<div class="stats-tab-content" id="game-tab"></div>';
            let performanceTabHtml = '<div class="stats-tab-content" id="performance-tab"></div>';
            let siteTabHtml = '<div class="stats-tab-content" id="site-tab"></div>';
            
            let statsHtml = `${gameTabHtml}${performanceTabHtml}${siteTabHtml}`;
            statsContent.innerHTML = statsHtml;
            
            // Get tab containers
            const gameTab = document.getElementById('game-tab');
            const performanceTab = document.getElementById('performance-tab');
            const siteTab = document.getElementById('site-tab');
            
            // Set active tab
            document.querySelectorAll('.stats-tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            let activeTab;
            switch(currentTab) {
                case 'game':
                    activeTab = gameTab;
                    renderGameTab(stats, gameTab);
                    break;
                case 'performance':
                    activeTab = performanceTab;
                    renderPerformanceTab(stats, performanceTab);
                    break;
                case 'site':
                    activeTab = siteTab;
                    renderSiteTab(stats, siteTab);
                    break;
            }
            
            if (activeTab) {
                activeTab.classList.add('active');
            }
        }
        
        /**
         * Render the Game tab content
         */
        function renderGameTab(stats, tabElement) {
            let html = '';
            
            // Win Streak Section
            html += `
            <div class="win-streak">
                <div class="streak-label">Current Win Streak</div>
                <div class="streak-value">${stats.winStreak || 0}</div>
            </div>`;
            
            // Game Outcomes Section with Chart
            html += `<div class="stat-section">
                <div class="section-title">Game Outcomes</div>`;
            
            if (stats.totalGames > 0) {
                html += `<div class="stat-item">
                    <span class="stat-label">Total Games Played:</span>
                    <span>${stats.totalGames}</span>
                </div>`;
                
                // Add chart container
                html += `<div class="chart-container">
                    <canvas id="outcome-chart"></canvas>
                </div>`;
                
                html += `<div class="stat-item">
                    <span class="stat-label">Player Wins:</span>
                    <span>${stats.playerWins} (${stats.playerWinRate}%)</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${stats.playerWinRate}%"></div>
                    </div>
                </div>`;
                
                html += `<div class="stat-item">
                    <span class="stat-label">Computer Wins:</span>
                    <span>${stats.computerWins} (${stats.computerWinRate}%)</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${stats.computerWinRate}%"></div>
                    </div>
                </div>`;
                
                html += `<div class="stat-item">
                    <span class="stat-label">Ties:</span>
                    <span>${stats.ties} (${stats.tieRate}%)</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${stats.tieRate}%"></div>
                    </div>
                </div>`;
            } else {
                html += `<p>No games have been completed yet.</p>`;
            }
            html += `</div>`;
            
            // Symbol Performance Section
            if (stats.playerWinsAsX > 0 || stats.playerWinsAsO > 0) {
                html += `<div class="stat-section">
                    <div class="section-title">Symbol Performance</div>
                    <div class="stat-item">
                        <span class="stat-label">Player Wins as X:</span>
                        <span>${stats.playerWinsAsX}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Player Wins as O:</span>
                        <span>${stats.playerWinsAsO}</span>
                    </div>
                </div>`;
            }
            
            tabElement.innerHTML = html;
            
            // Create pie chart for outcome data if there are games
            if (stats.totalGames > 0) {
                const ctx = document.getElementById('outcome-chart').getContext('2d');
                
                // Destroy previous chart instance if it exists
                if (outcomeChart) {
                    outcomeChart.destroy();
                }
                
                // Create new chart
                outcomeChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Player Wins', 'Computer Wins', 'Ties'],
                        datasets: [{
                            data: [stats.playerWins, stats.computerWins, stats.ties],
                            backgroundColor: [
                                getComputedStyle(document.body).getPropertyValue('--x-color'),
                                getComputedStyle(document.body).getPropertyValue('--o-color'),
                                getComputedStyle(document.body).getPropertyValue('--cell-border')
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    color: getComputedStyle(document.body).getPropertyValue('--text-color')
                                }
                            }
                        }
                    }
                });
            }
        }
        
        /**
         * Render the Performance tab content
         */
        function renderPerformanceTab(stats, tabElement) {
            let html = '';
            
            // AI Style Performance Section
            html += `<div class="stat-section">
                <div class="section-title">AI Style Performance</div>`;
            
            if (stats.aggressiveTotal > 0 || stats.defensiveTotal > 0 || stats.balancedTotal > 0) {
                // Add chart container
                html += `<div class="chart-container" style="height: 250px;">
                    <canvas id="style-chart"></canvas>
                </div>`;
                
                if (stats.aggressiveTotal > 0) {
                    html += `<div class="stat-item">
                        <span class="stat-label"><span class="ai-style-icon">⚔️</span> Aggressive:</span>
                        <span>${stats.aggressiveWins}/${stats.aggressiveTotal} (${stats.aggressiveWinRate}% wins)</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${stats.aggressiveWinRate}%"></div>
                        </div>
                    </div>`;
                }
                
                if (stats.defensiveTotal > 0) {
                    html += `<div class="stat-item">
                        <span class="stat-label"><span class="ai-style-icon">🛡️</span> Defensive:</span>
                        <span>${stats.defensiveWins}/${stats.defensiveTotal} (${stats.defensiveWinRate}% wins)</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${stats.defensiveWinRate}%"></div>
                        </div>
                    </div>`;
                }
                
                if (stats.balancedTotal > 0) {
                    html += `<div class="stat-item">
                        <span class="stat-label"><span class="ai-style-icon">⚖️</span> Balanced:</span>
                        <span>${stats.balancedWins}/${stats.balancedTotal} (${stats.balancedWinRate}% wins)</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${stats.balancedWinRate}%"></div>
                        </div>
                    </div>`;
                }
            } else {
                html += `<p>No AI style performance data available yet.</p>`;
            }
            html += `</div>`;
            
            tabElement.innerHTML = html;
            
            // Create bar chart for AI style data
            if (stats.aggressiveTotal > 0 || stats.defensiveTotal > 0 || stats.balancedTotal > 0) {
                const ctx = document.getElementById('style-chart').getContext('2d');
                
                // Destroy previous chart instance if it exists
                if (styleChart) {
                    styleChart.destroy();
                }
                
                // Prepare data for chart
                const labels = [];
                const winRates = [];
                const totals = [];
                const icons = [];
                
                if (stats.aggressiveTotal > 0) {
                    labels.push('Aggressive');
                    winRates.push(parseFloat(stats.aggressiveWinRate));
                    totals.push(stats.aggressiveTotal);
                    icons.push('⚔️');
                }
                
                if (stats.defensiveTotal > 0) {
                    labels.push('Defensive');
                    winRates.push(parseFloat(stats.defensiveWinRate));
                    totals.push(stats.defensiveTotal);
                    icons.push('🛡️');
                }
                
                if (stats.balancedTotal > 0) {
                    labels.push('Balanced');
                    winRates.push(parseFloat(stats.balancedWinRate));
                    totals.push(stats.balancedTotal);
                    icons.push('⚖️');
                }
                
                // Create new chart
                styleChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels.map((label, i) => `${icons[i]} ${label}`),
                        datasets: [{
                            label: 'Win Rate (%)',
                            data: winRates,
                            backgroundColor: getComputedStyle(document.body).getPropertyValue('--button-bg'),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                    color: getComputedStyle(document.body).getPropertyValue('--text-color')
                                },
                                grid: {
                                    color: getComputedStyle(document.body).getPropertyValue('--cell-border') + '33' // 20% opacity
                                }
                            },
                            x: {
                                ticks: {
                                    color: getComputedStyle(document.body).getPropertyValue('--text-color')
                                },
                                grid: {
                                    color: getComputedStyle(document.body).getPropertyValue('--cell-border') + '33' // 20% opacity
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    afterLabel: function(context) {
                                        const index = context.dataIndex;
                                        return `Total Games: ${totals[index]}`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        
        /**
         * Render the Site Stats tab content
         */
        function renderSiteTab(stats, tabElement) {
            let html = '';
            
            html += `<div class="stat-section">
                <div class="section-title">Site Metrics</div>
                <div class="stat-item">
                    <span class="stat-label">Total Visits:</span>
                    <span>${stats.totalVisits}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Unique Visitors:</span>
                    <span>${stats.totalUniques}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Today's Visits:</span>
                    <span>${stats.todayVisits}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Today's Unique Visitors:</span>
                    <span>${stats.todayUniques || 0}</span>
                </div>
            </div>`;
            
            tabElement.innerHTML = html;
        }
    }
});