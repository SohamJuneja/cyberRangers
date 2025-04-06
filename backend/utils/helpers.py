import numpy as np
import pandas as pd
from datetime import datetime

def make_json_safe(value):
    """
    Converts NumPy and datetime objects into formats compatible with JSON serialization.
    """
    if isinstance(value, np.integer):
        return int(value)
    elif isinstance(value, np.floating):
        return float(value)
    elif isinstance(value, np.ndarray):
        return value.tolist()
    elif isinstance(value, pd.Timestamp) or isinstance(value, datetime):
        return value.strftime('%Y-%m-%d %H:%M:%S')
    else:
        return value

def classify_threat(probability):
    """
    Assigns a textual threat level based on probability score.
    """
    if probability < 0.4:
        return "Low"
    elif probability < 0.7:
        return "Medium"
    elif probability < 0.9:
        return "High"
    else:
        return "Critical"

def threat_color(probability):
    """
    Returns a hex color representing the severity of a threat.
    """
    if probability < 0.4:
        return "#92D050"  # Green - Low Risk
    elif probability < 0.7:
        return "#FFC000"  # Yellow - Moderate
    elif probability < 0.9:
        return "#FF0000"  # Red - High Alert
    else:
        return "#7030A0"  # Purple - Extreme Risk
