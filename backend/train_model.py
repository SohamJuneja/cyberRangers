from rl_threat_scorer import train_rl_model

def main():
    print("Initializing threat scoring model training...")

    # Train the RL model
    trained_agent = train_rl_model(episodes=1000)

    if trained_agent:
        print("Training successfully completed!")
    else:
        print("Training aborted: No data available.")

if __name__ == "__main__":
    main()
