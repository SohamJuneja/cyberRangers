@echo off
REM === Install core ML and data libraries ===
pip install torch torchvision torchaudio
pip install numpy pandas scikit-learn matplotlib networkx gym

REM === Install PyTorch Geometric and dependencies ===
pip install torch-geometric torch-scatter torch-sparse torch-cluster torch-spline-conv

REM === Install SHAP for explainability ===
pip install shap

REM === Install authentication library ===
pip install flask_login

REM === Install web framework and dashboard components ===
pip install flask dash dash-bootstrap-components flask-socketio geopy requests
