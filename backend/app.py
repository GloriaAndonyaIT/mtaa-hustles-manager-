from datetime import timedelta
from flask import Flask, request, jsonify
from models import db, TokenBlocklist
from flask_migrate import Migrate
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Create Flask app
app = Flask(__name__)

# Configuration
app.config.update(
    # Flask configuration
    SECRET_KEY='ftyhjksytdfgj',
    SQLALCHEMY_DATABASE_URI='sqlite:///app.db',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    
    # JWT configuration
    JWT_SECRET_KEY='fghhhhaszdxfcwaesrdgdf',
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=1),
    JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30),
    JWT_TOKEN_LOCATION=['headers', 'cookies'],
    
    # Mail configuration
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
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:5174", "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

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

# Import and register blueprints
from views.user import user_bp
from views.debt import debt_bp
from views.hustle import hustle_bp
from views.transactions import transaction_bp
from views.goal import goal_bp
from views.auth import auth_bp
from views.dashboard import dashboard_bp

app.register_blueprint(user_bp, url_prefix='/users')
app.register_blueprint(debt_bp, url_prefix='/debts')
app.register_blueprint(hustle_bp, url_prefix='/hustles')
app.register_blueprint(transaction_bp, url_prefix='/transactions')
app.register_blueprint(goal_bp, url_prefix='/goals')
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)