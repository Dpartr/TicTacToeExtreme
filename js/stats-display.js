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
            
            // Create a two-column layout
            html += '<div class="stats-grid">';
            
            // First column - Win Streak and Game Outcomes pie chart
            html += '<div>';
            
            // Note: Win streak section removed as requested
            html += `<div></div>`;
            
            // Game Outcomes chart
            html += `<div class="stat-section">
                <div class="section-title">Game Outcomes</div>`;
            
            if (stats.totalGames > 0) {
                html += `<div class="chart-container" style="height: 200px;">
                    <canvas id="outcome-chart"></canvas>
                </div>`;
            } else {
                html += `<p>No games have been completed yet.</p>`;
            }
            html += `</div>`;
            
            html += '</div>'; // End first column
            
            // Second column - Detailed game outcomes stats
            html += '<div>';
            
            // Game Stats Section
            html += `<div class="stat-section">
                <div class="section-title">Game Statistics</div>`;
            
            if (stats.totalGames > 0) {
                html += `<div class="stat-item">
                    <span class="stat-label">Total Games:</span>
                    <span>${stats.totalGames}</span>
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
            
            html += '</div>'; // End second column
            
            html += '</div>'; // End grid
            
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
                                position: 'bottom',
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
            
            // Create a two-column layout
            html += '<div class="stats-grid">';
            
            // First column - Symbol Performance
            html += '<div>';
            
            // Symbol Performance Section
            html += `<div class="stat-section">
                <div class="section-title">Global Symbol Performance</div>`;
            
            if (stats.playerGamesAsX > 0 || stats.playerGamesAsO > 0) {
                // Add chart container
                html += `<div class="chart-container" style="height: 180px;">
                    <canvas id="symbol-chart"></canvas>
                </div>`;
                
                html += `<div class="stat-item">
                    <span class="stat-label">All Players as X:</span>
                    <span>${stats.playerWinsAsX}/${stats.playerGamesAsX} (${stats.playerWinRateAsX}%)</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${stats.playerWinRateAsX}%"></div>
                    </div>
                </div>`;
                
                html += `<div class="stat-item">
                    <span class="stat-label">All Players as O:</span>
                    <span>${stats.playerWinsAsO}/${stats.playerGamesAsO} (${stats.playerWinRateAsO}%)</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${stats.playerWinRateAsO}%"></div>
                    </div>
                </div>`;
            } else {
                html += `<p>No symbol performance data available yet.</p>`;
            }
            html += `</div>`;
            
            html += '</div>'; // End first column
            
            // Second column - AI Style Performance
            html += '<div>';
            
            // AI Style Performance Section
            html += `<div class="stat-section">
                <div class="section-title">Global AI Style Performance</div>`;
            
            if (stats.aggressiveTotal > 0 || stats.defensiveTotal > 0 || stats.balancedTotal > 0 || stats.randomTotal > 0) {
                // Add chart container for AI style breakdown
                html += `<div class="chart-container" style="height: 180px;">
                    <canvas id="style-chart"></canvas>
                </div>`;
                
                // Display AI styles with their corresponding emojis in a compact form
                if (stats.aggressiveTotal > 0) {
                    html += `<div class="stat-item">
                        <span class="stat-label"><span class="ai-style-icon">⚔️</span> Aggressive:</span>
                        <span>${stats.aggressiveWins}/${stats.aggressiveTotal} (${stats.aggressiveWinRate}%)</span>
                    </div>`;
                }
                
                if (stats.defensiveTotal > 0) {
                    html += `<div class="stat-item">
                        <span class="stat-label"><span class="ai-style-icon">🛡️</span> Defensive:</span>
                        <span>${stats.defensiveWins}/${stats.defensiveTotal} (${stats.defensiveWinRate}%)</span>
                    </div>`;
                }
                
                if (stats.balancedTotal > 0) {
                    html += `<div class="stat-item">
                        <span class="stat-label"><span class="ai-style-icon">⚖️</span> Balanced:</span>
                        <span>${stats.balancedWins}/${stats.balancedTotal} (${stats.balancedWinRate}%)</span>
                    </div>`;
                }
                
                if (stats.randomTotal > 0) {
                    html += `<div class="stat-item">
                        <span class="stat-label"><span class="ai-style-icon">🎲</span> Random:</span>
                        <span>${stats.randomWins}/${stats.randomTotal} (${stats.randomWinRate}%)</span>
                    </div>`;
                }
            } else {
                html += `<p>No AI style performance data available yet.</p>`;
            }
            html += `</div>`;
            
            html += '</div>'; // End second column
            
            html += '</div>'; // End grid
            
            // Add the detailed breakdown in full width
            if (stats.aggressiveTotal > 0 || stats.defensiveTotal > 0 || stats.balancedTotal > 0 || stats.randomTotal > 0) {
                html += `<div class="stat-section">
                    <div class="section-title">Player Performance By Symbol & AI Style</div>
                    <div class="chart-container" style="height: 250px;">
                        <canvas id="detailed-style-chart"></canvas>
                    </div>
                </div>`;
            }
            
            tabElement.innerHTML = html;
            
            // Create symbol performance chart
            if (stats.playerGamesAsX > 0 || stats.playerGamesAsO > 0) {
                const symbolctx = document.getElementById('symbol-chart').getContext('2d');
                
                new Chart(symbolctx, {
                    type: 'bar',
                    data: {
                        labels: ['As X', 'As O'],
                        datasets: [{
                            label: 'Win Rate (%)',
                            data: [
                                parseFloat(stats.playerWinRateAsX),
                                parseFloat(stats.playerWinRateAsO)
                            ],
                            backgroundColor: [
                                getComputedStyle(document.body).getPropertyValue('--x-color'),
                                getComputedStyle(document.body).getPropertyValue('--o-color')
                            ],
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
                            tooltip: {
                                callbacks: {
                                    afterLabel: function(context) {
                                        const index = context.dataIndex;
                                        if (index === 0) {
                                            return `Wins: ${stats.playerWinsAsX} / ${stats.playerGamesAsX} games`;
                                        } else {
                                            return `Wins: ${stats.playerWinsAsO} / ${stats.playerGamesAsO} games`;
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            // Create AI style performance chart (bar chart)
            if (stats.aggressiveTotal > 0 || stats.defensiveTotal > 0 || stats.balancedTotal > 0 || stats.randomTotal > 0) {
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
                const colors = [];
                
                if (stats.aggressiveTotal > 0) {
                    labels.push('Aggressive');
                    winRates.push(parseFloat(stats.aggressiveWinRate));
                    totals.push(stats.aggressiveTotal);
                    icons.push('⚔️');
                    colors.push('#e74c3c'); // Red
                }
                
                if (stats.defensiveTotal > 0) {
                    labels.push('Defensive');
                    winRates.push(parseFloat(stats.defensiveWinRate));
                    totals.push(stats.defensiveTotal);
                    icons.push('🛡️');
                    colors.push('#3498db'); // Blue
                }
                
                if (stats.balancedTotal > 0) {
                    labels.push('Balanced');
                    winRates.push(parseFloat(stats.balancedWinRate));
                    totals.push(stats.balancedTotal);
                    icons.push('⚖️');
                    colors.push('#2ecc71'); // Green
                }
                
                if (stats.randomTotal > 0) {
                    labels.push('Random');
                    winRates.push(parseFloat(stats.randomWinRate));
                    totals.push(stats.randomTotal);
                    icons.push('🎲');
                    colors.push('#9b59b6'); // Purple
                }
                
                // Create new chart
                styleChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels.map((label, i) => `${icons[i]} ${label}`),
                        datasets: [{
                            label: 'Win Rate (%)',
                            data: winRates,
                            backgroundColor: colors,
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
                                        return `Computer Wins: ${index === 0 ? stats.aggressiveWins : 
                                                        index === 1 ? stats.defensiveWins : 
                                                        index === 2 ? stats.balancedWins : 
                                                        stats.randomWins} / ${totals[index]} games`;
                                    }
                                }
                            }
                        }
                    }
                });
                
                // Create detailed chart for player performance against each AI style
                const detailedCtx = document.getElementById('detailed-style-chart').getContext('2d');
                
                // Format the data for the grouped bar chart
                const dataByStyle = {
                    labels: ['Aggressive', 'Defensive', 'Balanced', 'Random'],
                    datasets: [
                        {
                            label: 'As X',
                            backgroundColor: getComputedStyle(document.body).getPropertyValue('--x-color'),
                            data: [
                                parseFloat(stats.aiPerformance.playerAsX.aggressive?.winRate || 0),
                                parseFloat(stats.aiPerformance.playerAsX.defensive?.winRate || 0),
                                parseFloat(stats.aiPerformance.playerAsX.balanced?.winRate || 0),
                                parseFloat(stats.aiPerformance.playerAsX.random?.winRate || 0)
                            ]
                        },
                        {
                            label: 'As O',
                            backgroundColor: getComputedStyle(document.body).getPropertyValue('--o-color'),
                            data: [
                                parseFloat(stats.aiPerformance.playerAsO.aggressive?.winRate || 0),
                                parseFloat(stats.aiPerformance.playerAsO.defensive?.winRate || 0),
                                parseFloat(stats.aiPerformance.playerAsO.balanced?.winRate || 0),
                                parseFloat(stats.aiPerformance.playerAsO.random?.winRate || 0)
                            ]
                        }
                    ]
                };
                
                new Chart(detailedCtx, {
                    type: 'bar',
                    data: dataByStyle,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                    display: true,
                                    text: 'Win Rate (%)',
                                    color: getComputedStyle(document.body).getPropertyValue('--text-color')
                                },
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
                            tooltip: {
                                callbacks: {
                                    afterLabel: function(context) {
                                        const datasetIndex = context.datasetIndex;
                                        const dataIndex = context.dataIndex;
                                        const symbolKey = datasetIndex === 0 ? 'playerAsX' : 'playerAsO';
                                        const styleKey = ['aggressive', 'defensive', 'balanced', 'random'][dataIndex];
                                        
                                        if (stats.aiPerformance[symbolKey][styleKey]) {
                                            const data = stats.aiPerformance[symbolKey][styleKey];
                                            return `Wins: ${data.wins} / ${data.total} games`;
                                        }
                                        return 'No data';
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        
        function renderSiteTab(stats, tabElement) {
            let html = '';
            
            // Create a two-column layout for site stats
            html += '<div class="stats-grid">';
            
            // First column - Visit Metrics
            html += '<div>';
            html += `<div class="stat-section">
                <div class="section-title">Visit Metrics</div>
                <div class="stat-item">
                    <span class="stat-label">Total Visits:</span>
                    <span>${stats.totalVisits}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Unique Visitors:</span>
                    <span>${stats.totalUniques}</span>
                </div>
            </div>`;
            html += '</div>'; // End first column
            
            // Second column - Today's Activity
            html += '<div>';
            html += `<div class="stat-section">
                <div class="section-title">Today's Activity</div>
                <div class="stat-item">
                    <span class="stat-label">Today's Visits:</span>
                    <span>${stats.todayVisits}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Today's Unique Visitors:</span>
                    <span>${stats.todayUniques || 0}</span>
                </div>
            </div>`;
            html += '</div>'; // End second column
            
            html += '</div>'; // End grid
            
            tabElement.innerHTML = html;
        }
    }
});