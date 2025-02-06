document.addEventListener('DOMContentLoaded', () => {
    const player1col = "#0f9";
    const player2col = "#f09";
    const ROWS = 6;
    const COLS = 7;
    const board = document.getElementById('board');
    const message = document.getElementById('message');
    const restartButton = document.getElementById('restart');
    const evaluationBar = document.getElementById('evaluation-bar');
    let moveHistory = [];
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
        if (!game_over && currentPlayer === 'Player1') {
            const column = parseInt(event.target.dataset.column);
            playMove("Player1", column);
        }
    }

    function playMove(player, column) {
        const row = findAvailableRow(column);
        if (row !== null) {
            const cell = board.querySelector(`[data-row="${row}"][data-column="${column}"]`);
            cell.classList.remove('empty');
            cell.classList.add(player === 'Player1' ? 'player1' : 'player2');
            moveHistory.push({ player, row, column });
            checkForWin(row, column);
            checkForDraw();
            if (!game_over) {
                currentPlayer = currentPlayer === 'Player1' ? 'Player2' : 'Player1';
                updateBackgroundGradient();
                message.textContent = `${currentPlayer}'s turn`;
                if (currentPlayer === 'Player2') {
                    setTimeout(() => {
                        const aiColumn = getBestMove();
                        playMove("Player2", aiColumn);
                    }, 1000); // Delay AI move for 1 second (adjust as needed)
                }
            }
        } else {
            alert("Column is full. Choose another column.");
        }
    }

    function handleCellHover(event) {
        if (!game_over && currentPlayer === 'Player1') {
            const column = parseInt(event.target.dataset.column);
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
            if (!moveHistory.some(move => move.column === column && move.row === r)) {
                return r;
            }
        }
        return null;
    }

    function checkForWin(row, column) {
        const directions = [
            [1, 0], // Horizontal
            [0, 1], // Vertical
            [1, 1], // Diagonal down-right
            [1, -1] // Diagonal down-left
        ];

        for (const [rowIncrement, columnIncrement] of directions) {
            let count = 1;
            for (let i = 1; i <= 3; i++) {
                const r = row + rowIncrement * i;
                const c = column + columnIncrement * i;
                if (isValidMove(r, c, currentPlayer)) {
                    count++;
                } else {
                    break;
                }
            }
            for (let i = 1; i <= 3; i++) {
                const r = row - rowIncrement * i;
                const c = column - columnIncrement * i;
                if (isValidMove(r, c, currentPlayer)) {
                    count++;
                } else {
                    break;
                }
            }
            if (count >= 4) {
                highlightWinningSquares(row, column, rowIncrement, columnIncrement);
                gameover(currentPlayer);
                return;
            }
        }
    }

    function isValidMove(row, column, player) {
        return row >= 0 && row < ROWS && column >= 0 && column < COLS &&
            moveHistory.some(move => move.row === row && move.column === column && move.player === player);
    }

    function highlightWinningSquares(row, column, rowIncrement, columnIncrement) {
        const cells = [];
        cells.push({ row, column });
        for (let i = 1; i <= 3; i++) {
            const r1 = row + rowIncrement * i;
            const c1 = column + columnIncrement * i;
            if (isValidMove(r1, c1, currentPlayer)) {
                cells.push({ row: r1, column: c1 });
            } else {
                break;
            }
        }
        for (let i = 1; i <= 3; i++) {
            const r2 = row - rowIncrement * i;
            const c2 = column - columnIncrement * i;
            if (isValidMove(r2, c2, currentPlayer)) {
                cells.push({ row: r2, column: c2 });
            } else {
                break;
            }
        }
        cells.forEach(({ row, column }) => {
            const cell = board.querySelector(`[data-row="${row}"][data-column="${column}"]`);
            cell.classList.add('win');
        });
    }

    function checkForDraw() {
        if (moveHistory.length === ROWS * COLS) {
            gameover('Draw');
        }
    }

    function gameover(winner) {
        game_over = true;
        if (winner === 'Draw') {
            message.textContent = 'It\'s a draw!';
        } else {
            message.textContent = `${winner} wins!`;
        }
    }

    function updateBackgroundGradient() {
        const gradientColor = currentPlayer === 'Player1' ? player1col : player2col;
        document.body.style.background = `linear-gradient(135deg, ${gradientColor} 0%, #3a3a3a 100%)`;
    }

    restartButton.addEventListener('click', () => {
        moveHistory = [];
        game_over = false;
        currentPlayer = 'Player1';
        message.textContent = `${currentPlayer}'s turn`;
        clearBoard();
    });

    function clearBoard() {
        const cells = board.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('player1', 'player2', 'win');
            cell.classList.add('empty');
        });
    }

    function getBestMove() {
        const boardState = createBoardState();
        const depth = 4; // Adjust depth as needed
        const [col, minimaxScore] = minimax(boardState, depth, true);
        return col;
    }

    function createBoardState() {
        const boardState = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 0));
        moveHistory.forEach(({ player, row, column }) => {
            boardState[row][column] = player === 'Player1' ? 1 : 2;
        });
        return boardState;
    }

    function minimax(board, depth, maximizingPlayer) {
        const validLocations = getValidLocations(board);
        const isTerminal = isTerminalNode(board);

        if (depth === 0 || isTerminal) {
            if (isTerminal) {
                if (winningMove(board, 2)) {
                    return [null, 100000000000000];
                } else if (winningMove(board, 1)) {
                    return [null, -10000000000000];
                } else {
                    return [null, 0];
                }
            } else {
                return [null, scorePosition(board, 2)];
            }
        }

        if (maximizingPlayer) {
            let value = -Infinity;
            let column = validLocations[Math.floor(Math.random() * validLocations.length)];
            for (const col of validLocations) {
                const row = getRowForColumn(board, col);
                const tempBoard = copyBoard(board);
                dropPiece(tempBoard, row, col, 2);
                const newScore = minimax(tempBoard, depth - 1, false)[1];
                if (newScore > value) {
                    value = newScore;
                    column = col;
                }
            }
            return [column, value];
        } else {
            let value = Infinity;
            let column = validLocations[Math.floor(Math.random() * validLocations.length)];
            for (const col of validLocations) {
                const row = getRowForColumn(board, col);
                const tempBoard = copyBoard(board);
                dropPiece(tempBoard, row, col, 1);
                const newScore = minimax(tempBoard, depth - 1, true)[1];
                if (newScore < value) {
                    value = newScore;
                    column = col;
                }
            }
            return [column, value];
        }
    }

    function getValidLocations(board) {
        const validLocations = [];
        for (let col = 0; col < COLS; col++) {
            if (board[0][col] === 0) {
                validLocations.push(col);
            }
        }
        return validLocations;
    }

    function isTerminalNode(board) {
        return winningMove(board, 1) || winningMove(board, 2) || getValidLocations(board).length === 0;
    }

    function winningMove(board, player) {
        // Check horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (board[r][c] === player &&
                    board[r][c + 1] === player &&
                    board[r][c + 2] === player &&
                    board[r][c + 3] === player) {
                    return true;
                }
            }
        }
        // Check vertical
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c] === player &&
                    board[r + 1][c] === player &&
                    board[r + 2][c] === player &&
                    board[r + 3][c] === player) {
                    return true;
                }
            }
        }
        // Check diagonal
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (board[r][c] === player &&
                    board[r + 1][c + 1] === player &&
                    board[r + 2][c + 2] === player &&
                    board[r + 3][c + 3] === player) {
                    return true;
                }
            }
        }
        // Check anti-diagonal
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 3; c < COLS; c++) {
                if (board[r][c] === player &&
                    board[r + 1][c - 1] === player &&
                    board[r + 2][c - 2] === player &&
                    board[r + 3][c - 3] === player) {
                    return true;
                }
            }
        }
        return false;
    }

    function getRowForColumn(board, col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][col] === 0) {
                return r;
            }
        }
        return null;
    }

    function dropPiece(board, row, col, player) {
        board[row][col] = player;
    }

    function copyBoard(board) {
        return board.map(arr => arr.slice());
    }

    function scorePosition(board, player) {
        let score = 0;

        // Center column score
        const centerArray = board.map(row => row[Math.floor(COLS / 2)]);
        const centerCount = centerArray.filter(val => val === player).length;
        score += centerCount * 3;

        // Horizontal score
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                const window = board[r].slice(c, c + 4);
                score += evaluateWindow(window, player);
            }
        }

        // Vertical score
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r <= ROWS - 4; r++) {
                const window = [];
                for (let i = 0; i < 4; i++) {
                    window.push(board[r + i][c]);
                }
                score += evaluateWindow(window, player);
            }
        }

        // Diagonal score
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                const window = [];
                for (let i = 0; i < 4; i++) {
                    window.push(board[r + i][c + i]);
                }
                score += evaluateWindow(window, player);
            }
        }

        // Anti-diagonal score
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 3; c < COLS; c++) {
                const window = [];
                for (let i = 0; i < 4; i++) {
                    window.push(board[r + i][c - i]);
                }
                score += evaluateWindow(window, player);
            }
        }

        return score;
    }

    function evaluateWindow(window, player) {
        const opponent = player === 1 ? 2 : 1;
        let score = 0;

        const countPlayer = window.filter(val => val === player).length;
        const countOpponent = window.filter(val => val === opponent).length;

        if (countPlayer === 4) {
            score += 10000;
        } else if (countPlayer === 3 && countOpponent === 0) {
            score += 5;
        } else if (countPlayer === 2 && countOpponent === 0) {
            score += 2;
        }

        if (countOpponent === 3 && countPlayer === 0) {
            score -= 4;
        }

        return score;
    }

    createBoard();
});
