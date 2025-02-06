document.addEventListener('DOMContentLoaded', () => {
    let player1col = "#0f9";
    let player2col = "#f09";
    const ROWS = 6;
    const COLS = 7;
    const board = document.getElementById('board');
    const message = document.getElementById('message');
    const restartButton = document.getElementById('restart');
    let movebase2 = [];
    let game_over = false;
    let currentPlayer = 'Player1';

    function createBoard() {
        board.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell', 'empty');
                cell.dataset.row = r;
                cell.dataset.column = c;
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('mouseenter', handleCellHover);
                cell.addEventListener('mouseleave', handleCellLeave);
                board.appendChild(cell);
            }
        }
    }

    function handleCellClick(event) {
        const column = event.target.dataset.column;
        if (!game_over) {
            let row = findAvailableRow(column);
            if (row !== null) {
                const cell = board.querySelector(`[data-row="${row}"][data-column="${column}"]`);
                cell.classList.remove('empty');
                cell.classList.add(currentPlayer === 'Player1' ? 'player1' : 'player2');
                movebase2.push(`${row},${column}`);
                checkForWin(row, column);
                checkForDraw();
                if (!game_over) {
                    currentPlayer = currentPlayer === 'Player1' ? 'Player2' : 'Player1';
                    updateBackgroundGradient();
                    message.textContent = `${currentPlayer}'s turn`;
                }
            } else {
                alert("Column is full. Choose another column.");
            }
        }
    }

    function handleCellHover(event) {
        if (!game_over) {
            const column = event.target.dataset.column;
            const cells = board.querySelectorAll(`[data-column="${column}"]:not(.player1):not(.player2)`);
            cells.forEach(cell => {
                cell.style.opacity = '0.5';
            });
        }
    }

    function handleCellLeave(event) {
        const cells = board.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.style.opacity = '1';
        });
    }

    function findAvailableRow(column) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!movebase2.includes(`${r},${column}`)) {
                return r;
            }
        }
        return null;
    }

    function checkForWin(row, column) {
        if (checkDirection(row, column, 1, 0) || // Horizontal
            checkDirection(row, column, 0, 1) || // Vertical
            checkDirection(row, column, 1, 1) || // Diagonal down-right
            checkDirection(row, column, 1, -1)) { // Diagonal down-left
            highlightWinningSquares(row, column);
            gameover(currentPlayer);
        }
    }

    function checkDirection(row, column, rowIncrement, columnIncrement) {
        let count = 0;
        let symbol = movebase2.indexOf(`${row},${column}`) % 2;

        for (let i = -3; i <= 3; i++) {
            const r = parseInt(row) + i * rowIncrement;
            const c = parseInt(column) + i * columnIncrement;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && movebase2.includes(`${r},${c}`) && movebase2.indexOf(`${r},${c}`) % 2 === symbol) {
                count++;
                if (count === 4) {
                    return true;
                }
            } else {
                count = 0;
            }
        }
        return false;
    }

    function highlightWinningSquares(row, column) {
        let symbol = movebase2.indexOf(`${row},${column}`) % 2;
        let directions = [
            [1, 0], // Horizontal
            [0, 1], // Vertical
            [1, 1], // Diagonal down-right
            [1, -1] // Diagonal down-left
        ];

        directions.forEach(([rowIncrement, columnIncrement]) => {
            let winningSquares = [];
            for (let i = -3; i <= 3; i++) {
                const r = parseInt(row) + i * rowIncrement;
                const c = parseInt(column) + i * columnIncrement;
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS && movebase2.includes(`${r},${c}`) && movebase2.indexOf(`${r},${c}`) % 2 === symbol) {
                    winningSquares.push({ row: r, column: c });
                    if (winningSquares.length === 4) {
                        break;
                    }
                } else {
                    winningSquares = [];
                }
            }

            if (winningSquares.length === 4) {
                winningSquares.forEach(square => {
                    const cell = board.querySelector(`[data-row="${square.row}"][data-column="${square.column}"]`);
                    cell.classList.add('win');
                });
            }
        });
    }

    function checkForDraw() {
        if (movebase2.length === ROWS * COLS) {
            gameover('Draw');
        }
    }

    function gameover(winner) {
        if (winner === 'Draw') {
            message.textContent = 'It\'s a draw!';
        } else {
            message.textContent = `${winner} wins!`;
        }
        game_over = true;
    }

    function updateBackgroundGradient() {
        const gradientColor = currentPlayer === 'Player1' ? player1col : player2col;
        document.body.style.background = `linear-gradient(135deg, ${gradientColor} 0%, #3a3a3a 100%)`;
    }    

    restartButton.addEventListener('click', () => {
        movebase2 = [];
        game_over = false;
        currentPlayer = 'Player1';
        message.textContent = `${currentPlayer}'s turn`;
        clearBoard();
        createBoard();
    });

    function clearBoard() {
        const cells = board.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('player1', 'player2', 'win');
            cell.classList.add('empty');
        });
    }

    createBoard();
});
