import pandas as pd
import numpy as np
import os
import glob
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def load_and_preprocess_data(sample_size=100000):
    # Directory path containing the dataset files
    dataset_dir = r"d:\CyberProject\V2\backend\dataset_ddos2019"
    
    # Verify dataset path existence
    if not os.path.isdir(dataset_dir):
        print(f"Directory missing: {dataset_dir}")
        return None, None, None, None, None

    # Collect all CSV files in the target folder
    csv_list = glob.glob(os.path.join(dataset_dir, "*.csv"))
    
    if not csv_list:
        print(f"No .csv files found in directory: {dataset_dir}")
        return None, None, None, None, None

    # Feature columns to be extracted from the dataset
    selected_features = [
        'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
        'Fwd Packets Length Total', 'Bwd Packets Length Total',
        'Fwd Packet Length Max', 'Fwd Packet Length Min',
        'Flow IAT Mean', 'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min',
        'Fwd IAT Mean', 'Fwd IAT Std', 'Fwd IAT Max', 'Fwd IAT Min',
        'Bwd IAT Mean', 'Bwd IAT Std', 'Bwd IAT Max', 'Bwd IAT Min',
        'Label'
    ]

    data_chunks = []

    for idx, file_path in enumerate(csv_list):
        print(f"\nLoading file {idx + 1}/{len(csv_list)}: {os.path.basename(file_path)}")
        
        try:
            # Estimate sampling ratio per file
            line_count = sum(1 for _ in open(file_path, 'r'))
            rate = (sample_size / len(csv_list)) / (line_count - 1)
            
            # Load a sample of rows from the CSV
            temp_df = pd.read_csv(
                file_path,
                usecols=selected_features,
                skiprows=lambda i: i > 0 and np.random.rand() > rate,
                low_memory=False
            )
            print(f"Loaded {len(temp_df)} records from {os.path.basename(file_path)}")
            data_chunks.append(temp_df)
        except Exception as err:
            print(f"Failed to load {file_path}: {err}")
            continue

    # Merge all loaded data
    final_df = pd.concat(data_chunks, ignore_index=True)
    print(f"\nAggregated dataset size: {len(final_df)} rows")

    # Extract features and labels
    X = final_df.drop('Label', axis=1)
    y = final_df['Label']

    # Replace missing values with column-wise means
    X.fillna(X.mean(), inplace=True)

    # Normalize feature values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled = pd.DataFrame(X_scaled, columns=X.columns)

    # Split dataset into training and testing portions
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    return X_train, X_test, y_train, y_test, scaler

if __name__ == "__main__":
    try:
        X_train, X_test, y_train, y_test, scaler = load_and_preprocess_data()

        if X_train is not None:
            print("\n✅ Preprocessing completed successfully!")
            print(f"Training data shape: {X_train.shape}")
            print(f"Testing data shape: {X_test.shape}")

            print("\nUnique labels in dataset:")
            print(pd.concat([y_train, y_test]).unique())
    except Exception as e:
        print(f"⚠️ An error occurred during processing: {str(e)}")
