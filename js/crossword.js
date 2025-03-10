document.addEventListener('DOMContentLoaded', () => {
    const words = [
        {'word': 'Walvis', 'clue': 'Grote zeezoogdier', 'number': 1, 'direction': 'across', 'x': 1, 'y': 1, 'highlightedLetters': [2]}, // V is highlighted
        {'word': 'Tijger', 'clue': 'Gestreepte grote kat', 'number': 2, 'direction': 'down', 'x': 2, 'y': 0, 'highlightedLetters': [0]}, // T is highlighted
        {'word': 'Quokka', 'clue': 'Klein schattig dier uit Australië', 'number': 3, 'direction': 'down', 'x': 7, 'y': 0, 'highlightedLetters': [0]}, // Q is highlighted
        {'word': 'Luiaard', 'clue': 'Langzaam bewegend bosdier', 'number': 4, 'direction': 'across', 'x': 1, 'y': 3, 'highlightedLetters': [2]}, // I is highlighted
        {'word': 'Dolfijn', 'clue': 'Intelligent zeezoogdier', 'number': 5, 'direction': 'down', 'x': 4, 'y': 2, 'highlightedLetters': [3]}, // F is highlighted
        {'word': 'Tijger', 'clue': 'Gestreepte grote kat', 'number': 6, 'direction': 'across', 'x': 1, 'y': 5, 'highlightedLetters': [2]}, // J is highlighted
        {'word': 'Aap', 'clue': 'Slim primaat uit de jungle', 'number': 7, 'direction': 'down', 'x': 5, 'y': 1, 'highlightedLetters': [0]} // A is highlighted
    ];

    const finalAnswer = 'Vaquita'; // Based on the highlighted letters in the image

    class Crossword {
        constructor(words) {
            this.words = words;
            this.gridSize = 10; // Changed from 20 to 10 since our puzzle is smaller
            this.grid = this.createEmptyGrid();
            this.guessedWords = new Set();
            this.wordPositions = new Map(); // Track positions of each word's letters
            this.placeWords();
        }

        createEmptyGrid() {
            return Array(this.gridSize).fill().map(() => 
                Array(this.gridSize).fill(null)
            );
        }

        placeWords() {
            this.grid = this.createEmptyGrid();
            
            // Debug counter for placed words
            let placedWords = 0;
        
            this.words.forEach(word => {
                const positions = [];
                let isValidPlacement = true;
        
                // First check if placement is valid
                for (let i = 0; i < word.word.length; i++) {
                    const currentX = word.direction === 'across' ? word.x + i : word.x;
                    const currentY = word.direction === 'across' ? word.y : word.y + i;
                    
                    // Check bounds
                    if (currentX >= this.gridSize || currentY >= this.gridSize || currentX < 0 || currentY < 0) {
                        console.error(`Word ${word.word} placement out of bounds at ${currentX},${currentY}`);
                        isValidPlacement = false;
                        break;
                    }
                    
                    // Check if cell is already occupied with a different letter
                    const existingCell = this.grid[currentY][currentX];
                    if (existingCell && existingCell.letter !== word.word[i]) {
                        console.error(`Conflict placing ${word.word} at ${currentX},${currentY} - existing letter: ${existingCell.letter}`);
                        isValidPlacement = false;
                        break;
                    }
                }
                
                if (isValidPlacement) {
                    // Place the word
                    for (let i = 0; i < word.word.length; i++) {
                        const currentX = word.direction === 'across' ? word.x + i : word.x;
                        const currentY = word.direction === 'across' ? word.y : word.y + i;
                        
                        positions.push({
                            x: currentX, 
                            y: currentY, 
                            letter: word.word[i], 
                            highlighted: word.highlightedLetters.includes(i)
                        });
                        
                        this.grid[currentY][currentX] = {
                            letter: word.word[i],
                            highlighted: word.highlightedLetters.includes(i),
                            revealed: false
                        };
                    }
                    this.wordPositions.set(word.word, positions);
                    placedWords++;
                }
            });
            
            // Debug output
            console.log(`Successfully placed ${placedWords} out of ${this.words.length} words`);
            this.printGrid(); // Add this helper method
        }

        // Add this new helper method
        printGrid() {
            console.log('Current grid state:');
            for (let y = 0; y < this.gridSize; y++) {
                let row = '';
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid[y][x]) {
                        row += this.grid[y][x].letter + ' ';
                    } else {
                        row += '_ ';
                    }
                }
                console.log(row);
            }
        }

        renderGrid() {
            const gridContainer = document.querySelector('.crossword-grid');
            gridContainer.innerHTML = '';
            
            // Set responsive grid template columns
            gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    const cell = document.createElement('div');
                    cell.classList.add('grid-cell');
                    const cellData = this.grid[y][x];
                    
                    // Check if this cell is the start of any word
                    const wordStart = this.words.find(word => 
                        (word.x === x && word.y === y)
                    );

                    if (cellData) {
                        cell.dataset.x = x;
                        cell.dataset.y = y;
                        cell.dataset.letter = cellData.letter;
                        
                        if (cellData.revealed) {
                            cell.textContent = cellData.letter;
                            // If the letter is highlighted and revealed, add the highlighted class
                            if (cellData.highlighted) {
                                cell.classList.add('highlighted');
                            }
                        } else {
                            cell.classList.add('hidden-letter');
                        }
                        
                        // Add number if it's the start of a word
                        if (wordStart) {
                            const numberSpan = document.createElement('span');
                            numberSpan.classList.add('cell-number');
                            numberSpan.textContent = wordStart.number;
                            cell.appendChild(numberSpan);
                        }
                    } else {
                        cell.classList.add('empty');
                    }
                    
                    gridContainer.appendChild(cell);
                }
            }
        }

        renderClues() {
            const acrossList = document.getElementById('across-list');
            const downList = document.getElementById('down-list');
            acrossList.innerHTML = '';
            downList.innerHTML = '';

            // Group words by direction
            const acrossWords = this.words.filter(w => w.direction === 'across');
            const downWords = this.words.filter(w => w.direction === 'down');

            // Render Across clues
            if (acrossWords.length > 0) {
                const acrossTitle = document.createElement('h2');
                acrossTitle.textContent = 'Horizontaal';
                acrossList.appendChild(acrossTitle);

                acrossWords.forEach(wordObj => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>${wordObj.number}.</strong> ${wordObj.clue}
                        <input type="text" class="word-guess" data-word="${wordObj.word}" 
                        data-direction="${wordObj.direction}" data-number="${wordObj.number}"
                        placeholder="Typ het woord">
                        <span class="guess-result"></span>
                    `;
                    acrossList.appendChild(li);
                });
            }

            // Render Down clues
            if (downWords.length > 0) {
                const downTitle = document.createElement('h2');
                downTitle.textContent = 'Verticaal';
                downList.appendChild(downTitle);

                downWords.forEach(wordObj => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>${wordObj.number}.</strong> ${wordObj.clue}
                        <input type="text" class="word-guess" data-word="${wordObj.word}"
                        data-direction="${wordObj.direction}" data-number="${wordObj.number}"
                        placeholder="Typ het woord">
                        <span class="guess-result"></span>
                    `;
                    downList.appendChild(li);
                });
            }
        }

        revealWord(word) {
            const positions = this.wordPositions.get(word);
            if (!positions) return;
            
            // Update the grid data
            positions.forEach(pos => {
                if (this.grid[pos.y][pos.x]) {
                    this.grid[pos.y][pos.x].revealed = true;
                    // Only set highlighted true if this position was meant to be highlighted
                    if (pos.highlighted) {
                        this.grid[pos.y][pos.x].highlighted = true;
                    }
                }
            });
            
            // Update the visual grid
            const gridCells = document.querySelectorAll('.grid-cell');
            gridCells.forEach(cell => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                
                // If the cell is part of the guessed word's positions
                const isPartOfWord = positions.some(pos => pos.x === x && pos.y === y);
                if (isPartOfWord) {
                    const cellData = this.grid[y][x];
                    cell.textContent = cellData.letter;
                    cell.classList.remove('hidden-letter');
                    
                    if (cellData.highlighted) {
                        cell.classList.add('highlighted');
                    }
                }
            });
        }
    }

    const crossword = new Crossword(words);
    crossword.renderGrid();
    crossword.renderClues();

    const checkAnswerBtn = document.getElementById('check-answer');
    const answerInput = document.getElementById('answer-input');
    const resultMessage = document.getElementById('result-message');

    // Add CSS for highlighted letters
    const style = document.createElement('style');
    style.textContent = `
        .grid-cell.highlighted {
            background-color: #d4a6e3 !important; /* Purple color for highlighted cells */
        }
        
        /* Improved media queries */
        @media screen and (max-width: 768px) {
            .crossword-grid {
                grid-template-columns: repeat(${crossword.gridSize}, 35px) !important;
            }
            
            .grid-cell {
                width: 35px;
                height: 35px;
            }
            
            .clues {
                flex-direction: column;
            }
            
            .across-clues, .down-clues {
                width: 100%;
                margin-bottom: 1rem;
            }
        }
        
        @media screen and (max-width: 480px) {
            .crossword-grid {
                grid-template-columns: repeat(${crossword.gridSize}, 28px) !important;
            }
            
            .grid-cell {
                width: 28px;
                height: 28px;
                font-size: 12px;
            }
        }
    `;
    document.head.appendChild(style);

    // Word guessing logic
    document.querySelectorAll('.word-guess').forEach(input => {
        input.addEventListener('change', (e) => {
            const wordInput = e.target;
            const correctWord = wordInput.dataset.word;
            const guessedWord = wordInput.value.trim();
            const resultSpan = wordInput.nextElementSibling;

            if (guessedWord.toLowerCase() === correctWord.toLowerCase()) {
                resultSpan.textContent = '✓';
                resultSpan.style.color = 'green';
                crossword.guessedWords.add(correctWord);
                wordInput.disabled = true;

                // Reveal only the letters for the guessed word
                crossword.revealWord(correctWord);
            } else {
                resultSpan.textContent = '✗';
                resultSpan.style.color = 'red';
            }
        });
    });

    // Final answer checking
    checkAnswerBtn.addEventListener('click', () => {
        const userAnswer = answerInput.value.trim();
        
        // Check if all words are guessed first
        if (crossword.guessedWords.size !== words.length) {
            resultMessage.textContent = 'Je moet eerst alle woorden goed raden!';
            resultMessage.style.color = 'red';
            return;
        }

        if (userAnswer.toLowerCase() === finalAnswer.toLowerCase()) {
            resultMessage.textContent = 'Geweldig! Je hebt het eindantwoord gevonden!';
            resultMessage.style.color = 'green';
        } else {
            resultMessage.textContent = 'Helaas, probeer het opnieuw.';
            resultMessage.style.color = 'red';
        }
    });
});
