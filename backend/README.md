

# DDoS.AI Backend

An intelligent backend system designed for detecting and mitigating DDoS attacks using advanced machine learning models.

## Project Summary

This backend serves a secure and responsive API that performs real-time traffic inspection, anomaly detection, and monitoring. It incorporates AI-driven models such as Graph Neural Networks (GNNs) and Autoencoders for layered security.

## Technologies Used

- Python 3.8 or higher  
- Flask & Dash for API and dashboard  
- PyTorch for deep learning models  
- Socket.IO for live data updates  
- pandas and NumPy for preprocessing and analytics  

## Directory Layout

```
backend/
├── app.py                 # Core Flask app with REST API routes
├── data_preprocessing.py  # Traffic data transformation and cleanup
├── gnn_model.py           # Graph-based neural network logic
├── autoencoder_model.py   # Anomaly detection with autoencoders
├── train_models.py        # Training script for models
├── xai_explainer.py       # Modules for interpretability and explainability
├── data_provider_v3.py    # Simulates and streams network traffic
└── templates/             # Dashboard HTML templates
```

## Getting Started

1. **Set up a virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install project requirements:**

```bash
pip install -r requirements.txt
```

3. **Train detection models:**

```bash
python train_models.py
```

4. **Launch the server:**

```bash
python app.py
```

## API Reference

| Route                   | Method | Functionality                             |
|------------------------|--------|-------------------------------------------|
| `/api/attack-data`      | GET    | Retrieves latest detected threats         |
| `/api/network-data`     | GET    | Provides graph data for network topology  |
| `/api/historical-data`  | GET    | Returns past attack records               |
| `/api/model-prediction` | POST   | Submits traffic data for model inference  |
| `/health`               | GET    | Returns basic health status of the app    |

## Model Details

### Graph Neural Network (GNN)

- Captures relationships across IPs and flow structures  
- Effective in identifying complex, distributed threat patterns  

### Autoencoder

- Learns baseline traffic behavior  
- Flags unexpected deviations as potential anomalies  

## Guidelines for Contribution

To maintain code quality and consistency:

1. Always include type hints in function signatures  
2. Provide clear docstrings for all functions and classes  
3. Add tests for any newly developed features  



