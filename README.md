NetSentinel.AI – Intelligent Network Threat Detection & Mitigation
A smart, AI-powered platform for identifying and responding to abnormal network traffic patterns in real time through advanced machine learning and interactive visualizations.

🔍 Project Summary
NetSentinel.AI merges cutting-edge ML algorithms with live network data inspection to proactively detect and mitigate suspicious activity. The architecture includes:

Backend: A Python-driven analytics engine using trained machine learning models

Frontend: A responsive dashboard for visualization and simulated traffic interaction

🚀 Getting Started
🔧 Prerequisites
Backend
Python 3.8 or higher

Required Python packages (requirements.bat or requirements.txt)

Minimum 8GB RAM recommended for training tasks

Frontend
Node.js v14+

npm or yarn package manager

🛠️ Installation
Backend Setup
Navigate to the backend folder:

bash
Copy
Edit
cd backend
Install the necessary Python packages:

bash
Copy
Edit
./requirements.bat
# or
pip install -r requirements.txt
(Optional) Prepare the dataset:

bash
Copy
Edit
python data_preprocessing.py
Frontend Setup
Navigate to the frontend simulation directory:

bash
Copy
Edit
cd frontendsim
Install dependencies:

bash
Copy
Edit
npm install
💡 Usage
Backend Execution
Run the core backend application:

bash
Copy
Edit
cd backend
python app.py
In a new terminal, start the data visualization panel:

bash
Copy
Edit
python dashboard_v3.py
The interface will be accessible at http://localhost:5000

Frontend Execution
To launch the frontend server:

bash
Copy
Edit
cd frontendsim
npm run dev
The dashboard will be available at http://localhost:3000

For production deployment:

bash
Copy
Edit
npm run build
🧠 System Features
Live monitoring of network traffic

Anomaly detection using autoencoder networks

Graph-based analysis with GNNs

Reinforcement learning for threat scoring

Transparent AI-based decision-making

Network simulation features

Interactive and analytical frontend dashboard

📁 Project Layout
Backend
app.py – Primary backend entry point

autoencoder_model.py – Handles anomaly detection

gnn_model.py – Performs graph neural network analysis

rl_threat_scorer.py – Scores threats using reinforcement learning

xai_explainer.py – Provides explainability for AI decisions

dashboard_v3.py – Launches visual monitoring interface

Frontend
Built with ReactJS

Visual components powered by D3.js

Simulated traffic environment

Real-time monitoring panels