import os
import torch
import torch.nn as nn
from autoencoder_model import TrafficAutoencoder
from gnn_model import TrafficGNN
from data_preprocessing import load_and_preprocess_data

# Define paths
MODEL_DIR = r"d:\CyberProject\V2\backend\models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Load and preprocess the dataset
X_train, X_test, y_train, y_test, feature_names = load_and_preprocess_data()

# Encode labels: 0 for BENIGN, 1 for ATTACK
y_train_encoded = (y_train == 'attack').astype(int).values
y_test_encoded = (y_test == 'attack').astype(int).values

# Convert to PyTorch tensors
X_train_tensor = torch.FloatTensor(X_train.values)
X_test_tensor = torch.FloatTensor(X_test.values)
y_train_tensor = torch.LongTensor(y_train_encoded)
y_test_tensor = torch.LongTensor(y_test_encoded)

### ----------------------------- AUTOENCODER TRAINING ----------------------------- ###
print("Training Autoencoder...")

autoencoder = TrafficAutoencoder(input_dim=19)
ae_criterion = nn.MSELoss()
ae_optimizer = torch.optim.Adam(autoencoder.parameters(), lr=0.001)

for epoch in range(50):
    ae_optimizer.zero_grad()
    reconstructed = autoencoder(X_train_tensor)
    loss = ae_criterion(reconstructed, X_train_tensor)
    loss.backward()
    ae_optimizer.step()
    
    if (epoch + 1) % 10 == 0:
        print(f"[Autoencoder] Epoch {epoch+1}/50 - Loss: {loss.item():.4f}")

# Save autoencoder model weights
torch.save(
    autoencoder.state_dict(),
    os.path.join(MODEL_DIR, "traffic_autoencoder.pt"),
    _use_new_zipfile_serialization=True
)

### ----------------------------- GNN TRAINING ----------------------------- ###
print("\nTraining Graph Neural Network...")

gnn_model = TrafficGNN(num_features=19, hidden_channels=64, num_classes=2)
gnn_criterion = nn.CrossEntropyLoss()
gnn_optimizer = torch.optim.Adam(gnn_model.parameters(), lr=0.001)

# Simplified edge index for fully connected self-loop (replace with graph structure as needed)
edge_index = torch.tensor([
    list(range(len(X_train))),
    list(range(len(X_train)))
], dtype=torch.long)

for epoch in range(50):
    gnn_optimizer.zero_grad()
    predictions = gnn_model(X_train_tensor, edge_index)
    loss = gnn_criterion(predictions, y_train_tensor)
    loss.backward()
    gnn_optimizer.step()
    
    if (epoch + 1) % 10 == 0:
        print(f"[GNN] Epoch {epoch+1}/50 - Loss: {loss.item():.4f}")

# Save GNN model weights
torch.save(
    gnn_model.state_dict(),
    os.path.join(MODEL_DIR, "traffic_gnn_model.pt"),
    _use_new_zipfile_serialization=True
)

print("\n✅ Model training complete. Models saved to:", MODEL_DIR)
