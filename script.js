const textDisplay = document.getElementById('text-display');
        const userInput = document.getElementById('user-input');
        const startButton = document.getElementById('start-btn');
        const difficultySelect = document.getElementById('difficulty');
        const timeDisplay = document.getElementById('time');
        const wpmDisplay = document.getElementById('wpm');
        const accuracyDisplay = document.getElementById('accuracy');
        const themeToggle = document.getElementById('theme-toggle');
        const keyboard = document.getElementById('keyboard');
        const timerProgress = document.getElementById('timer-progress');
        const achievementsContainer = document.getElementById('achievements');
        const congratsMessage = document.getElementById('congrats');
        const levelUpMessage = document.getElementById('level-up');

        const difficultyLevels = {
            easy: {
                time: 60,
                texts: [
                    "The quick brown fox jumps over the lazy dog.",
                    "A journey of a thousand miles begins with a single step.",
                    "All that glitters is not gold.",
                    "Actions speak louder than words.",
                    "Where there's a will, there's a way.",
                    "Practice makes perfect.",
                    "Better late than never."
                ]
            },
            
            medium: {
                time: 45,
                texts: [
                    "The sun slowly set behind the mountains, painting the sky in vibrant hues of orange and pink.",
                    "In the depths of winter, I finally learned that there was in me an invincible summer.",
                    "Life is what happens to you while you're busy making other plans.",
                    "The only way to do great work is to love what you do.",
                    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
                    "The future belongs to those who believe in the beauty of their dreams."
                ]
            },
            hard: {
                time: 30,
                texts: [
                    "In quantum mechanics, the uncertainty principle asserts a fundamental limit to the precision with which certain pairs of physical properties can be determined simultaneously.",
                    "The intricate dance of subatomic particles reveals the profound interconnectedness of all matter in the universe.",
                    "Cognitive dissonance theory suggests that we have an inner drive to hold all our attitudes and behavior in harmony and avoid disharmony or dissonance.",
                    "The phenomenon of neuroplasticity demonstrates the brain's remarkable ability to reorganize itself by forming new neural connections throughout life.",
                    "The advent of artificial intelligence and machine learning algorithms has revolutionized numerous fields, from healthcare to finance, raising both excitement and ethical concerns.",
                    "The concept of sustainable development seeks to balance economic growth, environmental protection, and social equity to meet the needs of the present without compromising future generations.",
                    "The human genome project has unlocked unprecedented insights into our genetic makeup, paving the way for personalized medicine and a deeper understanding of hereditary diseases."
                ]
            }
        };

        let timer;
        let timeLeft;
        let currentText = '';
        let isRunning = false;
        let leaderboardData = [
            { username: 'Shuvajit Debnath', wpm: 110 },
            { username: 'Ovijit Debnath', wpm: 105 },
            { username: 'ROLS', wpm: 100 },
        ];
        let progressData = [];
        let achievements = ['Beginner Typer', '50 WPM Club'];
        let currentLevel = 'medium';

        function startGame() {
            if (isRunning) return;

            const difficulty = difficultySelect.value;
            timeLeft = difficultyLevels[difficulty].time;
            currentText = difficultyLevels[difficulty].texts[Math.floor(Math.random() * difficultyLevels[difficulty].texts.length)];
            
            textDisplay.innerHTML = currentText.split('').map(char => `<span>${char}</span>`).join('');
            userInput.value = '';
            userInput.disabled = false;
            userInput.focus();

            isRunning = true;
            startButton.disabled = true;
            difficultySelect.disabled = true;

            timer = setInterval(() => {
                timeLeft--;
                timeDisplay.textContent = `Time: ${timeLeft}s`;
                updateTimerBar();
                if (timeLeft === 0) {
                    endGame();
                }
            }, 1000);

            updateDisplay();
        }

        function updateTimerBar() {
            const difficulty = difficultySelect.value;
            const totalTime = difficultyLevels[difficulty].time;
            const percentage = (timeLeft / totalTime) * 100;
            timerProgress.style.width = `${percentage}%`;
        }

        function endGame() {
            clearInterval(timer);
            isRunning = false;
            userInput.disabled = true;
            startButton.disabled = false;
            difficultySelect.disabled = false;
            timerProgress.style.width = '0%';
            calculateResults();
        }

        function calculateResults() {
            const words = userInput.value.trim().split(/\s+/).length;
            const characters = userInput.value.length;
            const accuracy = Math.round((characters - getErrorCount()) / characters * 100);
            const wpm = Math.round((words / (difficultyLevels[difficultySelect.value].time - timeLeft)) * 60);

            wpmDisplay.textContent = `WPM: ${wpm}`;
            accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;

            updateHighScore(wpm);
            updateProgress(wpm, accuracy);
            updateLeaderboard(wpm);
            checkAchievements(wpm, accuracy);

            if (userInput.value === currentText) {
                showCongrats();
            }

            checkLevelUp(wpm);
        }

        function getErrorCount() {
            return userInput.value.split('').reduce((errors, char, i) => {
                return currentText[i] !== char ? errors + 1 : errors;
            }, 0);
        }

        function updateDisplay() {
            const userInputChars = userInput.value.split('');
            textDisplay.innerHTML = currentText.split('').map((char, index) => {
                let className = '';
                if (index < userInputChars.length) {
                    className = char === userInputChars[index] ? 'correct' : 'incorrect';
                }
                return `<span class="${className}">${char}</span>`;
            }).join('');

            // Update keyboard display
            const pressedKey = userInputChars[userInputChars.length - 1];
            updateKeyboard(pressedKey);
        }

        function updateKeyboard(pressedKey) {
            const keys = keyboard.getElementsByClassName('key');
            for (let key of keys) {
                key.classList.remove('active');
                if (key.textContent.toLowerCase() === pressedKey?.toLowerCase()) {
                    key.classList.add('active');
                }
            }
        }

        userInput.addEventListener('input', () => {
            if (isRunning) {
                updateDisplay();
                if (userInput.value === currentText) {
                    endGame();
                }
            }
        });

        startButton.addEventListener('click', startGame);

        // Theme toggle
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? 
                '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });

        function updateHighScore(wpm) {
            const currentHighScore = parseInt(document.getElementById('high-score').textContent);
            if (wpm > currentHighScore) {
                document.getElementById('high-score').textContent = wpm;
            }
        }

        function updateLeaderboard(newWpm) {
            const currentUser = document.getElementById('username').textContent;
            const existingUserIndex = leaderboardData.findIndex(entry => entry.username === currentUser);

            if (existingUserIndex !== -1) {
                // Update existing user's WPM if the new score is higher
                if (newWpm > leaderboardData[existingUserIndex].wpm) {
                    leaderboardData[existingUserIndex].wpm = newWpm;
                }
            } else {
                // Add new user to leaderboard
                leaderboardData.push({ username: currentUser, wpm: newWpm });
            }

            // Sort leaderboard by WPM (descending order)
            leaderboardData.sort((a, b) => b.wpm - a.wpm);

            // Keep only top 10 entries
            leaderboardData = leaderboardData.slice(0, 10);

            // Update leaderboard display
            const leaderboardBody = document.querySelector('#leaderboard-table tbody');
            leaderboardBody.innerHTML = ''; // Clear existing entries
            leaderboardData.forEach((entry, index) => {
                const row = leaderboardBody.insertRow();
                row.insertCell(0).textContent = index + 1;
                row.insertCell(1).textContent = entry.username;
                row.insertCell(2).textContent = entry.wpm;
            });
        }

        // Progress chart
        const ctx = document.getElementById('progress-chart').getContext('2d');
        const progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'WPM',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }, {
                    label: 'Accuracy',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        function updateProgress(wpm, accuracy) {
            const date = new Date().toLocaleDateString();
            progressChart.data.labels.push(date);
            progressChart.data.datasets[0].data.push(wpm);
            progressChart.data.datasets[1].data.push(accuracy);
            progressChart.update();
        }

        function showCongrats() {
            congratsMessage.style.display = 'block';
            congratsMessage.classList.add('pulse');
            
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti(Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
                    emojis: ['🎉', '🎊', '✨', '💥', '🌟'],
                    shapes: ['circle', 'square'],
                }));
                confetti(Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
                    emojis: ['🎉', '🎊', '✨', '💥', '🌟'],
                    shapes: ['circle', 'square'],
                }));
            }, 250);

            setTimeout(() => {
                congratsMessage.style.display = 'none';
                congratsMessage.classList.remove('pulse');
            }, 5000);
        }

        // Initialize keyboard
        const keys = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
        keys.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.className = 'key';
            keyElement.textContent = key;
            keyboard.appendChild(keyElement);
        });

        // Tab functionality
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Achievements
        function checkAchievements(wpm, accuracy) {
            if (wpm >= 50 && !achievements.includes('50 WPM Club')) {
                achievements.push('50 WPM Club');
            }
            if (wpm >= 100 && !achievements.includes('Speed Demon')) {
                achievements.push('Speed Demon');
            }
            if (accuracy === 100 && !achievements.includes('Perfect Accuracy')) {
                achievements.push('Perfect Accuracy');
            }
            updateAchievements();
        }

        function updateAchievements() {
            achievementsContainer.innerHTML = '';
            achievements.forEach(achievement => {
                const achievementElement = document.createElement('span');
                achievementElement.className = 'achievement';
                achievementElement.textContent = achievement;
                achievementsContainer.appendChild(achievementElement);
            });
        }

        function checkLevelUp(wpm) {
            let newLevel = currentLevel;
            if (wpm > 80 && currentLevel !== 'hard') {
                newLevel = 'hard';
            } else if (wpm > 50 && currentLevel === 'easy') {
                newLevel = 'medium';
            }

            if (newLevel !== currentLevel) {
                currentLevel = newLevel;
                showLevelUp();
                difficultySelect.value = currentLevel;
            }
        }

        function showLevelUp() {
            levelUpMessage.style.display = 'block';
            setTimeout(() => {
                levelUpMessage.style.display = 'none';
            }, 2000);
        }

        // Initial setup
        updateLeaderboard(0);
        updateAchievements();