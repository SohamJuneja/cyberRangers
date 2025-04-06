# Standard libraries
import os
import threading
import logging
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Third-party libraries
from flask import Flask, render_template, redirect, url_for, request, flash, session, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_socketio import SocketIO
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import dash
from dash import dcc, html
import dash_bootstrap_components as dbc

# Custom modules
from dashboard.layout import create_dashboard_layout
from dashboard.callbacks import register_callbacks
from simulation.data_generator import simulate_ddos
from data_provider_v3 import (
    get_latest_traffic_data,
    get_attack_statistics,
    get_historical_attack_data,
    get_network_data,
    integrate_model_predictions
)

# Load environment variables
load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("app.log")]
)
logger = logging.getLogger(__name__)  # Fixed the logger name from _name_


# Ensure required directories exist
os.makedirs("assets", exist_ok=True)

# Flask app initialization
server = Flask(
    __name__,
    static_folder="static",
    template_folder="templates",
    static_url_path="/static"
)
server.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or os.urandom(24)

# SocketIO integration
socketio = SocketIO(server, cors_allowed_origins="*")

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(server)
login_manager.login_view = "login"

# In-memory user database
users = {}

class User(UserMixin):
    def __init__(self, id, username, password_hash):
        self.id = id
        self.username = username
        self.password_hash = password_hash

@login_manager.user_loader
def load_user(user_id):
    return users.get(user_id)

# Default admin account
users["1"] = User("1", "admin", generate_password_hash("admin"))

# --- Flask Routes ---

@server.route("/")
def home():
    return render_template("index.html")

@server.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if username == "admin" and check_password_hash(users["1"].password_hash, password):
            login_user(users["1"])
            logger.info(f"{username} logged in successfully.")
            flash("Login successful!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid credentials", "danger")
            logger.warning(f"Login failed for {username}")

    return render_template("login.html")

@server.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        confirm = request.form.get("confirm_password")

        if username and password == confirm:
            uid = str(len(users) + 1)
            users[uid] = User(uid, username, generate_password_hash(password))
            logger.info(f"New user registered: {username}")
            flash("Registration successful. Please log in.", "success")
            return redirect(url_for("login"))
        else:
            flash("Registration failed. Please verify your inputs.", "danger")

    return render_template("register.html")

@server.route("/logout")
@login_required
def logout():
    logger.info(f"{current_user.username} logged out.")
    logout_user()
    return redirect(url_for("home"))

@server.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")

@server.route("/settings")
@login_required
def settings():
    return render_template("settings.html")

@server.route("/documentation")
def documentation():
    return render_template("documentation.html")

@server.route("/about")
def about():
    return render_template("about.html")

# --- Email Alert Service ---

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_email(subject, message, recipient=None):
    sender = EMAIL_ADDRESS
    to = recipient or EMAIL_ADDRESS
    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(message, "plain"))
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, EMAIL_PASSWORD)
            server.sendmail(sender, to, msg.as_string())
        logger.info(f"Email sent to {to}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")

# Add the main block to run the app
if __name__ == "__main__":
    socketio.run(server, debug=True)