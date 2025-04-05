from dash import Input, Output, State, html
import dash_bootstrap_components as dbc
import plotly.graph_objs as go
import plotly.express as px
import pandas as pd
import numpy as np
import json
import random
import logging
from datetime import datetime, timedelta
from dashboard.visualizations import (
    create_traffic_graph,
    create_threat_gauge,
    create_traffic_sparkline,
    create_geo_map,
    create_top_sources_chart
)

logger = logging.getLogger(__name__)

# -------------------- Constants --------------------
ATTACK_TYPES = {
    'SYN Flood': {'color': '#FF5733'},
    'HTTP Flood': {'color': '#33A8FF'},
    'UDP Flood': {'color': '#FF33A8'},
    'Slowloris': {'color': '#A833FF'},
    'DNS Amplification': {'color': '#33FFA8'}
}

COUNTRIES = ['United States', 'China', 'Russia', 'Brazil', 'India',
             'Germany', 'United Kingdom', 'France', 'Japan', 'Canada']

# -------------------- Utilities --------------------
def get_threat_level(prob):
    if prob < 0.4: return "Low"
    if prob < 0.7: return "Medium"
    if prob < 0.9: return "High"
    return "Critical"

def get_threat_color(prob):
    if prob < 0.4: return "#92D050"
    if prob < 0.7: return "#FFC000"
    if prob < 0.9: return "#FF0000"
    return "#7030A0"

def load_latest_data():
    try:
        with open('latest_attack_data.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading latest data: {e}")
        return {
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'traffic_level': 50,
            'attack_probability': 0.1,
            'attack_type': None,
            'blocked_requests': 0,
            'threat_level': 'Low'
        }

def load_historical_data():
    try:
        with open('historical_data.json', 'r') as f:
            df = pd.DataFrame(json.load(f))
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            return df
    except Exception as e:
        logger.error(f"Error loading historical data: {e}")
        return generate_placeholder_data()

def generate_placeholder_data():
    hours = 24
    timestamps = [datetime.now() - timedelta(hours=hours) + timedelta(minutes=i * 5) for i in range(hours * 12)]
    return pd.DataFrame({
        'timestamp': timestamps,
        'traffic': [50 + 20 * np.sin(i / 10) for i in range(hours * 12)],
        'attack_probability': [0.1 + 0.1 * np.sin(i / 8) for i in range(hours * 12)],
        'attack_type': ['Normal'] * (hours * 12),
        'blocked_requests': [5 + 2 * np.sin(i / 10) for i in range(hours * 12)]
    })

def generate_geo_data():
    return pd.DataFrame({
        'country': COUNTRIES,
        'latitude': [37.0902, 35.8617, 61.5240, -14.2350, 20.5937,
                     51.1657, 55.3781, 46.2276, 36.2048, 56.1304],
        'longitude': [-95.7129, 104.1954, 105.3188, -51.9253, 78.9629,
                      10.4515, -3.4360, 2.2137, 138.2529, -106.3468],
        'intensity': [random.random() for _ in range(10)],
        'volume': [random.randint(10, 1000) for _ in range(10)]
    })

# -------------------- Callback --------------------
def register_callbacks(app, socketio):
    """Register all Dash callbacks"""

    @app.callback(
        [
            Output('threat-level', 'children'),
            Output('threat-level', 'style'),
            Output('traffic-value', 'children'),
            Output('blocked-value', 'children'),
            Output('traffic-graph', 'figure'),
            Output('attack-prob-graph', 'figure'),
            Output('attack-distribution', 'figure'),
            Output('attack-type-display', 'children'),
            Output('log-container', 'children'),
            Output('threat-gauge', 'figure'),
            Output('traffic-sparkline', 'figure'),
            Output('geo-map', 'figure'),
            Output('top-sources', 'figure'),
            Output('current-time', 'children'),
            Output('alert-banner', 'children'),
            Output('block-rate-indicator', 'figure')
        ],
        [Input('interval-component', 'n_intervals')]
    )
    def update_metrics(n):
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        latest = load_latest_data()
        df = load_historical_data()

        # Prepare new entry
        timestamp = datetime.strptime(latest['timestamp'], '%Y-%m-%d %H:%M:%S') \
            if isinstance(latest['timestamp'], str) else latest['timestamp']
        attack_type = latest.get('attack_type') or 'Normal'

        new_row = pd.DataFrame({
            'timestamp': [timestamp],
            'traffic': [latest['traffic_level']],
            'attack_probability': [latest['attack_probability']],
            'attack_type': [attack_type],
            'blocked_requests': [latest['blocked_requests']]
        })

        viz_df = pd.concat([df.iloc[-287:], new_row], ignore_index=True)

        # Visualizations
        traffic_fig = create_traffic_graph(viz_df)
        threat_gauge = create_threat_gauge(latest['attack_probability'])
        sparkline = create_traffic_sparkline(viz_df)
        geo_map = create_geo_map(generate_geo_data())
        top_sources = create_top_sources_chart(generate_geo_data())

        # Attack Probability Line Graph
        prob_fig = go.Figure()
        prob_fig.add_trace(go.Scatter(
            x=viz_df['timestamp'],
            y=viz_df['attack_probability'],
            mode='lines',
            line=dict(color='#e74c3c', width=2),
            fill='tozeroy',
            fillcolor='rgba(231, 76, 60, 0.2)'
        ))
        prob_fig.update_layout(
            template='plotly_dark',
            margin=dict(l=20, r=20, t=30, b=20),
            xaxis_title="Time",
            yaxis_title="Probability",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#ffffff'),
            transition_duration=500
        )

        # Attack Type Distribution
        attacks = viz_df[viz_df['attack_type'] != 'Normal']['attack_type'].value_counts().reset_index()
        attacks.columns = ['attack_type', 'count']
        if not attacks.empty:
            dist_fig = px.bar(
                attacks, x='attack_type', y='count',
                color='attack_type',
                color_discrete_map={t: ATTACK_TYPES.get(t, {}).get('color', '#777') for t in attacks['attack_type']},
                template='plotly_dark'
            )
            dist_fig.update_layout(
                transition_duration=500,
                margin=dict(l=20, r=20, t=30, b=40),
                xaxis_title="Attack Type",
                yaxis_title="Count",
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#ffffff')
            )
        else:
            dist_fig = go.Figure()
            dist_fig.add_annotation(
                text="No attacks detected in timeframe",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=16, color="#9e9e9e")
            )
            dist_fig.update_layout(
                template='plotly_dark',
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#ffffff'),
                margin=dict(l=20, r=20, t=30, b=20)
            )

        # Optional Display
        attack_display = html.Div([
            html.H4("Attack Type Detected:", className="mt-2"),
            html.H3(attack_type, style={'color': 'red', 'fontWeight': 'bold'})
        ]) if latest['attack_type'] else ""

        return (
            get_threat_level(latest['attack_probability']),
            {'color': get_threat_color(latest['attack_probability']), 'fontWeight': 'bold'},
            f"{latest['traffic_level']:,}",
            f"{latest['blocked_requests']:,}",
            traffic_fig,
            prob_fig,
            dist_fig,
            attack_display,
            "",  # placeholder for log-container
            threat_gauge,
            sparkline,
            geo_map,
            top_sources,
            now,
            "",  # placeholder for alert banner
            threat_gauge  # assuming block-rate-indicator uses same
        )
