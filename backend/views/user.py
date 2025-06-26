from flask import Flask, request, jsonify, Blueprint, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Hustle, Transaction, Debt
import secrets
from datetime import datetime, timedelta
from flask_mail import Message, Mail
from flask_jwt_extended import (
    jwt_required, 
    get_jwt_identity, 
    create_access_token,
    create_refresh_token
)

user_bp = Blueprint('user', __name__)

def get_mail():
    """Helper function to get mail instance from current app"""
    return current_app.extensions['mail']

def get_current_user():
    """Helper function to get current user from JWT"""
    try:
        current_user_id = get_jwt_identity()
        return User.query.get(current_user_id) if current_user_id else None
    except:
        return None

# REGISTER USER
@user_bp.route("/users", methods=["POST", "OPTIONS"])
def create_user():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
        
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    is_admin = data.get("is_admin", False)

    # Validations
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400
    
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"error": "Invalid email format"}), 400
    
    # Check for existing user
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    # Create user
    try:
        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            password=hashed_password,
            is_admin=is_admin
        )
        db.session.add(new_user)
        db.session.commit()
        
        # Send welcome email
        try:
            mail = get_mail()
            msg = Message(
                subject="Welcome to Mtaa Hustles Manager",
                recipients=[email],
                sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@example.com'),
                body=f"Hello {username},\n\nThank you for registering on Mtaa Hustle Manager.\n\nBest regards,\nMtaa Hustle Manager Team"
            )
            mail.send(msg)
        except Exception as mail_error:
            current_app.logger.warning(f"Failed to send welcome email: {str(mail_error)}")
        
        # Generate tokens
        access_token = create_access_token(identity=new_user.id)
        refresh_token = create_refresh_token(identity=new_user.id)
        
        return jsonify({
            "success": "User created successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "is_admin": new_user.is_admin
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": "Failed to register user"}), 500

# EMAIL VERIFICATION
@user_bp.route("/users/verify-email", methods=["POST"])
def verify_email():
    email = request.json.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        verification_token = secrets.token_urlsafe(32)
        user.verification_token = verification_token
        db.session.commit()
        
        mail = get_mail()
        msg = Message(
            subject="Email Verification",
            recipients=[email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
            body=f"Your verification token is: {verification_token}\n\nPlease use this token to verify your email address."
        )
        mail.send(msg)
        return jsonify({"success": "Verification email sent"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Email verification error: {str(e)}")
        return jsonify({"error": "Failed to send verification email"}), 500

@user_bp.route("/users/verify-email/<token>", methods=["GET"])
def verify_email_token(token):
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({"error": "Invalid token"}), 400
    
    try:
        user.is_verified = True
        user.verification_token = None
        db.session.commit()
        return jsonify({"success": "Email verified"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Verification error: {str(e)}")
        return jsonify({"error": "Failed to verify email"}), 500

# PASSWORD RESET
@user_bp.route("/users/password-reset/request", methods=["POST"])
def request_password_reset():
    email = request.json.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"success": "If email exists, reset instructions sent"}), 200
    
    try:
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        
        mail = get_mail()
        msg = Message(
            subject="Password Reset",
            recipients=[email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
            body=f"Your password reset token is: {reset_token}\n\nThis token will expire in 1 hour."
        )
        mail.send(msg)
        return jsonify({"success": "Reset instructions sent"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password reset error: {str(e)}")
        return jsonify({"error": "Failed to process reset"}), 500

@user_bp.route("/users/password-reset/confirm", methods=["POST"])
def confirm_password_reset():
    data = request.json
    reset_token = data.get("reset_token")
    new_password = data.get("new_password")
    
    if not reset_token or not new_password:
        return jsonify({"error": "Token and password required"}), 400
    
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    user = User.query.filter_by(reset_token=reset_token).first()
    if not user or user.reset_token_expires < datetime.utcnow():
        return jsonify({"error": "Invalid/expired token"}), 400
    
    try:
        user.password = generate_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        db.session.commit()
        return jsonify({"success": "Password successfully reset"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password reset error: {str(e)}")
        return jsonify({"error": "Failed to reset password"}), 500



# USER PROFILE
@user_bp.route("/users/me", methods=["GET"])
@jwt_required()
def get_current_user_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin
    }), 200

@user_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_by_id(user_id):
    current_user = get_current_user()
    if not current_user or (not current_user.is_admin and current_user.id != user_id):
        return jsonify({"error": "Unauthorized"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin
    }), 200

# UPDATE USER
@user_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_user = get_current_user()
    if not current_user or (not current_user.is_admin and current_user.id != user_id):
        return jsonify({"error": "Unauthorized"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.json
    if "username" in data:
        user.username = data["username"]
    if "email" in data:
        user.email = data["email"]
    if "password" in data:
        if len(data["password"]) < 6:
            return jsonify({"error": "Password too short"}), 400
        user.password = generate_password_hash(data["password"])
    
    try:
        db.session.commit()
        return jsonify({
            "success": "User updated",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update error: {str(e)}")
        return jsonify({"error": "Failed to update user"}), 500

# DELETE USER
@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user = get_current_user()
    if not current_user or (not current_user.is_admin and current_user.id != user_id):
        return jsonify({"error": "Unauthorized"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"success": "User deleted"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete error: {str(e)}")
        return jsonify({"error": "Failed to delete user"}), 500

# ADMIN ROUTES
@user_bp.route("/admin/users", methods=["GET"])
@jwt_required()
def admin_get_users():
    try:
        # Debug: Log incoming request
        current_app.logger.debug("Received request for /admin/users")
        
        current_user = get_current_user()
        
        if not current_user:
            current_app.logger.error("JWT validation failed - no current user")
            return jsonify({"error": "Authentication required"}), 401
            
        if not current_user.is_admin:
            current_app.logger.warning(f"Access denied for user {current_user.id} - not admin")
            return jsonify({"error": "Admin access required"}), 403
        
        current_app.logger.info(f"Admin access granted for user {current_user.id}")
        
        # Debug: Before database query
        current_app.logger.debug("Attempting to query all users from database")
        
        users = User.query.all()
        
        # Debug: After query but before serialization
        current_app.logger.debug(f"Found {len(users)} users")
        
        users_data = []
        for user in users:
            try:
                user_data = {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_admin": user.is_admin,
                    "is_suspended": user.is_suspended,
                    "created_at": user.created_at.isoformat() if user.created_at else None
                }
                users_data.append(user_data)
            except Exception as serialize_error:
                current_app.logger.error(f"Error serializing user {user.id}: {str(serialize_error)}")
                continue
        
        current_app.logger.debug("Successfully prepared response data")
        return jsonify(users_data), 200
        
    except Exception as e:
        current_app.logger.critical(f"Unhandled exception in admin_get_users: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": str(e)  # Include actual error message for debugging
        }), 500

@user_bp.route("/admin/users/<int:user_id>/status", methods=["PUT"])
@jwt_required()
def admin_toggle_user_status(user_id):
    current_user = get_current_user()
    if not current_user or not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    is_suspended = request.json.get("is_suspended")
    if is_suspended is None:
        return jsonify({"error": "Missing status"}), 400
    
    try:
        user.is_suspended = is_suspended
        db.session.commit()
        return jsonify({
            "success": True,
            "user": {
                "id": user.id,
                "is_suspended": user.is_suspended
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Status update error: {str(e)}")
        return jsonify({"error": "Failed to update status"}), 500

@user_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_user(user_id):
    current_user = get_current_user()
    if not current_user or not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"success": "User deleted"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete error: {str(e)}")
        return jsonify({"error": "Failed to delete user"}), 500