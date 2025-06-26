from datetime import timedelta
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from models import db, TokenBlocklist

# Create Flask app
app = Flask(__name__)

# Configuration
app.config.update(
    SECRET_KEY='ftyhjksytdfgj',

    # Database
    SQLALCHEMY_DATABASE_URI='sqlite:///app.db',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,

    # JWT config
    JWT_SECRET_KEY='fghhhhaszdxfcwaesrdgdf',
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=1),
    JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30),
    JWT_TOKEN_LOCATION=['headers', 'cookies'],

    # Mail
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USE_SSL=False,
    MAIL_USERNAME='testandonya@gmail.com',
    MAIL_PASSWORD='aoyq bwra hely tser',
    MAIL_DEFAULT_SENDER='testandonya@gmail.com',

    # Frontend URL
    FRONTEND_URL='http://localhost:5173'
)

# Initialize extensions
db.init_app(app)
mail = Mail(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Improved CORS configuration
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=True,
     send_wildcard=False)

# Add a before_request handler to ensure CORS headers are always present
@app.before_request
def before_request():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

# Track if DB was initialized
db_initialized = False

@app.before_request
def initialize_db():
    global db_initialized
    if not db_initialized:
        with app.app_context():
            db.create_all()
            db_initialized = True

# JWT token blocklist checker
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
    return token is not None

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is required'}), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has been revoked'}), 401

# Register blueprints
from views.user import user_bp
from views.debt import debt_bp
from views.hustle import hustle_bp
from views.transactions import transaction_bp
from views.auth import auth_bp
from views.dashboard import dashboard_bp

app.register_blueprint(user_bp)
app.register_blueprint(debt_bp)
app.register_blueprint(hustle_bp)
app.register_blueprint(transaction_bp)

app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)

# Run app directly
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)