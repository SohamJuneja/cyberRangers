import pandas as pd
import numpy as np
import json
import os
import logging
import random
from datetime import datetime, timedelta
import requests
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

LATEST_TRAFFIC_FILE = 'latest_attack_data.json'

THREAT_LEVELS = {
    'Low': (0, 0.4, '#92D050'),
    'Medium': (0.4, 0.7, '#FFC000'),
    'High': (0.7, 0.9, '#FF0000'),
    'Critical': (0.9, 1.0, '#7030A0')
}

ATTACK_PATTERNS = {
    'SYN Flood': {'color': '#FF5733', 'threshold': 0.7},
    'HTTP Flood': {'color': '#33A8FF', 'threshold': 0.65},
    'UDP Flood': {'color': '#FF33A8', 'threshold': 0.75},
    'Slowloris': {'color': '#A833FF', 'threshold': 0.6},
    'DNS Amplification': {'color': '#33FFA8', 'threshold': 0.8}
}

def default_serializer(obj):
    """Handle serialization of numpy/pandas objects for JSON."""
    if isinstance(obj, (np.integer, np.int_)):
        return int(obj)
    if isinstance(obj, (np.floating, np.float_)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, pd.Timestamp):
        return obj.strftime('%Y-%m-%d %H:%M:%S')
    return str(obj)

def determine_threat_level(prob: float) -> str:
    for level, (min_val, max_val, _) in THREAT_LEVELS.items():
        if min_val <= prob < max_val:
            return level
    return 'Critical'

def get_color(prob: float) -> str:
    for _, (min_p, max_p, color_hex) in THREAT_LEVELS.items():
        if min_p <= prob < max_p:
            return color_hex
    return THREAT_LEVELS['Critical'][2]

def simulate_traffic_data(hours: int = 24) -> pd.DataFrame:
    start_time = datetime.now() - timedelta(hours=hours)
    rows = []
    services = ['Web Server', 'DNS', 'API Gateway', 'Database', 'Auth Service']
    
    for i in range(hours * 12):  # 5-minute intervals
        timestamp = start_time + timedelta(minutes=5 * i)
        base = 50 + 50 * np.sin(np.pi * timestamp.hour / 12)
        traffic_volume = max(10, base + random.gauss(0, 10))
        is_attack = random.random() > 0.85
        prob = random.uniform(0.6, 0.95) if is_attack else np.random.beta(0.1, 10.0)
        
        attack_type = 'Normal'
        if prob > 0.5:
            attack_type = random.choices(
                list(ATTACK_PATTERNS.keys()), 
                weights=[v['threshold'] for v in ATTACK_PATTERNS.values()], 
                k=1
            )[0]
        
        blocked = int(prob * traffic_volume * 0.8) if prob > 0.5 else int(random.random() * traffic_volume * 0.05)
        ip_count = max(1, int(traffic_volume / 10))
        if prob > 0.5:
            ip_count = max(1, ip_count // 3)
        
        ip_sources = [f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}" for _ in range(ip_count)]
        service_target = random.choice(services)
        
        rows.append({
            'timestamp': timestamp,
            'traffic': traffic_volume,
            'attack_probability': prob,
            'attack_type': attack_type,
            'blocked_requests': blocked,
            'source_ips': ip_sources,
            'target_services': service_target
        })
    
    return pd.DataFrame(rows)

def get_latest_traffic_data() -> Dict[str, Any]:
    try:
        if os.path.exists(LATEST_TRAFFIC_FILE):
            with open(LATEST_TRAFFIC_FILE, 'r') as f:
                data = json.load(f)
                if 'timestamp' in data:
                    last_time = datetime.strptime(data['timestamp'], '%Y-%m-%d %H:%M:%S')
                    if datetime.now() - last_time < timedelta(minutes=1):
                        return data

        df = simulate_traffic_data(1)
        latest_entry = df.iloc[-1]
        
        result = {
            'timestamp': latest_entry['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
            'traffic_level': float(latest_entry['traffic']),
            'attack_probability': float(latest_entry['attack_probability']),
            'attack_type': None if latest_entry['attack_type'] == 'Normal' else latest_entry['attack_type'],
            'blocked_requests': int(latest_entry['blocked_requests']),
            'threat_level': determine_threat_level(latest_entry['attack_probability']),
            'threat_color': get_color(latest_entry['attack_probability']),
            'source_ips': latest_entry['source_ips'],
            'target_service': latest_entry['target_services']
        }

        with open(LATEST_TRAFFIC_FILE, 'w') as f:
            json.dump(result, f, default=default_serializer)
        
        return result

    except Exception as e:
        logger.error(f"Error in get_latest_traffic_data: {e}")
        return {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'traffic_level': 80.0,
            'attack_probability': 0.2,
            'attack_type': None,
            'blocked_requests': 5,
            'threat_level': 'Low',
            'threat_color': '#92D050',
            'source_ips': ['192.168.1.100'],
            'target_service': 'Web Server'
        }

def analyze_attack_patterns() -> Dict[str, Any]:
    try:
        df = simulate_traffic_data(24)
        attacks_only = df[df['attack_type'] != 'Normal']
        attack_distribution = attacks_only['attack_type'].value_counts().to_dict()
        
        max_prob = df['attack_probability'].max()
        max_prob_time = df.loc[df['attack_probability'].idxmax(), 'timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        
        active_windows = []
        temp_window = {'start': None, 'end': None}
        
        for _, row in df.iterrows():
            if row['attack_probability'] > 0.5:
                if temp_window['start'] is None:
                    temp_window['start'] = row['timestamp']
                temp_window['end'] = row['timestamp']
            elif temp_window['start'] is not None:
                duration = (temp_window['end'] - temp_window['start']).total_seconds() / 60
                max_p = df[(df['timestamp'] >= temp_window['start']) & (df['timestamp'] <= temp_window['end'])]['attack_probability'].max()
                active_windows.append({
                    'start': temp_window['start'].strftime('%Y-%m-%d %H:%M:%S'),
                    'end': temp_window['end'].strftime('%Y-%m-%d %H:%M:%S'),
                    'duration_minutes': duration,
                    'max_probability': max_p
                })
                temp_window = {'start': None, 'end': None}

        if temp_window['start']:
            duration = (temp_window['end'] - temp_window['start']).total_seconds() / 60
            max_p = df[(df['timestamp'] >= temp_window['start']) & (df['timestamp'] <= temp_window['end'])]['attack_probability'].max()
            active_windows.append({
                'start': temp_window['start'].strftime('%Y-%m-%d %H:%M:%S'),
                'end': temp_window['end'].strftime('%Y-%m-%d %H:%M:%S'),
                'duration_minutes': duration,
                'max_probability': max_p
            })

        return {
            'attack_counts': attack_distribution,
            'total_attacks': len(active_windows),
            'avg_traffic': df['traffic'].mean(),
            'total_blocked': df['blocked_requests'].sum(),
            'peak_attack': {
                'probability': max_prob,
                'time': max_prob_time,
                'level': determine_threat_level(max_prob)
            },
            'attack_windows': active_windows
        }

    except Exception as e:
        logger.error(f"Exception in analyze_attack_patterns: {e}")
        return {}
