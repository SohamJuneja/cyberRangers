from rl_threat_scorer import train_reinforcement_model

def initialize_training():
    print("Starting model training process...")
    agent = train_reinforcement_model(training_episodes=1000)
    print("Training workflow completed successfully!")

if __name__ == "__main__":
    initialize_training()