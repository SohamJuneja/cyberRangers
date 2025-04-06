import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from sklearn.metrics import precision_recall_curve
from data_preprocessing import load_and_preprocess_data

class DDoSAutoencoder(nn.Module):
    """
    Autoencoder-based anomaly detection model for identifying DDoS traffic.
    """
    def __init__(self, input_features):
        super().__init__()

        self.encoder = nn.Sequential(
            nn.Linear(input_features, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU()
        )

        self.decoder = nn.Sequential(
            nn.Linear(16, 32),
            nn.ReLU(),
            nn.Linear(32, 64),
            nn.ReLU(),
            nn.Linear(64, input_features),
            nn.Sigmoid()
        )

    def forward(self, x):
        compressed = self.encoder(x)
        reconstructed = self.decoder(compressed)
        return reconstructed

def train_ddos_detector(max_records=100000):
    """
    Trains the autoencoder on benign network traffic to learn typical patterns.
    """
    X_train, X_test, y_train, y_test, _ = load_and_preprocess_data()

    if X_train is None:
        print("Data loading failed. Exiting training.")
        return None, None

    # Convert data into tensors for PyTorch processing
    train_data = torch.tensor(X_train.values, dtype=torch.float32)
    test_data = torch.tensor(X_test.values, dtype=torch.float32)

    model = DDoSAutoencoder(input_features=X_train.shape[1])
    loss_function = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    epochs = 50
    batch_size = 256

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0

        for i in range(0, len(train_data), batch_size):
            batch_input = train_data[i:i + batch_size]

            prediction = model(batch_input)
            loss = loss_function(prediction, batch_input)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        if (epoch + 1) % 5 == 0:
            avg_loss = total_loss / len(train_data)
            print(f"Epoch {epoch+1}/{epochs} - Avg Loss: {avg_loss:.6f}")

    # ----------------------
    # Model Evaluation Phase
    # ----------------------
    model.eval()
    with torch.no_grad():
        reconstructed = model(test_data)
        reconstruction_errors = torch.mean((test_data - reconstructed) ** 2, dim=1).numpy()

        # Binary labels: 1 = DDoS, 0 = Benign
        true_labels = np.where(y_test != 'BENIGN', 1, 0)

        # Precision-Recall based thresholding
        precisions, recalls, thresholds = precision_recall_curve(true_labels, reconstruction_errors)
        f1_scores = 2 * (precisions * recalls) / (precisions + recalls + 1e-10)  # Avoid divide by zero
        best_threshold = thresholds[np.argmax(f1_scores[:-1])]

        print(f"\nSelected optimal threshold: {best_threshold:.6f}")
        predictions = (reconstruction_errors > best_threshold).astype(int)
        accuracy = np.mean(predictions == true_labels)
        print(f"Overall detection accuracy: {accuracy:.4f}")

    return model, best_threshold

if __name__ == "__main__":
    model, threshold = train_ddos_detector()
    if model:
        torch.save({
            'model_state_dict': model.state_dict(),
            'threshold': threshold
        }, r"d:\CyberProject\V2\backend\models\traffic_autoencoder.pt")
