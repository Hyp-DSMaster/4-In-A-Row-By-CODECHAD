import numpy as np
import math
import random

ROWS = 6
COLS = 7
movebase2 = []
game_over = False
turn = "Player1"

def gameover(winner):
    global game_over
    if winner == "Player1":
        print("Player 1 Wins!")
    elif winner == "Player2":
        print("Player 2 Wins!")
    elif winner == "Draw":
        print("Draw")
    game_over = True
    input("Press Enter to exit")
    exit()

def checkfordraw():
    if len(movebase2) == ROWS * COLS:
        gameover("Draw")

def checkforwin():
    directions = [(0, 1), (1, 0), (1, 1), (-1, 1)]
    for i in range(ROWS):
        for j in range(COLS):
            if (i, j) in movebase2:
                symbol = movebase2.index((i, j)) % 2
                for d in directions:
                    di, dj = d
                    count = 0
                    while (0 <= i + count * di < ROWS and
                           0 <= j + count * dj < COLS and
                           (i + count * di, j + count * dj) in movebase2 and
                           movebase2.index((i + count * di, j + count * dj)) % 2 == symbol):
                        count += 1
                    if count >= 4:
                        gameover(turn)

def create_board():
    for i in range(ROWS-1, -1, -1):
        for j in range(COLS):
            if (i, j) in movebase2:
                if movebase2.index((i, j)) % 2 == 0:
                    print("|X", end="")
                else:
                    print("|O", end="")
            else:
                print("| ", end="")
        print("|")
    print("+" + "---+" * COLS)

def playmove(player):
    global movebase2, turn, game_over
    checkfordraw()
    checkforwin()
    
    if game_over:
        return
    
    if player == "Player1":
        while True:
            try:
                move = int(input("Player 1, Move (1-7): ")) - 1
                if 0 <= move < COLS and (ROWS-1, move) not in movebase2:
                    break
                else:
                    print("Invalid move. Please choose a valid column.")
            except ValueError:
                print("Invalid input. Please enter a number.")

    elif player == "Player2":
        move = get_best_move()

    row = next((r for r in range(ROWS) if (r, move) not in movebase2), None)
    movebase2.append((row, move))
    create_board()

def get_valid_locations(board):
    return [c for c in range(COLS) if board[ROWS-1][c] == 0]

def is_valid_location(board, col):
    return board[ROWS-1][col] == 0

def drop_piece(board, row, col, piece):
    board[row][col] = piece

def winning_move(board, piece):
    # Check horizontal locations
    for c in range(COLS-3):
        for r in range(ROWS):
            if board[r][c] == piece and board[r][c+1] == piece and board[r][c+2] == piece and board[r][c+3] == piece:
                return True

    # Check vertical locations
    for c in range(COLS):
        for r in range(ROWS-3):
            if board[r][c] == piece and board[r+1][c] == piece and board[r+2][c] == piece and board[r+3][c] == piece:
                return True

    # Check positively sloped diagonals
    for c in range(COLS-3):
        for r in range(ROWS-3):
            if board[r][c] == piece and board[r+1][c+1] == piece and board[r+2][c+2] == piece and board[r+3][c+3] == piece:
                return True

    # Check negatively sloped diagonals
    for c in range(COLS-3):
        for r in range(3, ROWS):
            if board[r][c] == piece and board[r-1][c+1] == piece and board[r-2][c+2] == piece and board[r-3][c+3] == piece:
                return True

    return False

def evaluate_window(window, piece):
    score = 0
    opp_piece = 1 if piece == 2 else 2

    if window.count(piece) == 4:
        score += 100
    elif window.count(piece) == 3 and window.count(0) == 1:
        score += 5
    elif window.count(piece) == 2 and window.count(0) == 2:
        score += 2

    if window.count(opp_piece) == 3 and window.count(0) == 1:
        score -= 4

    return score

def score_position(board, piece):
    score = 0

    # Score center column
    center_array = [int(i) for i in list(board[:, COLS//2])]
    center_count = center_array.count(piece)
    score += center_count * 3

    # Score Horizontal
    for r in range(ROWS):
        row_array = [int(i) for i in list(board[r,:])]
        for c in range(COLS-3):
            window = row_array[c:c+4]
            score += evaluate_window(window, piece)

    # Score Vertical
    for c in range(COLS):
        col_array = [int(i) for i in list(board[:,c])]
        for r in range(ROWS-3):
            window = col_array[r:r+4]
            score += evaluate_window(window, piece)

    # Score positive sloped diagonal
    for r in range(ROWS-3):
        for c in range(COLS-3):
            window = [board[r+i][c+i] for i in range(4)]
            score += evaluate_window(window, piece)

    # Score negatively sloped diagonal
    for r in range(ROWS-3):
        for c in range(COLS-3):
            window = [board[r+3-i][c+i] for i in range(4)]
            score += evaluate_window(window, piece)

    return score

def is_terminal_node(board):
    return winning_move(board, 1) or winning_move(board, 2) or len(get_valid_locations(board)) == 0

def minimax(board, depth, maximizing_player):
    valid_locations = get_valid_locations(board)
    is_terminal = is_terminal_node(board)

    if depth == 0 or is_terminal:
        if is_terminal:
            if winning_move(board, 2):
                return (None, 100000000000000)
            elif winning_move(board, 1):
                return (None, -10000000000000)
            else: # Game is over, no more valid moves
                return (None, 0)
        else: # Depth is zero
            return (None, score_position(board, 2))
    if maximizing_player:
        value = -math.inf
        column = random.choice(valid_locations)
        for col in valid_locations:
            row = next((r for r in range(ROWS) if board[r][col] == 0), None)
            temp_board = board.copy()
            drop_piece(temp_board, row, col, 2)
            new_score = minimax(temp_board, depth-1, False)[1]
            if new_score > value:
                value = new_score
                column = col
        return column, value
    else: # Minimizing player
        value = math.inf
        column = random.choice(valid_locations)
        for col in valid_locations:
            row = next((r for r in range(ROWS) if board[r][col] == 0), None)
            temp_board = board.copy()
            drop_piece(temp_board, row, col, 1)
            new_score = minimax(temp_board, depth-1, True)[1]
            if new_score < value:
                value = new_score
                column = col
        return column, value

def get_best_move():
    board = np.zeros((ROWS, COLS))
    for idx, (i, j) in enumerate(movebase2):
        piece = 1 if idx % 2 == 0 else 2
        board[i][j] = piece

    depth = 4
    col, minimax_score = minimax(board, depth, True)
    return col

create_board()
i = 0
while not game_over:
    if i == 0:
        playmove("Player1")
        turn = "Player1"
        i = 1
    else:
        playmove("Player2")
        turn = "Player2"
        i = 0
