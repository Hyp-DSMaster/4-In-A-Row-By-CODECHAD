ROWS = 6
COLS = 7
movebase = []
movebase2 = []
game_over = False
turn = "Player1"

def gameover(Winner):
    global game_over
    if Winner == "Player1":
        print("Player 1 Wins!")
        game_over = True
        input("Press Enter to exit")
        exit()
    if Winner == "Player2":
        print("Player 2 Wins!")
        game_over = True
        input("Press Enter to exit")
        exit()
    if Winner == "Draw":
        print("Draw")
        game_over = True
        input("Press Enter to exit")
        exit()

def checkfordraw():
    if len(movebase2) == ROWS * COLS:
        gameover("Draw")

def checkforwin():
    for i in range(ROWS):
        for j in range(COLS):
            if (i, j) in movebase2:
                symbol = movebase2.index((i, j)) % 2
                if j <= COLS - 4:
                    if all((i, j + k) in movebase2 and movebase2.index((i, j + k)) % 2 == symbol for k in range(4)):
                        gameover(turn)
                if i <= ROWS - 4:
                    if all((i + k, j) in movebase2 and movebase2.index((i + k, j)) % 2 == symbol for k in range(4)):
                        gameover(turn)
                if i <= ROWS - 4 and j <= COLS - 4:
                    if all((i + k, j + k) in movebase2 and movebase2.index((i + k, j + k)) % 2 == symbol for k in range(4)):
                        gameover(turn)
                if i <= ROWS - 4 and j >= 3:
                    if all((i + k, j - k) in movebase2 and movebase2.index((i + k, j - k)) % 2 == symbol for k in range(4)):
                        gameover(turn)

    return False

def create_board(rows, columns):
    for i in range(rows):
        for j in range(columns):
            if (i,j) in movebase2:
                if movebase2.index((i,j)) % 2 == 0:
                    print("|"+"x",end="")
                else:
                    print("|"+"o",end="")
            else:
                print("|"+" ",end="")
        print("|")

def playmove(player):
    height = 0
    move = 0
    checkfordraw()
    checkforwin()
    if game_over == False:
        while True:
            try:
                if player == "Player1":
                    move = int(input("Player 1, Move ")) - 1
                if player == "Player2":
                    move = int(input("Player 2, Move ")) - 1
                if 0<= move <= COLS - 1:
                    break
                else:
                    print("Type A Valid Column")
            except ValueError:
                print("Type a Valid Column")
    for i in movebase:
        if move in movebase:
            height = height = movebase.count(move) + 1
    height = ROWS-height
    if height == ROWS:
        height = ROWS - 1
    if height <= -1:
        if game_over == False:
            print("Column Full")
            playmove(player)
    movebase.append(move)
    movebase2.append((height,move))
 #   print(f"movebase={movebase}")
#  print(f"movebase2={movebase2}")
    if player == "Player2":
        create_board(ROWS,COLS,)
    if player == "Player1":
        create_board(ROWS,COLS,)

create_board(ROWS,COLS)
i = 0
while game_over == False:
    if i == 0:    
        playmove("Player1")
        turn = "Player1"
        i = 1
    else:
        playmove("Player2")
        turn = "Player2"
        i = 0