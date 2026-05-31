from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from models import db, Restaurant, Review, Audit, Rating, ConnectionRequest, User, Lab, HomeConfig, OnboardingRequest, Notification, Testimonial, TrustStoryBlock, ensure_admin_exists
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from sqlalchemy import text
import json
import re
from uuid import uuid4
from functools import wraps
from urllib.parse import urlparse
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

load_dotenv()

def _normalize_origin(value):
    if not value:
        return None
    value = value.strip()
    if not value:
        return None
    if "://" in value:
        parsed = urlparse(value)
        if parsed.scheme and parsed.netloc:
            return f"{parsed.scheme}://{parsed.netloc}"
    return value.rstrip("/")

def _parse_origins(value):
    origins = []
    if not value:
        return origins
    for raw in value.split(","):
        normalized = _normalize_origin(raw)
        if normalized:
            origins.append(normalized)
    return origins

app = Flask(__name__)

def _is_allowed_origin(origin):
    if not origin:
        return False
    # Allow any localhost for local dev
    if 'localhost' in origin or '127.0.0.1' in origin:
        return True
    # Allow any vercel.app subdomain (handles preview + production)
    if origin.endswith('.vercel.app'):
        return True
    # Allow explicitly set FRONTEND_URL env var
    frontend_url = os.getenv('FRONTEND_URL', '')
    for allowed in frontend_url.split(','):
        normalized = _normalize_origin(allowed)
        if normalized and origin.rstrip('/') == normalized:
            return True
    return False

CORS(app,
     origins=_is_allowed_origin,
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'change-this-secret')
app.config['MAIL_SERVER'] = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
app.config['MAIL_PORT'] = os.getenv('EMAIL_PORT', '587')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER', 'jpureva@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']
app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL')
app.config['BACKEND_URL'] = os.getenv('BACKEND_URL')

# PostgreSQL Configuration
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    "DATABASE_URL", 
    f"postgresql://{DB_USER or 'postgres'}:{DB_PASSWORD or 'deepesh123'}@{DB_HOST or 'localhost'}:{DB_PORT or '5432'}/{DB_NAME or 'Jindal'}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

mail = Mail(app)

db.init_app(app)
with app.app_context():
    db.create_all()
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- Auth Middleware ---
def _get_user_from_token(token_str):
    """Resolve a user from either a fake-jwt or real PyJWT token."""
    if not token_str:
        return None
    # Check fake token format: fake-jwt-token-<user_id>
    if token_str.startswith('fake-jwt-token-'):
        try:
            user_id = int(token_str.replace('fake-jwt-token-', ''))
            return User.query.get(user_id)
        except Exception:
            pass
    # Check real PyJWT
    try:
        import jwt as pyjwt
        payload = pyjwt.decode(token_str, app.config['SECRET_KEY'], algorithms=['HS256'])
        return User.query.get(payload.get('user_id'))
    except Exception:
        pass
    return None

def require_admin(f):
    """Decorator that enforces admin authentication on a route."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token_str = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
        user = _get_user_from_token(token_str)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

def make_slug(name, user_id):
    base = re.sub(r'[^a-z0-9]+', '-', (name or '').lower()).strip('-')
    return f"{base}-{user_id}" if user_id else base

def safe_json_list(value):
    if not value:
        return []
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return parsed
    except Exception:
        pass
    if isinstance(value, str):
        return [item.strip() for item in value.split(',') if item.strip()]
    return []

def create_notification(message, notification_type='info', recipient_role='admin', recipient_user_id=None):
    notice = Notification(
        recipient_role=recipient_role,
        recipient_user_id=recipient_user_id,
        message=message,
        notification_type=notification_type
    )
    db.session.add(notice)
    db.session.commit()

def send_email(subject, html_body, recipient):
    if not app.config['MAIL_PASSWORD']:
        print('[WARN] MAIL_PASSWORD is not set; cannot send email')
        return False

    try:
        msg = Message(subject, recipients=[recipient], html=html_body)
        mail.send(msg)
        return True
    except Exception as ex:
        print('[ERROR] send_email failed:', ex)
        return False

# Check Database Connection
with app.app_context():
    try:
        db.session.execute(text("SELECT 1"))
        db.create_all()
        print("[OK] PostgreSQL connected successfully!")
    except Exception as e:
        print("[ERROR] Database connection failed!")
        print(e)
    # Ensure new columns added to users table after model updates
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(120) UNIQUE"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(120)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(120)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_sent_at TIMESTAMP"))
            # Drop username unique constraint
            conn.execute(text("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key"))
            conn.commit()
            print('[OK] Ensured user columns exist and username constraint dropped')
    except Exception as ex:
        print('[WARN] Could not ensure schema changes:', ex)
    # Ensure the hardcoded admin user exists
    ensure_admin_exists()

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    """Fetch all certified restaurants with their ratings."""
    restaurants = Restaurant.query.all()
    results = []
    for r in restaurants:
        latest_audit = None
        if r.audits:
            latest_audit = max(r.audits, key=lambda a: a.audit_date)
        results.append({
            'id': r.id,
            'name': r.name,
            'category': r.category,
            'certification_status': r.certification_status,
            'last_verified': r.last_verified.strftime('%Y-%m-%d %H:%M:%S') if r.last_verified else None,
            'image_url': r.cover_image_url or r.image_url,
            'slug': r.slug,
            'address': r.address,
            'owner_name': r.owner_name,
            'owner_phone': r.owner_phone,
            'working_hours': r.working_hours,
            'about': r.about,
            'cover_image_url': r.cover_image_url,
            'gallery_images': safe_json_list(r.gallery_images),
            'videos': safe_json_list(r.videos),
            'reels': safe_json_list(r.reels),
            'latest_audit': None if not latest_audit else {
                'date': latest_audit.audit_date.strftime('%Y-%m-%d') if latest_audit.audit_date else None,
                'result': latest_audit.result,
                'overall_rating': latest_audit.overall_rating,
                'status': latest_audit.status
            },
            'ratings': [
                {
                    'pillar': rt.pillar,
                    'score': rt.score,
                    'details': rt.details
                } for rt in r.ratings
            ]
        })
    return jsonify({'status': 'success', 'data': results})

@app.route('/api/restaurants/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    """Fetch a specific restaurant by ID."""
    r = Restaurant.query.get_or_404(restaurant_id)
    latest_audit = None
    if r.audits:
        latest_audit = max(r.audits, key=lambda a: a.audit_date)
    return jsonify({
        'status': 'success',
        'data': {
            'id': r.id,
            'name': r.name,
            'category': r.category,
            'certification_status': r.certification_status,
            'last_verified': r.last_verified.strftime('%Y-%m-%d %H:%M:%S') if r.last_verified else None,
            'image_url': r.cover_image_url or r.image_url,
            'slug': r.slug,
            'address': r.address,
            'owner_name': r.owner_name,
            'owner_phone': r.owner_phone,
            'working_hours': r.working_hours,
            'about': r.about,
            'cover_image_url': r.cover_image_url,
            'gallery_images': safe_json_list(r.gallery_images),
            'videos': safe_json_list(r.videos),
            'reels': safe_json_list(r.reels),
            'latest_audit': None if not latest_audit else {
                'date': latest_audit.audit_date.strftime('%Y-%m-%d') if latest_audit.audit_date else None,
                'result': latest_audit.result,
                'overall_rating': latest_audit.overall_rating,
                'hygiene_rating': latest_audit.hygiene_rating,
                'taste_rating': latest_audit.taste_rating,
                'quality_rating': latest_audit.quality_rating,
                'report_url': latest_audit.report_url,
                'notes': latest_audit.notes,
                'status': latest_audit.status
            },
            'audits': [
                {
                    'id': a.id,
                    'date': a.audit_date.strftime('%Y-%m-%d'),
                    'type': a.audit_type,
                    'result': a.result,
                    'status': a.status,
                    'overall_rating': a.overall_rating,
                    'hygiene_rating': a.hygiene_rating,
                    'taste_rating': a.taste_rating,
                    'quality_rating': a.quality_rating,
                    'report_url': a.report_url,
                    'notes': a.notes
                } for a in r.audits
            ]
        }
    })

@app.route('/api/shops/slug/<string:slug>', methods=['GET'])
def get_restaurant_by_slug(slug):
    restaurant = Restaurant.query.filter_by(slug=slug).first_or_404()
    latest_audit = None
    if restaurant.audits:
        latest_audit = max(restaurant.audits, key=lambda a: a.audit_date)
    return jsonify({
        'status': 'success',
        'data': {
            'id': restaurant.id,
            'name': restaurant.name,
            'category': restaurant.category,
            'certification_status': restaurant.certification_status,
            'image_url': restaurant.cover_image_url or restaurant.image_url,
            'cover_image_url': restaurant.cover_image_url,
            'slug': restaurant.slug,
            'address': restaurant.address,
            'owner_name': restaurant.owner_name,
            'owner_phone': restaurant.owner_phone,
            'working_hours': restaurant.working_hours,
            'about': restaurant.about,
            'gallery_images': safe_json_list(restaurant.gallery_images),
            'videos': safe_json_list(restaurant.videos),
            'reels': safe_json_list(restaurant.reels),
            'latest_audit': None if not latest_audit else {
                'date': latest_audit.audit_date.strftime('%Y-%m-%d') if latest_audit.audit_date else None,
                'result': latest_audit.result,
                'overall_rating': latest_audit.overall_rating,
                'hygiene_rating': latest_audit.hygiene_rating,
                'taste_rating': latest_audit.taste_rating,
                'quality_rating': latest_audit.quality_rating,
                'report_url': latest_audit.report_url,
                'notes': latest_audit.notes,
                'status': latest_audit.status
            },
            'reviews': [
                {
                    'id': rv.id,
                    'reviewer_name': rv.reviewer_name,
                    'reviewer_type': rv.reviewer_type,
                    'content': rv.content,
                    'created_at': rv.created_at.strftime('%Y-%m-%d')
                } for rv in restaurant.reviews
            ]
        }
    }), 200

@app.route('/api/onboard', methods=['POST'])
def onboard_partner():
    """Endpoint for new partners to request an audit/onboarding."""
    data = request.json
    name = data.get('name')
    category = data.get('category')
    contact = data.get('contact')
    owner_id = data.get('user_id')

    if not name or not category:
        return jsonify({'status': 'error', 'message': 'Missing required fields: name, category'}), 400
        
    request_entry = OnboardingRequest(
        user_id=owner_id,
        name=name,
        category=category,
        contact=contact,
        status='Pending'
    )
    db.session.add(request_entry)
    db.session.commit()

    create_notification(
        f"New onboarding request received for {name}.",
        notification_type='info',
        recipient_role='admin'
    )
    
    return jsonify({'status': 'success', 'message': 'Onboarding request submitted. Awaiting admin approval.', 'request_id': request_entry.id}), 201

@app.route('/api/connect', methods=['POST'])
def connect_form():
    """Endpoint for want to connect form submission."""
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    if not name or not email or not message:
        return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400
        
    new_request = ConnectionRequest(
        name=name,
        email=email,
        message=message
    )
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({'status': 'success', 'message': 'Form submitted successfully'}), 201

# --- Auth Endpoints ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    confirm = data.get('confirmPassword')
    email = data.get('email')
    role = data.get('role', 'consumer')

    if role == 'admin':
        return jsonify({'error': 'Admin account cannot be created via registration'}), 403

    if not username or not password or not email:
        return jsonify({'status': 'error', 'message': 'username, email and password are required'}), 400
    if len(password) < 8:
        return jsonify({'status': 'error', 'message': 'Password must be at least 8 characters'}), 400
    if confirm is not None and password != confirm:
        return jsonify({'status': 'error', 'message': 'Passwords do not match'}), 400

    user = User.query.filter_by(email=email).first()
    verification_token = uuid4().hex

    if user:
        if user.email_verified:
            return jsonify({'status': 'error', 'message': 'Email already registered'}), 400
        else:
            # Overwrite unverified account so the email isn't permanently locked
            user.username = username
            user.password_hash = generate_password_hash(password)
            user.role = role
            user.email_verification_token = verification_token
            user.email_verification_sent_at = datetime.utcnow()
            db.session.commit()
    else:
        user = User(username=username, password_hash=generate_password_hash(password), role=role, email=email, email_verified=False, email_verification_token=verification_token, email_verification_sent_at=datetime.utcnow())
        db.session.add(user)
        db.session.commit()

    frontend_url = app.config['FRONTEND_URL'] or request.host_url.rstrip('/')
    verification_url = f"{frontend_url.rstrip('/')}/verify-email?token={verification_token}"
    print(f"\n[DEBUG] Verification Link for {email}: {verification_url}\n")
    
    sent = False
    try:
        sent = send_email(
            'Verify your FoodTrust account',
            f"<p>Hi {username},</p><p>Click this link to verify your email:</p><p><a href=\"{verification_url}\">Verify email</a></p>",
            email
        )
    except Exception as e:
        print('send_email error:', e)

    if not sent:
        return jsonify({'status': 'success', 'message': 'User registered. Verification email could not be sent (SMTP timeout). Check your backend terminal for the verification link.', 'user_id': user.id}), 201

    return jsonify({'status': 'success', 'message': 'User registered. A verification email has been sent from jpureva@gmail.com.', 'user_id': user.id, 'role': user.role}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        if not user.email_verified:
            return jsonify({'status': 'error', 'message': 'Please verify your email before logging in.'}), 403
        return jsonify({
            'status': 'success', 
            'token': f'fake-jwt-token-{user.id}', # Mock token
            'user': {'id': user.id, 'username': user.username, 'role': user.role}
        }), 200
    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401


@app.route('/api/verify-email/<string:token>', methods=['GET'])
def verify_email(token):
    user = User.query.filter_by(email_verification_token=token).first()
    if not user:
        return jsonify({'status': 'error', 'message': 'Invalid or already used verification link'}), 404
    
    if user.email_verification_sent_at:
        expiration_time = user.email_verification_sent_at + timedelta(minutes=10)
        if datetime.utcnow() > expiration_time:
            return jsonify({'status': 'error', 'message': 'Verification link has expired. Please register again to get a new link.'}), 400

    user.email_verified = True
    user.email_verification_token = None
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Email verified successfully. You can now log in.'}), 200

@app.route('/api/user/settings', methods=['PUT'])
def update_user_settings():
    auth_header = request.headers.get('Authorization', '')
    token_str = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
    user = _get_user_from_token(token_str)
    
    if not user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    
    data = request.json
    if 'username' in data and data['username']:
        user.username = data['username']
    if 'email' in data and data['email']:
        user.email = data['email']
    if 'password' in data and data['password']:
        if len(data['password']) >= 8:
            user.password_hash = generate_password_hash(data['password'])
    if 'profile_image_url' in data:
        user.profile_image_url = data['profile_image_url']
        
    db.session.commit()
    return jsonify({
        'status': 'success', 
        'message': 'Settings updated successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'email': user.email,
            'profile_image_url': user.profile_image_url
        }
    }), 200


@app.route('/api/password-reset-request', methods=['POST'])
def password_reset_request():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({'status': 'error', 'message': 'Email is required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'status': 'success', 'message': 'If this email exists, a reset link has been sent.'}), 200
    token = uuid4().hex
    user.password_reset_token = token
    user.password_reset_sent_at = datetime.utcnow()
    db.session.commit()

    frontend_url = app.config['FRONTEND_URL'] or request.host_url.rstrip('/')
    reset_url = f"{frontend_url.rstrip('/')}/reset-password?token={token}"
    sent = False
    try:
        sent = send_email(
            'Reset your FoodTrust password',
            f"<p>Hi {user.username},</p><p>Use this link to reset your password:</p><p><a href=\"{reset_url}\">Reset password</a></p>",
            email
        )
    except Exception as e:
        print('send_email error:', e)

    if not sent:
        return jsonify({'status': 'success', 'message': 'If this email exists, a reset link could not be sent because email SMTP is not configured. Please set EMAIL_PASSWORD or SMTP_PASS to enable email delivery.'}), 200

    return jsonify({'status': 'success', 'message': 'If this email exists, a reset link has been sent from jpureva@gmail.com.'}), 200


@app.route('/api/password-reset', methods=['POST'])
def password_reset():
    data = request.json
    token = data.get('token')
    new_password = data.get('newPassword')
    if not token or not new_password:
        return jsonify({'status': 'error', 'message': 'Token and new password are required'}), 400
    if len(new_password) < 6:
        return jsonify({'status': 'error', 'message': 'Password must be at least 8 characters'}), 400
    user = User.query.filter_by(password_reset_token=token).first()
    if not user:
        return jsonify({'status': 'error', 'message': 'Invalid or expired password reset token'}), 404
    if not user.password_reset_sent_at or datetime.utcnow() - user.password_reset_sent_at > timedelta(minutes=30):
        return jsonify({'status': 'error', 'message': 'Password reset token has expired'}), 400
    user.password_hash = generate_password_hash(new_password)
    user.password_reset_token = None
    user.password_reset_sent_at = None
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Password updated successfully. You can now log in.'}), 200

# --- Partner Endpoints ---

@app.route('/api/partner/dashboard', methods=['GET'])
def partner_dashboard():
    user_id = request.args.get('user_id')
    restaurants = Restaurant.query.filter_by(owner_id=user_id).all()
    if not restaurants:
        return jsonify({'status': 'error', 'message': 'No restaurant found for this partner'}), 404

    data = []
    for restaurant in restaurants:
        data.append({
            'id': restaurant.id,
            'name': restaurant.name,
            'category': restaurant.category,
            'reels': restaurant.reels,
            'slug': restaurant.slug,
            'certification_status': restaurant.certification_status,
            'audits': [{'date': a.audit_date.strftime('%Y-%m-%d'), 'result': a.result, 'status': a.status} for a in restaurant.audits]
        })

    return jsonify({'status': 'success', 'data': data}), 200

@app.route('/api/partner/shops', methods=['GET'])
def partner_shops():
    user_id = request.args.get('user_id')
    restaurants = Restaurant.query.filter_by(owner_id=user_id).all()
    return jsonify({'status': 'success', 'data': [
        {
            'id': r.id,
            'name': r.name,
            'category': r.category,
            'certification_status': r.certification_status,
            'slug': r.slug,
            'address': r.address,
            'owner_name': r.owner_name,
            'owner_phone': r.owner_phone,
            'working_hours': r.working_hours,
            'about': r.about,
            'cover_image_url': r.cover_image_url,
            'gallery_images': safe_json_list(r.gallery_images),
            'videos': safe_json_list(r.videos),
            'reels': safe_json_list(r.reels),
            'audits': [
                {
                    'id': a.id,
                    'date': a.audit_date.strftime('%Y-%m-%d'),
                    'result': a.result,
                    'status': a.status,
                    'overall_rating': a.overall_rating,
                    'hygiene_rating': a.hygiene_rating,
                    'taste_rating': a.taste_rating,
                    'quality_rating': a.quality_rating,
                    'report_url': a.report_url,
                    'notes': a.notes
                } for a in r.audits
            ]
        } for r in restaurants
    ]}), 200

@app.route('/api/partner/update', methods=['POST'])
def partner_update():
    data = request.json
    user_id = data.get('user_id')
    restaurant = Restaurant.query.filter_by(owner_id=user_id).first()
    
    if restaurant:
        restaurant.name = data.get('name', restaurant.name)
        restaurant.reels = data.get('reels', restaurant.reels)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Restaurant updated'}), 200
    return jsonify({'status': 'error', 'message': 'Restaurant not found'}), 404

@app.route('/api/partner/request-audit', methods=['POST'])
def partner_request_audit():
    data = request.json
    restaurant_id = data.get('restaurant_id')
    user_id = data.get('user_id')
    audit_type = data.get('audit_type', 'Hygiene')

    restaurant = None
    if restaurant_id:
        restaurant = Restaurant.query.get(restaurant_id)
    elif user_id:
        restaurant = Restaurant.query.filter_by(owner_id=user_id).first()

    if not restaurant:
        return jsonify({'status': 'error', 'message': 'Restaurant not found'}), 404

    if restaurant.certification_status not in ['Approved', 'Verified']:
        return jsonify({'status': 'error', 'message': 'Your onboarding is not approved yet.'}), 400

    audit = Audit(restaurant_id=restaurant.id, audit_type=audit_type, result='Pending', status='Pending Approval')
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Audit request submitted',
        'audit': {
            'date': audit.audit_date.strftime('%Y-%m-%d'),
            'result': audit.result,
            'status': audit.status
        }
    }), 201

# --- Admin Endpoints ---

@app.route('/api/admin/labs', methods=['POST'])
@require_admin
def add_lab():
    data = request.json
    lab = Lab(name=data.get('name'), address=data.get('address'), email=data.get('email'), phone=data.get('phone'))
    db.session.add(lab)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Lab added'}), 201

@app.route('/api/admin/labs', methods=['GET'])
def get_labs():
    labs = Lab.query.all()
    return jsonify({'status': 'success', 'data': [{'id': l.id, 'name': l.name, 'address': l.address, 'email': l.email, 'phone': l.phone} for l in labs]}), 200

@app.route('/api/admin/overview', methods=['GET'])
def admin_overview():
    onboarding_count = OnboardingRequest.query.filter_by(status='Pending').count()
    audit_request_count = Audit.query.filter(Audit.status.in_(['Pending Approval', 'Audit Pending'])).count()
    shops_count = Restaurant.query.count()

    onboarding_requests = OnboardingRequest.query.filter_by(status='Pending').all()
    audit_requests = Audit.query.filter(Audit.status.in_(['Pending Approval', 'Audit Pending'])).all()

    return jsonify({
        'status': 'success',
        'data': {
            'counts': {
                'onboarding_requests': onboarding_count,
                'audit_requests': audit_request_count,
                'total_shops': shops_count
            },
            'onboarding_requests': [
                {
                    'id': r.id,
                    'name': r.name,
                    'category': r.category,
                    'contact': r.contact,
                    'user_id': r.user_id,
                    'created_at': r.created_at.strftime('%Y-%m-%d')
                } for r in onboarding_requests
            ],
            'audit_requests': [
                {
                    'id': a.id,
                    'restaurant_id': a.restaurant_id,
                    'restaurant_name': a.restaurant.name if a.restaurant else None,
                    'status': a.status,
                    'requested_on': a.audit_date.strftime('%Y-%m-%d')
                } for a in audit_requests
            ]
        }
    }), 200

@app.route('/api/admin/onboarding/approve', methods=['POST'])
@require_admin
def approve_onboarding():
    data = request.json
    request_id = data.get('request_id')
    request_entry = OnboardingRequest.query.get(request_id)

    if not request_entry or request_entry.status != 'Pending':
        return jsonify({'status': 'error', 'message': 'Onboarding request not found'}), 404

    restaurant = Restaurant(
        name=request_entry.name,
        category=request_entry.category,
        certification_status='Approved',
        owner_id=request_entry.user_id,
        slug=make_slug(request_entry.name, request_entry.user_id)
    )
    request_entry.status = 'Approved'
    db.session.add(restaurant)
    db.session.commit()

    create_notification(
        f"Onboarding approved for {restaurant.name}.",
        notification_type='success',
        recipient_role='admin'
    )

    return jsonify({'status': 'success', 'message': 'Onboarding approved', 'restaurant_id': restaurant.id}), 200

@app.route('/api/admin/onboarding/reject', methods=['POST'])
@require_admin
def reject_onboarding():
    data = request.json
    request_id = data.get('request_id')
    reason = data.get('reason')
    request_entry = OnboardingRequest.query.get(request_id)

    if not request_entry or request_entry.status != 'Pending':
        return jsonify({'status': 'error', 'message': 'Onboarding request not found'}), 404

    request_entry.status = 'Rejected'
    db.session.commit()

    reason_text = f" Reason: {reason}" if reason else ''
    create_notification(
        f"Onboarding rejected for {request_entry.name}.{reason_text}",
        notification_type='warning',
        recipient_role='admin'
    )

    return jsonify({'status': 'success', 'message': 'Onboarding rejected'}), 200

@app.route('/api/admin/audit/approve', methods=['POST'])
@require_admin
def approve_audit_request():
    data = request.json
    audit_id = data.get('audit_id')
    audit = Audit.query.get(audit_id)

    if not audit:
        return jsonify({'status': 'error', 'message': 'Audit request not found'}), 404

    audit.status = 'Audit Pending'
    db.session.commit()

    return jsonify({'status': 'success', 'message': 'Audit request approved'}), 200

@app.route('/api/admin/audit/complete', methods=['POST'])
@require_admin
def complete_audit():
    data = request.json
    audit_id = data.get('audit_id')
    audit = Audit.query.get(audit_id)

    if not audit:
        return jsonify({'status': 'error', 'message': 'Audit request not found'}), 404

    audit.result = data.get('result')
    audit.status = 'Completed'
    audit.overall_rating = data.get('overall_rating')
    audit.hygiene_rating = data.get('hygiene_rating')
    audit.taste_rating = data.get('taste_rating')
    audit.quality_rating = data.get('quality_rating')
    audit.notes = data.get('notes')
    audit.report_url = data.get('report_url')

    if audit.result == 'Pass':
        audit.restaurant.certification_status = 'Verified'
    else:
        audit.restaurant.certification_status = 'Suspended'

    db.session.commit()

    create_notification(
        f"Audit completed for {audit.restaurant.name}. Result: {audit.result}.",
        notification_type='info',
        recipient_role='admin'
    )

    return jsonify({'status': 'success', 'message': 'Audit completed'}), 200

@app.route('/api/admin/notifications', methods=['GET'])
def get_notifications():
    role = request.args.get('role', 'admin')
    notifications = Notification.query.filter_by(recipient_role=role).order_by(Notification.created_at.desc()).limit(20).all()
    return jsonify({'status': 'success', 'data': [
        {
            'id': n.id,
            'message': n.message,
            'type': n.notification_type,
            'created_at': n.created_at.strftime('%Y-%m-%d %H:%M')
        } for n in notifications
    ]}), 200

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'Invalid file name'}), 400

    filename = secure_filename(file.filename)
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov', '.webm']:
        return jsonify({'status': 'error', 'message': 'Unsupported file type'}), 400

    unique_name = f"{uuid4().hex}{ext}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
    file.save(file_path)

    base_url = request.host_url.rstrip('/')
    return jsonify({'status': 'success', 'url': f"{base_url}/uploads/{unique_name}"}), 201

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/partner/shop/update', methods=['POST'])
def partner_update_shop():
    data = request.json
    restaurant_id = data.get('restaurant_id')
    user_id = data.get('user_id')

    restaurant = Restaurant.query.filter_by(id=restaurant_id, owner_id=user_id).first()
    if not restaurant:
        return jsonify({'status': 'error', 'message': 'Restaurant not found'}), 404

    restaurant.name = data.get('name', restaurant.name)
    if data.get('name'):
        restaurant.slug = make_slug(restaurant.name, restaurant.owner_id)
    restaurant.category = data.get('category', restaurant.category)
    restaurant.address = data.get('address', restaurant.address)
    restaurant.owner_name = data.get('owner_name', restaurant.owner_name)
    restaurant.owner_phone = data.get('owner_phone', restaurant.owner_phone)
    restaurant.working_hours = data.get('working_hours', restaurant.working_hours)
    restaurant.about = data.get('about', restaurant.about)
    restaurant.cover_image_url = data.get('cover_image_url', restaurant.cover_image_url)
    restaurant.gallery_images = json.dumps(data.get('gallery_images', safe_json_list(restaurant.gallery_images)))
    restaurant.videos = json.dumps(data.get('videos', safe_json_list(restaurant.videos)))
    restaurant.reels = json.dumps(data.get('reels', safe_json_list(restaurant.reels)))

    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Restaurant updated'}), 200

@app.route('/api/admin/shop/update', methods=['POST'])
@require_admin
def admin_update_shop():
    data = request.json
    restaurant_id = data.get('restaurant_id')
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({'status': 'error', 'message': 'Restaurant not found'}), 404

    restaurant.name = data.get('name', restaurant.name)
    if data.get('name'):
        restaurant.slug = make_slug(restaurant.name, restaurant.owner_id)
    restaurant.category = data.get('category', restaurant.category)
    restaurant.address = data.get('address', restaurant.address)
    restaurant.owner_name = data.get('owner_name', restaurant.owner_name)
    restaurant.owner_phone = data.get('owner_phone', restaurant.owner_phone)
    restaurant.working_hours = data.get('working_hours', restaurant.working_hours)
    restaurant.about = data.get('about', restaurant.about)
    restaurant.cover_image_url = data.get('cover_image_url', restaurant.cover_image_url)
    restaurant.gallery_images = json.dumps(data.get('gallery_images', safe_json_list(restaurant.gallery_images)))
    restaurant.videos = json.dumps(data.get('videos', safe_json_list(restaurant.videos)))
    restaurant.reels = json.dumps(data.get('reels', safe_json_list(restaurant.reels)))

    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Restaurant updated'}), 200

@app.route('/api/home-config', methods=['GET'])
def get_home_config():
    key = request.args.get('key')
    if key:
        config = HomeConfig.query.filter_by(key=key).first()
        if not config:
            return jsonify({'status': 'success', 'data': None}), 200
        return jsonify({'status': 'success', 'data': json.loads(config.value)}), 200

    configs = HomeConfig.query.all()
    payload = {c.key: json.loads(c.value) for c in configs}
    return jsonify({'status': 'success', 'data': payload}), 200

@app.route('/api/admin/home-config', methods=['POST'])
@require_admin
def update_home_config():
    data = request.json
    key = data.get('key')
    value = data.get('value')

    if not key:
        return jsonify({'status': 'error', 'message': 'Missing config key'}), 400

    config = HomeConfig.query.filter_by(key=key).first()
    if not config:
        config = HomeConfig(key=key, value=json.dumps(value or []))
        db.session.add(config)
    else:
        config.value = json.dumps(value or [])
    db.session.commit()

    return jsonify({'status': 'success', 'message': 'Home config updated'}), 200

# --- Testimonial Endpoints ---

@app.route('/api/testimonials', methods=['GET'])
def get_testimonials():
    featured_only = request.args.get('featured', 'false').lower() == 'true'
    query = Testimonial.query
    if featured_only:
        query = query.filter_by(is_featured=True)
    testimonials = query.order_by(Testimonial.created_at.desc()).all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'role': t.role,
        'content': t.content,
        'avatar_url': t.avatar_url,
        'is_featured': t.is_featured,
        'created_at': t.created_at.isoformat() if t.created_at else None
    } for t in testimonials])

@app.route('/api/admin/testimonials', methods=['POST'])
@require_admin
def create_testimonial():
    data = request.json
    t = Testimonial(
        name=data.get('name', ''),
        role=data.get('role', 'Consumer'),
        content=data.get('content', ''),
        avatar_url=data.get('avatar_url', ''),
        is_featured=data.get('is_featured', False)
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({'id': t.id, 'message': 'Testimonial created'}), 201

@app.route('/api/admin/testimonials/<int:tid>', methods=['PUT'])
@require_admin
def update_testimonial(tid):
    t = Testimonial.query.get_or_404(tid)
    data = request.json
    t.name = data.get('name', t.name)
    t.role = data.get('role', t.role)
    t.content = data.get('content', t.content)
    t.avatar_url = data.get('avatar_url', t.avatar_url)
    t.is_featured = data.get('is_featured', t.is_featured)
    db.session.commit()
    return jsonify({'message': 'Testimonial updated'})

@app.route('/api/admin/testimonials/<int:tid>', methods=['DELETE'])
@require_admin
def delete_testimonial(tid):
    t = Testimonial.query.get_or_404(tid)
    db.session.delete(t)
    db.session.commit()
    return jsonify({'message': 'Testimonial deleted'})

# --- Trust Story Block Endpoints ---

@app.route('/api/trust-stories', methods=['GET'])
def get_trust_stories():
    blocks = TrustStoryBlock.query.order_by(TrustStoryBlock.position).all()
    result = []
    for b in blocks:
        block_data = {
            'id': b.id,
            'block_type': b.block_type,
            'position': b.position,
            'config': json.loads(b.config) if b.config else {},
            'created_at': b.created_at.isoformat() if b.created_at else None
        }
        # If testimonial type, include the testimonial data
        if b.block_type == 'testimonial':
            config = json.loads(b.config) if b.config else {}
            tid = config.get('testimonial_id')
            if tid:
                t = Testimonial.query.get(tid)
                if t:
                    block_data['testimonial'] = {
                        'id': t.id,
                        'name': t.name,
                        'role': t.role,
                        'content': t.content,
                        'avatar_url': t.avatar_url
                    }
        result.append(block_data)
    return jsonify(result)

@app.route('/api/admin/trust-stories', methods=['POST'])
@require_admin
def create_trust_story_block():
    data = request.json
    max_pos = db.session.query(db.func.max(TrustStoryBlock.position)).scalar() or 0
    block = TrustStoryBlock(
        block_type=data.get('block_type', 'text'),
        position=data.get('position', max_pos + 1),
        config=json.dumps(data.get('config', {}))
    )
    db.session.add(block)
    db.session.commit()
    return jsonify({'id': block.id, 'message': 'Block created'}), 201

@app.route('/api/admin/trust-stories/<int:bid>', methods=['PUT'])
@require_admin
def update_trust_story_block(bid):
    block = TrustStoryBlock.query.get_or_404(bid)
    data = request.json
    if 'block_type' in data:
        block.block_type = data['block_type']
    if 'position' in data:
        block.position = data['position']
    if 'config' in data:
        block.config = json.dumps(data['config'])
    db.session.commit()
    return jsonify({'message': 'Block updated'})

@app.route('/api/admin/trust-stories/<int:bid>', methods=['DELETE'])
@require_admin
def delete_trust_story_block(bid):
    block = TrustStoryBlock.query.get_or_404(bid)
    db.session.delete(block)
    db.session.commit()
    return jsonify({'message': 'Block deleted'})

@app.route('/api/admin/trust-stories/reorder', methods=['POST'])
@require_admin
def reorder_trust_story_blocks():
    data = request.json  # [{"id": 1, "position": 0}, {"id": 2, "position": 1}, ...]
    if not isinstance(data, list):
        return jsonify({'error': 'Expected array of {id, position}'}), 400
    for item in data:
        block = TrustStoryBlock.query.get(item.get('id'))
        if block:
            block.position = item.get('position', block.position)
    db.session.commit()
    return jsonify({'message': 'Blocks reordered'})

# --- Consumer Endpoints ---

@app.route('/api/consumer/review', methods=['POST'])
def post_review():
    data = request.json
    restaurant_id = data.get('restaurant_id')
    if not restaurant_id:
        return jsonify({'status': 'error', 'message': 'restaurant_id is required'}), 400
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({'status': 'error', 'message': 'Restaurant not found'}), 404
    review = Review(
        restaurant_id=restaurant_id,
        user_id=data.get('user_id'),
        reviewer_name=data.get('reviewer_name', 'Anonymous'),
        content=data.get('content')
    )
    db.session.add(review)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Review posted'}), 201

@app.route('/api/consumer/safety-report', methods=['POST'])
def post_safety_report():
    """Endpoint for consumers to report safety concerns."""
    data = request.json
    restaurant_name = data.get('restaurant_name', 'Unknown')
    details = data.get('details', '')
    user_id = data.get('user_id')
    if not details:
        return jsonify({'status': 'error', 'message': 'Incident details are required'}), 400
    create_notification(
        f"SAFETY OVERRIDE: Report for \"{restaurant_name}\" — {details}",
        notification_type='error',
        recipient_role='admin'
    )
    return jsonify({'status': 'success', 'message': 'Safety report submitted. Our team will review this immediately.'}), 201

# --- Google OAuth Routes ---
import urllib.parse
import urllib.request as urllib_request_mod

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')

@app.route('/api/auth/google', methods=['GET'])
def google_login():
    if not GOOGLE_CLIENT_ID:
        return jsonify({'status': 'error', 'message': 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID in .env'}), 500
    
    # Dynamically determine the redirect URI so you don't need to configure it!
    scheme = 'http' if 'localhost' in request.host or '127.0.0.1' in request.host else 'https'
    dynamic_redirect_uri = os.getenv('GOOGLE_REDIRECT_URI') or f"{scheme}://{request.host}/api/auth/google/callback"

    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': dynamic_redirect_uri,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'select_account'
    }
    from flask import redirect as flask_redirect
    auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode(params)
    return flask_redirect(auth_url)

@app.route('/api/auth/google/callback', methods=['GET'])
def google_callback():
    import json as _json
    from flask import redirect as flask_redirect
    code = request.args.get('code')
    if not code:
        return jsonify({'status': 'error', 'message': 'No code provided by Google'}), 400

    scheme = 'http' if 'localhost' in request.host or '127.0.0.1' in request.host else 'https'
    dynamic_redirect_uri = os.getenv('GOOGLE_REDIRECT_URI') or f"{scheme}://{request.host}/api/auth/google/callback"

    token_data = urllib.parse.urlencode({
        'code': code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': dynamic_redirect_uri,
        'grant_type': 'authorization_code'
    }).encode()
    token_req = urllib_request_mod.Request('https://oauth2.googleapis.com/token', data=token_data, method='POST')
    token_req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    try:
        with urllib_request_mod.urlopen(token_req) as res:
            token_response = _json.loads(res.read())
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Token exchange failed: {str(e)}'}), 500

    access_token = token_response.get('access_token')
    if not access_token:
        return jsonify({'status': 'error', 'message': 'Failed to get access token'}), 500

    userinfo_req = urllib_request_mod.Request(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    try:
        with urllib_request_mod.urlopen(userinfo_req) as res:
            userinfo = _json.loads(res.read())
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to get user info: {str(e)}'}), 500

    google_email = userinfo.get('email')
    google_name = userinfo.get('name', google_email.split('@')[0] if google_email else 'user')

    if not google_email:
        return jsonify({'status': 'error', 'message': 'Could not get email from Google'}), 400

    user = User.query.filter_by(email=google_email).first()
    if not user:
        username = google_name.replace(' ', '_').lower()
        base_username = username
        counter = 1
        while User.query.filter_by(username=username).first():
            username = f"{base_username}{counter}"
            counter += 1
        user = User(
            username=username,
            password_hash=generate_password_hash(uuid4().hex),
            role='consumer',
            email=google_email,
            email_verified=True,
            email_verification_token=None
        )
        db.session.add(user)
        db.session.commit()

    import jwt as pyjwt
    token = pyjwt.encode(
        {'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=7)},
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )

    frontend_url = app.config['FRONTEND_URL'] or 'http://localhost:5173'
    return flask_redirect(f"{frontend_url}/google-auth-success?token={token}&role={user.role}&username={user.username}&id={user.id}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
