import torch
import lime.lime_tabular
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from data_preprocessing import load_and_preprocess_data
from rl_threat_scorer import ThreatScoringDQN

class DDoSExplainer:
    def __init__(self, model_path):
        # Load trained model checkpoint
        checkpoint = torch.load(model_path)
        self.model = ThreatScoringDQN(state_size=19, action_size=4)
        self.model.load_state_dict(checkpoint['dqn_state_dict'])
        self.model.eval()

        # Feature names (should match training data order)
        self.feature_names = [
            'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
            'Fwd Packets Length Total', 'Bwd Packets Length Total',
            'Fwd Packet Length Max', 'Fwd Packet Length Min',
            'Flow IAT Mean', 'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min',
            'Fwd IAT Mean', 'Fwd IAT Std', 'Fwd IAT Max', 'Fwd IAT Min',
            'Bwd IAT Mean', 'Bwd IAT Std', 'Bwd IAT Max', 'Bwd IAT Min'
        ]

        # Load dataset for fitting LIME
        X_train, _, _, _, _ = load_and_preprocess_data()

        # Initialize the LIME explainer
        self.explainer = lime.lime_tabular.LimeTabularExplainer(
            training_data=X_train.values,
            feature_names=self.feature_names,
            class_names=['Benign', 'DDoS'],
            mode='classification'
        )

    def predict_fn(self, input_data):
        """Model prediction wrapper for LIME compatibility."""
        input_tensor = torch.FloatTensor(input_data)
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probs = torch.nn.functional.softmax(outputs, dim=1).numpy()

            # Normalize just in case
            probs = probs / np.sum(probs, axis=1, keepdims=True)
            return np.nan_to_num(probs, nan=0.5)

    def explain_prediction(self, input_data: pd.DataFrame):
        """Generate LIME explanation for a single input row."""
        # Normalize input
        scaler = MinMaxScaler()
        normalized = scaler.fit_transform(input_data)

        # Explain the first row
        explanation = self.explainer.explain_instance(
            normalized[0],
            self.predict_fn,
            num_features=10,
            num_samples=500
        )

        prediction = self.predict_fn(normalized)

        return {
            "feature_importance": dict(explanation.as_list()),
            "prediction": prediction[0],
            "timestamp": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
        }
