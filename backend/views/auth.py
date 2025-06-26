from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt
)
from datetime import datetime, timedelta, timezone
from models import db, User, TokenBlocklist

auth_bp = Blueprint('auth', __name__)

# Login Route
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        current_app.logger.info(f"Login attempt with data: {data}")
        
        if not data:
            return jsonify({"error": "No data provided"}), 400

        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        user = User.query.filter_by(username=username).first()
        
        if not user:
            current_app.logger.warning(f"User not found: {username}")
            return jsonify({"error": "Invalid username or password"}), 401

        if not check_password_hash(user.password, password):
            current_app.logger.warning(f"Invalid password for user: {username}")
            return jsonify({"error": "Invalid username or password"}), 401

        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin
            },
            "message": "Login successful"
        }), 200

    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Logout Route
@auth_bp.route("/logout", methods=["DELETE"])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]
        now = datetime.now(timezone.utc)

        new_blocked_token = TokenBlocklist(jti=jti, created_at=now)
        db.session.add(new_blocked_token)
        db.session.commit()

        return jsonify({"success": "Successfully logged out"}), 200

    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({"error": "Failed to logout"}), 500
