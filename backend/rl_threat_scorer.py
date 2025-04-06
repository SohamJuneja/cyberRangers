import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque, namedtuple
import random
from data_preprocessing import load_and_preprocess_data

# Define the experience structure
Experience = namedtuple('Experience', ['state', 'action', 'reward', 'next_state', 'done'])

# Neural network for DQN
class DQNModel(nn.Module):
    def __init__(self, input_dim, output_dim):
        super(DQNModel, self).__init__()
        self.model = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, output_dim)
        )

    def forward(self, x):
        return self.model(x)

# Agent using DQN for decision making
class RLAgent:
    def __init__(self, input_dim, num_actions):
        self.input_dim = input_dim
        self.num_actions = num_actions

        self.policy_net = DQNModel(input_dim, num_actions)
        self.target_net = DQNModel(input_dim, num_actions)
        self.target_net.load_state_dict(self.policy_net.state_dict())

        self.memory = deque(maxlen=10000)
        self.batch_size = 64
        self.gamma = 0.95
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.optimizer = optim.Adam(self.policy_net.parameters())

    def store_experience(self, state, action, reward, next_state, done):
        self.memory.append(Experience(state, action, reward, next_state, done))

    def select_action(self, state):
        if random.random() < self.epsilon:
            return random.randint(0, self.num_actions - 1)

        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            q_values = self.policy_net(state_tensor)
            return q_values.argmax().item()

    def train_from_memory(self):
        if len(self.memory) < self.batch_size:
            return

        samples = random.sample(self.memory, self.batch_size)

        states = torch.FloatTensor([s.state for s in samples])
        actions = torch.LongTensor([s.action for s in samples])
        rewards = torch.FloatTensor([s.reward for s in samples])
        next_states = torch.FloatTensor([s.next_state for s in samples])
        dones = torch.FloatTensor([s.done for s in samples])

        current_qs = self.policy_net(states).gather(1, actions.unsqueeze(1))
        with torch.no_grad():
            future_qs = self.target_net(next_states).max(1)[0]
        expected_qs = rewards + (1 - dones) * self.gamma * future_qs

        loss = nn.MSELoss()(current_qs.squeeze(), expected_qs)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

    def sync_target_network(self):
        self.target_net.load_state_dict(self.policy_net.state_dict())

# Training logic for the agent
def train_agent(num_episodes=1000):
    X_train, X_test, y_train, y_test, _ = load_and_preprocess_data()

    if X_train is None:
        return None

    state_dim = X_train.shape[1]
    num_actions = 4  # Example: 4 types of response actions
    agent = RLAgent(state_dim, num_actions)

    for episode in range(num_episodes):
        total_reward = 0
        indices = np.random.choice(len(X_train), size=100)
        batch_X = X_train.iloc[indices].values
        batch_y = y_train.iloc[indices]

        for state, label in zip(batch_X, batch_y):
            action = agent.select_action(state)
            is_attack = label != 'BENIGN'

            if is_attack and action > 0:
                reward = 1.0
            elif not is_attack and action == 0:
                reward = 0.5
            else:
                reward = -1.0

            next_state = state + np.random.normal(0, 0.1, state.shape)
            agent.store_experience(state, action, reward, next_state, False)
            agent.train_from_memory()
            total_reward += reward

        if episode % 10 == 0:
            agent.sync_target_network()

        if (episode + 1) % 50 == 0:
            print(f"Episode {episode + 1}: Total Reward = {total_reward:.2f}, Epsilon = {agent.epsilon:.2f}")

    return agent

# Run the training process
if __name__ == "__main__":
    trained_agent = train_agent()
    if trained_agent:
        torch.save({
            'policy_net': trained_agent.policy_net.state_dict(),
            'target_net': trained_agent.target_net.state_dict(),
            'epsilon': trained_agent.epsilon
        }, r"d:\CyberProject\V2\backend\models\threat_scorer_rl.pt")
