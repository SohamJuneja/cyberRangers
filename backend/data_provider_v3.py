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

# Renamed function to match the import in app.py
def get_attack_statistics() -> Dict[str, Any]:
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
        logger.error(f"Exception in get_attack_statistics: {e}")
        return {}

# Added missing functions that were imported in app.py
def get_historical_attack_data(days: int = 7) -> Dict[str, Any]:
    """
    Get historical attack data for the specified number of days
    """
    try:
        df = simulate_traffic_data(days * 24)
        
        # Group by day and calculate daily statistics
        df['date'] = df['timestamp'].dt.date
        daily_stats = []
        
        for date, group in df.groupby(df['date']):
            attacks = group[group['attack_probability'] > 0.5]
            daily_stats.append({
                'date': date.strftime('%Y-%m-%d'),
                'attack_count': len(attacks),
                'avg_probability': attacks['attack_probability'].mean() if len(attacks) > 0 else 0,
                'max_probability': attacks['attack_probability'].max() if len(attacks) > 0 else 0,
                'total_traffic': group['traffic'].sum(),
                'blocked_requests': group['blocked_requests'].sum()
            })
        
        # Get attack type distribution
        attack_types = df[df['attack_type'] != 'Normal']['attack_type'].value_counts().to_dict()
        
        return {
            'daily_stats': daily_stats,
            'attack_distribution': attack_types,
            'total_blocked': df['blocked_requests'].sum(),
            'highest_traffic_day': max(daily_stats, key=lambda x: x['total_traffic'])['date'] if daily_stats else None
        }
        
    except Exception as e:
        logger.error(f"Error in get_historical_attack_data: {e}")
        return {
            'daily_stats': [],
            'attack_distribution': {},
            'total_blocked': 0,
            'highest_traffic_day': None
        }

def get_network_data() -> Dict[str, Any]:
    """
    Get data about network services and their status
    """
    try:
        services = ['Web Server', 'DNS', 'API Gateway', 'Database', 'Auth Service', 'Load Balancer', 'CDN']
        result = []
        
        for service in services:
            status = random.choices(['Healthy', 'Degraded', 'Under Attack'], [0.7, 0.2, 0.1])[0]
            load = random.uniform(10, 95) if status == 'Healthy' else random.uniform(70, 100)
            
            result.append({
                'service': service,
                'status': status,
                'load_percentage': round(load, 1),
                'response_time': round(random.uniform(10, 200) * (1.5 if status != 'Healthy' else 1), 2),
                'connections': random.randint(10, 500)
            })
        
        return {
            'services': result,
            'total_services': len(services),
            'healthy_count': sum(1 for s in result if s['status'] == 'Healthy'),
            'degraded_count': sum(1 for s in result if s['status'] == 'Degraded'),
            'attacked_count': sum(1 for s in result if s['status'] == 'Under Attack')
        }
        
    except Exception as e:
        logger.error(f"Error in get_network_data: {e}")
        return {
            'services': [],
            'total_services': 0,
            'healthy_count': 0,
            'degraded_count': 0,
            'attacked_count': 0
        }

def integrate_model_predictions() -> Dict[str, Any]:
    """
    Simulate AI model predictions for future attacks
    """
    try:
        current_time = datetime.now()
        predictions = []
        
        # Generate predictions for the next 24 hours in 4-hour increments
        for i in range(1, 7):
            future_time = current_time + timedelta(hours=i * 4)
            threat_probability = random.random()
            
            predictions.append({
                'timestamp': future_time.strftime('%Y-%m-%d %H:%M:%S'),
                'predicted_probability': threat_probability,
                'threat_level': determine_threat_level(threat_probability),
                'confidence': random.uniform(0.6, 0.95),
                'potential_type': random.choice(list(ATTACK_PATTERNS.keys())) if threat_probability > 0.4 else None
            })
        
        highest_threat = max(predictions, key=lambda x: x['predicted_probability'])
        
        return {
            'predictions': predictions,
            'highest_threat_time': highest_threat['timestamp'],
            'highest_threat_level': highest_threat['threat_level'],
            'overall_risk': sum(p['predicted_probability'] for p in predictions) / len(predictions),
            'recommendation': 'Increase Security Measures' if highest_threat['predicted_probability'] > 0.6 else 'Normal Monitoring'
        }
        
    except Exception as e:
        logger.error(f"Error in integrate_model_predictions: {e}")
        return {
            'predictions': [],
            'highest_threat_time': None,
            'highest_threat_level': None,
            'overall_risk': 0.0,
            'recommendation': 'Normal Monitoring'
        }

# Keep the original function for backward compatibility
analyze_attack_patterns = get_attack_statistics