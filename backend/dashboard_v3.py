# === Imports and Dependencies ===
import dash
from dash import dcc, html, callback, Input, Output, State
import dash_bootstrap_components as dbc
import plotly.graph_objs as go
import plotly.express as px
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time
import random
import json
from flask_socketio import emit
import logging

logger = logging.getLogger(__name__)

# === Constants for Attack Types & Threat Levels ===
ATTACK_SIGNATURES = {
    'SYN Flood': {'color': '#FF5733', 'threshold': 0.7},
    'HTTP Flood': {'color': '#33A8FF', 'threshold': 0.65},
    'UDP Flood': {'color': '#FF33A8', 'threshold': 0.75},
    'Slowloris': {'color': '#A833FF', 'threshold': 0.6},
    'DNS Amplification': {'color': '#33FFA8', 'threshold': 0.8}
}

RISK_GRADES = {
    'Low': (0, 0.4, '#92D050'),
    'Medium': (0.4, 0.7, '#FFC000'),
    'High': (0.7, 0.9, '#FF0000'),
    'Critical': (0.9, 1.0, '#7030A0')
}


# === Data Simulation ===
def create_simulated_dataset(hours=24):
    start_time = datetime.now() - timedelta(hours=hours)
    records = {
        'timestamp': [], 'traffic': [], 'attack_probability': [],
        'attack_type': [], 'blocked_requests': []
    }

    for i in range(hours * 12):  # 5-minute slices
        ts = start_time + timedelta(minutes=i * 5)
        hour = ts.hour
        base = 50 + 50 * np.sin(np.pi * hour / 12)
        volume = max(10, base + random.normalvariate(0, 10))
        prob = random.betavariate(0.2, 2.0) if random.random() > 0.8 else random.betavariate(0.1, 10.0)

        atk_type = 'Normal'
        if prob > 0.5:
            weightings = [v['threshold'] for v in ATTACK_SIGNATURES.values()]
            atk_type = random.choices(list(ATTACK_SIGNATURES.keys()), weights=weightings, k=1)[0]

        blocked = int(prob * volume * 0.8) if prob > 0.5 else int(random.random() * volume * 0.05)

        records['timestamp'].append(ts)
        records['traffic'].append(volume)
        records['attack_probability'].append(prob)
        records['attack_type'].append(atk_type)
        records['blocked_requests'].append(blocked)

    return pd.DataFrame(records)


# === Threat Utilities ===
def classify_threat_level(prob):
    for label, (low, high, _) in RISK_GRADES.items():
        if low <= prob < high:
            return label
    return 'Critical'


def threat_color_code(prob):
    for _, (low, high, shade) in RISK_GRADES.items():
        if low <= prob < high:
            return shade
    return RISK_GRADES['Critical'][2]


# === Simulation Process ===
def simulate_attacks(socketio):
    logger.info("Launching attack simulation")
    data_buffer = create_simulated_dataset()

    while True:
        try:
            latest_time = data_buffer['timestamp'].iloc[-1]
            upcoming_time = latest_time + timedelta(minutes=5)
            hour = upcoming_time.hour
            busy_time = 9 <= hour <= 17
            is_attack = random.random() < (0.2 if busy_time else 0.05)

            if is_attack:
                prob = random.uniform(0.6, 0.95)
                traffic_volume = random.uniform(100, 300)
                atk_type = random.choices(
                    list(ATTACK_SIGNATURES),
                    weights=[v['threshold'] for v in ATTACK_SIGNATURES.values()],
                    k=1
                )[0]
                blocked = int(prob * traffic_volume * 0.8)
            else:
                base = 50 + 50 * np.sin(np.pi * hour / 12)
                traffic_volume = max(10, base + random.normalvariate(0, 10))
                prob = random.betavariate(0.1, 10.0)
                atk_type = 'Normal'
                blocked = int(random.random() * traffic_volume * 0.05)

            new_entry = pd.DataFrame({
                'timestamp': [upcoming_time],
                'traffic': [traffic_volume],
                'attack_probability': [prob],
                'attack_type': [atk_type],
                'blocked_requests': [blocked]
            })

            data_buffer = pd.concat([data_buffer.iloc[1:], new_entry], ignore_index=True)

            color = threat_color_code(prob)
            level = classify_threat_level(prob)

            socketio.emit('ddos_update', {
                'time': upcoming_time.strftime('%Y-%m-%d %H:%M:%S'),
                'traffic': traffic_volume,
                'attack_probability': prob,
                'attack_type': atk_type if atk_type != 'Normal' else None,
                'blocked_requests': blocked,
                'threat_level': level,
                'threat_color': color
            })

            # Save state
            snapshot = {
                'timestamp': upcoming_time.strftime('%Y-%m-%d %H:%M:%S'),
                'traffic_level': traffic_volume,
                'attack_probability': prob,
                'attack_type': atk_type if atk_type != 'Normal' else None,
                'blocked_requests': blocked,
                'threat_level': level
            }

            with open('latest_attack_data.json', 'w') as out_file:
                json.dump(snapshot, out_file, default=fix_serialization)

            time.sleep(1)

        except Exception as err:
            logger.error(f"Sim error: {err}")
            time.sleep(5)


def fix_serialization(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return obj.strftime('%Y-%m-%d %H:%M:%S')
    return obj


# === Dashboard Setup ===
def create_dashboard(app):
    from dashboard_layout import layout, register_callbacks  # <- You'll modularize this later
    app.layout = layout
    register_callbacks(app)


# === Main Entry ===
if __name__ == '__main__':
    app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
    create_dashboard(app)
    app.run_server(debug=True, port=8050)
