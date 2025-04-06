import torch
import lime
import lime.lime_tabular
import numpy as np
import pandas as pd
from data_preprocessing import prepare_dataset
from rl_threat_scorer import ThreatScoringDQN
from sklearn.preprocessing import MinMaxScaler

class NetworkTrafficExplainer:
    def __init__(self, model_filepath):
        # Load saved model from checkpoint
        saved_model = torch.load(model_filepath)
        # Initialize model architecture
        self.neural_network = ThreatScoringDQN(state_size=19, action_size=4)
        # Load weights from checkpoint
        self.neural_network.load_state_dict(saved_model['dqn_state_dict'])
        # Set model to evaluation mode
        self.neural_network.eval()
        
        # Define traffic feature column names
        self.traffic_features = [
            'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
            'Fwd Packets Length Total', 'Bwd Packets Length Total',
            'Fwd Packet Length Max', 'Fwd Packet Length Min',
            'Flow IAT Mean', 'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min',
            'Fwd IAT Mean', 'Fwd IAT Std', 'Fwd IAT Max', 'Fwd IAT Min',
            'Bwd IAT Mean', 'Bwd IAT Std', 'Bwd IAT Max', 'Bwd IAT Min'
        ]
        
        # Initialize LIME explainer with training data
        training_data, _, _, _, _ = prepare_dataset()
        self.lime_explainer = lime.lime_tabular.LimeTabularExplainer(
            training_data.values,
            feature_names=self.traffic_features,
            class_names=['Normal', 'DDoS'],
            mode='classification'
        )
    
    def prediction_function(self, input_samples):
        # Convert input to PyTorch tensor
        tensor_input = torch.FloatTensor(input_samples)
        
        # Generate predictions without gradient tracking
        with torch.no_grad():
            raw_output = self.neural_network(tensor_input)
            # Convert logits to probability distribution
            probability_distribution = torch.nn.functional.softmax(raw_output, dim=1)
            # Convert to numpy array
            probability_array = probability_distribution.numpy()
            # Ensure probabilities sum to 1
            normalized_probabilities = probability_array / np.sum(probability_array, axis=1, keepdims=True)
            # Handle any NaN values by setting to 0.5
            final_probabilities = np.nan_to_num(normalized_probabilities, nan=0.5)
            
            return final_probabilities
    
    def generate_explanation(self, traffic_data):
        # Normalize features using min-max scaling
        feature_scaler = MinMaxScaler()
        normalized_traffic_data = pd.DataFrame(
            feature_scaler.fit_transform(traffic_data),
            columns=traffic_data.columns
        )
        
        # Generate LIME-based explanation
        instance_explanation = self.lime_explainer.explain_instance(
            normalized_traffic_data.iloc[0].values, 
            self.prediction_function,
            num_features=10,
            num_samples=500
        )
        
        # Get model prediction for this instance
        prediction_result = self.prediction_function(normalized_traffic_data.values)
        
        # Return explanation details
        return {
            'feature_importance': dict(instance_explanation.as_list()),
            'prediction': prediction_result[0],
            'timestamp': pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
        }