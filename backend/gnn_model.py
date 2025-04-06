import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv
from torch_geometric.data import Data
import pandas as pd
import numpy as np
from data_preprocessing import load_and_preprocess_data

class TrafficGNN(torch.nn.Module):
    def __init__(self, num_features, hidden_channels, num_classes):
        super(TrafficGNN, self).__init__()
        self.conv1 = GCNConv(num_features, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        self.conv3 = GCNConv(hidden_channels, num_classes)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)

        x = self.conv2(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)

        x = self.conv3(x, edge_index)
        return F.log_softmax(x, dim=1)

def create_graph_data(X, y, k=10):
    # Convert input features to tensor format
    x = torch.FloatTensor(X.values)
    num_nodes = len(X)
    edge_list = []

    # Divide processing into manageable batches
    step = 1000
    for start in range(0, num_nodes, step):
        stop = min(start + step, num_nodes)
        for idx in range(start, stop):
            neighbors = np.random.choice(
                num_nodes,
                size=min(k, num_nodes - 1),
                replace=False
            )
            neighbors = neighbors[neighbors != idx]
            for n in neighbors:
                edge_list.append([idx, n])

    edge_index = torch.LongTensor(edge_list).t()
    labels = torch.LongTensor(pd.Categorical(y).codes)

    return Data(x=x, edge_index=edge_index, y=labels)

def train_gnn_model(max_samples=10000):
    # Load and preprocess dataset
    X_train, X_test, y_train, y_test, _ = load_and_preprocess_data()
    
    if X_train is None:
        return None

    # Reduce training data if necessary
    if len(X_train) > max_samples:
        print(f"Reducing training data to {max_samples} samples")
        X_train = X_train.sample(max_samples, random_state=42)
        y_train = y_train.loc[X_train.index]

    if len(X_test) > max_samples // 4:
        X_test = X_test.sample(max_samples // 4, random_state=42)
        y_test = y_test.loc[X_test.index]

    print(f"Constructing graph: {len(X_train)} training nodes, {len(X_test)} testing nodes")

    # Prepare PyTorch Geometric Data objects
    train_graph = create_graph_data(X_train, y_train)
    test_graph = create_graph_data(X_test, y_test)

    # Instantiate model
    model = TrafficGNN(
        num_features=X_train.shape[1],
        hidden_channels=64,
        num_classes=len(np.unique(y_train))
    )

    # Define optimizer and loss function
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = torch.nn.NLLLoss()

    # Model training loop
    model.train()
    for epoch in range(100):
        optimizer.zero_grad()
        predictions = model(train_graph.x, train_graph.edge_index)
        loss = loss_fn(predictions, train_graph.y)
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1:03d} | Loss: {loss:.4f}")

    # Evaluate on test data
    model.eval()
    with torch.no_grad():
        out = model(test_graph.x, test_graph.edge_index)
        pred_labels = out.argmax(dim=1)
        correct = (pred_labels == test_graph.y).sum()
        accuracy = int(correct) / len(test_graph.y)
        print(f"Test Accuracy: {accuracy:.4f}")

    return model

if __name__ == "__main__":
    trained_model = train_gnn_model()
    if trained_model is not None:
        torch.save(trained_model.state_dict(), r"d:\CyberProject\V2\backend\models\traffic_gnn.pt")
