import numpy as np

# Define Connect Four environment and game functions

ROWS = 6
COLS = 7

class ConnectFour:
    def __init__(self):
        self.board = np.zeros((ROWS, COLS), dtype=int)
        self.current_player = 1  # Player 1 starts
        self.winning_reward = 1
        self.losing_reward = -1
        self.draw_reward = 0
        self.turns = 0

    def reset(self):
        self.board = np.zeros((ROWS, COLS), dtype=int)
        self.current_player = 1
        self.turns = 0
        return self.board.copy()  # Return initial board state

    def get_valid_locations(self):
        return [c for c in range(COLS) if self.board[ROWS-1][c] == 0]

    def is_valid_location(self, col):
        return self.board[ROWS-1][col] == 0

    def drop_piece(self, row, col, piece):
        self.board[row][col] = piece

    def winning_move(self, piece):
        # Check for winning condition
        pass  # Implement your winning condition logic

    def get_reward(self):
        if self.winning_move(1):
            return self.winning_reward
        elif self.winning_move(2):
            return self.losing_reward
        elif self.turns >= ROWS * COLS:
            return self.draw_reward
        else:
            return 0

    def step(self, action):
        # Execute action (drop piece in specified column)
        col = action
        if not self.is_valid_location(col):
            return self.board.copy(), 0, False  # Invalid move

        row = next((r for r in range(ROWS) if self.board[r][col] == 0), None)
        self.drop_piece(row, col, self.current_player)
        self.turns += 1

        reward = self.get_reward()
        done = reward != 0

        # Switch player turn
        self.current_player = 2 if self.current_player == 1 else 1

        return self.board.copy(), reward, done

# Define Q-Learning agent

class QLearningAgent:
    def __init__(self, action_space_size):
        self.action_space_size = action_space_size
        self.q_table = np.zeros((ROWS * COLS, action_space_size))
        self.learning_rate = 0.1
        self.discount_factor = 0.99
        self.epsilon = 1.0
        self.epsilon_decay = 0.999
        self.epsilon_min = 0.01

    def state_to_index(self, state):
        if state is None:
            return 0  # Handle None state gracefully
        return state.flatten().dot(3 ** np.arange(state.size)[::-1])  # Example transformation

    def choose_action(self, state):
        if np.random.rand() < self.epsilon:
            return np.random.choice(self.action_space_size)  # Exploration
        else:
            state_index = self.state_to_index(state)
            return np.argmax(self.q_table[state_index])  # Exploitation

    def update_q_table(self, state, action, reward, next_state):
        state_index = self.state_to_index(state)
        next_state_index = self.state_to_index(next_state)
        
        max_next_q = np.max(self.q_table[next_state_index])
        current_q = self.q_table[state_index, action]
        
        self.q_table[state_index, action] = current_q + self.learning_rate * (
            reward + self.discount_factor * max_next_q - current_q
        )

    def decay_epsilon(self):
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

# Training loop

env = ConnectFour()
agent = QLearningAgent(action_space_size=COLS)

episodes = 10000

for episode in range(episodes):
    state = env.reset()
    done = False

    while not done:
        action = agent.choose_action(state)
        next_state, reward, done = env.step(action)
        agent.update_q_table(state, action, reward, next_state)
        state = next_state

    agent.decay_epsilon()

# After training, use the agent to play Connect Four
# Implement your evaluation and testing logic here
