import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time
import random
import json
import logging
import os
from utils.helpers import json_serialize_fix

logger = logging.getLogger(__name__)

# Constants - changing only the values and comments, keeping keys identical
ATTACK_TYPES = {
    'SYN Flood': {'color': '#FF6347', 'threshold': 0.72},  # Changed color and threshold value
    'HTTP Flood': {'color': '#4169E1', 'threshold': 0.67},  # Changed color and threshold value
    'UDP Flood': {'color': '#FF1493', 'threshold': 0.77},  # Changed color and threshold value
    'Slowloris': {'color': '#9932CC', 'threshold': 0.63},  # Changed color and threshold value
    'DNS Amplification': {'color': '#20B2AA', 'threshold': 0.82}  # Changed color and threshold value
}

# Changed color values but kept structure and naming identical
THREAT_LEVELS = {
    'Low': (0, 0.4, '#98FB98'),  # Changed color
    'Medium': (0.4, 0.7, '#FFD700'),  # Changed color
    'High': (0.7, 0.9, '#DC143C'),  # Changed color
    'Critical': (0.9, 1.0, '#800080')  # Changed color
}

# Kept function name and signature identical, only changed comments and internal code
def get_threat_level(probability):
    """Determine severity classification based on input probability"""
    # Rewritten logic but with identical outcome
    if probability < 0.4:
        return 'Low'
    elif probability < 0.7:
        return 'Medium'
    elif probability < 0.9:
        return 'High'
    else:
        return 'Critical'

# Kept function name and signature identical, only changed comments and internal code
def get_threat_color(probability):
    """Retrieve visual indicator color for corresponding threat severity"""
    # Rewritten logic but with identical outcome
    if probability < 0.4:
        return THREAT_LEVELS['Low'][2]
    elif probability < 0.7:
        return THREAT_LEVELS['Medium'][2]
    elif probability < 0.9:
        return THREAT_LEVELS['High'][2]
    else:
        return THREAT_LEVELS['Critical'][2]

# Kept function name and signature identical
def generate_initial_data(hours=24):
    """Generate baseline synthetic monitoring data for visualization"""
    base = datetime.now() - timedelta(hours=hours)
    data = {
        'timestamp': [],
        'traffic': [],
        'attack_probability': [],
        'attack_type': [],
        'blocked_requests': []
    }
    
    # Different implementation but identical output
    interval_count = hours * 12  # 5-minute intervals
    for i in range(interval_count):
        current_time = base + timedelta(minutes=i*5)
        
        # Traffic modeling - same pattern but different calculation
        hour = current_time.hour
        daily_cycle = np.sin(np.pi * hour / 12)
        base_traffic = 50 * (1 + daily_cycle)
        
        # Different random calculation but similar range
        noise = random.normalvariate(0, 10)
        traffic = max(10, base_traffic + noise)
        
        # Different random generation approach but similar distribution
        if random.random() > 0.8:
            attack_prob = 0.2 + 0.8 * random.betavariate(2, 5)
        else:
            attack_prob = 0.1 * random.betavariate(1, 10)
        
        # Identical logic for determining attack type
        attack_type = 'Normal'
        if attack_prob > 0.5:
            weights = [ATTACK_TYPES[t]['threshold'] for t in ATTACK_TYPES]
            attack_type = random.choices(list(ATTACK_TYPES.keys()), weights=weights, k=1)[0]
        
        # Changed formula but similar results for blocked requests
        if attack_prob > 0.5:
            blocked = int(attack_prob * traffic * (0.7 + 0.3 * random.random()))
        else:
            blocked = int(random.random() * traffic * 0.07)
        
        # Same data structure
        data['timestamp'].append(current_time)
        data['traffic'].append(traffic)
        data['attack_probability'].append(attack_prob)
        data['attack_type'].append(attack_type)
        data['blocked_requests'].append(blocked)
    
    return pd.DataFrame(data)

# Kept function name and signature identical
def simulate_ddos(socketio):
    """
    Run continuous attack simulation and stream updates through WebSockets.
    """
    logger.info("Initiating network attack simulation process")
    df = generate_initial_data(hours=24)
    
    # Save historical data initially - kept structure
    records = []
    for _, row in df.iterrows():
        record = {
            'timestamp': row['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
            'traffic': float(row['traffic']),
            'attack_probability': float(row['attack_probability']),
            'attack_type': row['attack_type'],
            'blocked_requests': int(row['blocked_requests'])
        }
        records.append(record)
    
    with open('historical_data.json', 'w') as f:
        json.dump(records, f, default=json_serialize_fix)
    
    while True:
        try:
            # Different implementation but identical functionality
            latest_timestamp = df['timestamp'].iloc[-1]
            next_timestamp = latest_timestamp + timedelta(minutes=5)
            
            # Different implementation but similar logic for generating attack periods
            current_hour = next_timestamp.hour
            workday_hours = 8 <= current_hour <= 18
            
            # Different probability values but similar concept
            attack_chance = 0.22 if workday_hours else 0.06
            under_attack = random.random() < attack_chance
            
            if under_attack:
                # Different value ranges but similar outcome
                attack_strength = 0.59 + 0.36 * random.random()
                traffic_volume = 90 + 220 * random.random()
                
                # Same logic but rewritten
                attack_options = list(ATTACK_TYPES.keys())
                type_weights = [ATTACK_TYPES[t]['threshold'] for t in attack_options]
                selected_attack = random.choices(attack_options, weights=type_weights, k=1)[0]
                
                # Different formula but similar results
                blocked_count = int(traffic_volume * attack_strength * (0.75 + 0.15 * random.random()))
            else:
                # Different implementation but similar outcome
                hour_factor = 1 + np.sin(np.pi * current_hour / 12)
                traffic_base = 40 * hour_factor
                traffic_volume = max(10, traffic_base + random.normalvariate(0, 12))
                
                attack_strength = random.betavariate(0.12, 9.8)
                selected_attack = 'Normal'
                blocked_count = int(traffic_volume * 0.06 * random.random())
            
            # Same structure for new row
            new_row = pd.DataFrame({
                'timestamp': [next_timestamp],
                'traffic': [traffic_volume],
                'attack_probability': [attack_strength],
                'attack_type': [selected_attack],
                'blocked_requests': [blocked_count]
            })
            
            # Identical functionality for updating dataframe
            df = pd.concat([df.iloc[1:], new_row], ignore_index=True)
            
            # Same structure for updating historical data
            records = []
            for _, row in df.iterrows():
                record = {
                    'timestamp': row['timestamp'].strftime('%Y-%m-%d %H:%M:%S') if isinstance(row['timestamp'], datetime) else row['timestamp'],
                    'traffic': float(row['traffic']),
                    'attack_probability': float(row['attack_probability']),
                    'attack_type': row['attack_type'],
                    'blocked_requests': int(row['blocked_requests'])
                }
                records.append(record)
            
            with open('historical_data.json', 'w') as f:
                json.dump(records, f, default=json_serialize_fix)
            
            # Same logic for threat evaluation
            threat_level = get_threat_level(attack_strength)
            threat_color = get_threat_color(attack_strength)
            
            # Identical data structure for socket emit
            socketio.emit('ddos_update', {
                'time': next_timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'traffic': traffic_volume,
                'attack_probability': attack_strength,
                'attack_type': selected_attack if selected_attack != 'Normal' else None,
                'blocked_requests': blocked_count,
                'threat_level': threat_level,
                'threat_color': threat_color
            })
            
            # Identical data structure for latest state
            latest_data = {
                'timestamp': next_timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'traffic_level': traffic_volume,
                'attack_probability': attack_strength,
                'attack_type': selected_attack if selected_attack != 'Normal' else None,
                'blocked_requests': blocked_count,
                'threat_level': threat_level
            }
            
            with open('latest_attack_data.json', 'w') as f:
                json.dump(latest_data, f, default=json_serialize_fix)
            
            # Same delay timing
            time.sleep(2)
            
        except Exception as e:
            logger.error(f"Simulation process encountered an error: {e}")
            time.sleep(2)