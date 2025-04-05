import dash
from dash import dcc, html
import dash_bootstrap_components as dbc

# --------- Reusable Components --------- #

def create_status_card(title, stat_id, value_id, graph_id, graph_height):
    return html.Div([
        html.H4(title, className="card-title"),
        dbc.Card([
            dbc.CardBody([
                html.Div([
                    html.Div([
                        html.H3(stat_id, className="stat-title"),
                        html.H2(id=value_id, children="Loading...")
                    ], className="mb-2"),
                    dcc.Graph(id=graph_id, config={'displayModeBar': False},
                              style={'height': graph_height})
                ], className="text-center")
            ])
        ], className="status-card")
    ], className="h-100")

def create_graph_card(title, graph_id):
    return html.Div([
        html.H4(title, className="graph-title"),
        dbc.Card([
            dbc.CardBody([
                dcc.Graph(id=graph_id, config={'displayModeBar': False})
            ])
        ])
    ])

# --------- Main Layout Function --------- #

def create_dashboard_layout():
    return html.Div([
        dbc.Container([
            # Header Row
            dbc.Row([
                dbc.Col([
                    html.Div([
                        html.H4("DDoS Protection System", className="text-muted mb-0")
                    ], className="d-flex align-items-center")
                ], width=7),
                dbc.Col([
                    html.Div([
                        html.H3(id='current-time', children="--"),
                        html.H5(id='server-status', children="Server Status: Online", className="text-success")
                    ], className="text-end")
                ], width=5)
            ], className="header-row mb-3"),

            html.Div(id='alert-banner', className="mb-3"),

            # Status Cards
            dbc.Row([
                dbc.Col([
                    html.Div([
                        html.H4("Current Threat Status", className="card-title"),
                        dbc.Card([
                            dbc.CardBody([
                                html.Div([
                                    html.H2(id='threat-level', children="Loading..."),
                                    html.Div(id='attack-type-display', children=""),
                                    dcc.Graph(id='threat-gauge', config={'displayModeBar': False},
                                              style={'height': '150px'})
                                ], className="text-center")
                            ])
                        ], className="status-card")
                    ], className="h-100")
                ], width=4),

                dbc.Col(
                    create_status_card("Traffic Statistics", "Current Traffic", "traffic-value",
                                       "traffic-sparkline", "80px"),
                    width=4
                ),
                dbc.Col(
                    create_status_card("Protection Status", "Blocked Requests", "blocked-value",
                                       "block-rate-indicator", "80px"),
                    width=4
                )
            ], className="mb-4"),

            # Traffic Over Time Graph
            dbc.Row([
                dbc.Col([
                    html.Div([
                        html.H4("Traffic Over Time", className="graph-title"),
                        html.Div([
                            dbc.ButtonGroup([
                                dbc.Button("1h", id="1h-button", className="time-button"),
                                dbc.Button("6h", id="6h-button", className="time-button"),
                                dbc.Button("24h", id="24h-button", className="time-button active"),
                            ], className="mb-2")
                        ], className="text-end"),
                        dbc.Card([
                            dbc.CardBody([
                                dcc.Graph(id='traffic-graph', config={'displayModeBar': False})
                            ])
                        ]),
                        dcc.Interval(
                            id='interval-component',
                            interval=5 * 1000,
                            n_intervals=0
                        )
                    ])
                ], width=12)
            ], className="mb-4"),

            # Two Half Graphs: Attack Trend & Distribution
            dbc.Row([
                dbc.Col(
                    create_graph_card("Attack Probability Trend", "attack-prob-graph"),
                    width=6
                ),
                dbc.Col(
                    create_graph_card("Attack Distribution", "attack-distribution"),
                    width=6
                )
            ], className="mb-4"),

            # Geo Map + Top Sources
            dbc.Row([
                dbc.Col(
                    create_graph_card("Geographical Attack Source", "geo-map"),
                    width=8
                ),
                dbc.Col(
                    create_graph_card("Top Attack Sources", "top-sources"),
                    width=4
                )
            ], className="mb-4"),

            # Real-time Logs
            dbc.Row([
                dbc.Col([
                    html.H4("Real-time Logs", className="log-title d-flex justify-content-between"),
                    dbc.Card([
                        dbc.CardBody([
                            html.Div(id='log-container', className="logs-container")
                        ])
                    ])
                ], width=12)
            ])
        ], fluid=True, className="dashboard-container")
    ])
