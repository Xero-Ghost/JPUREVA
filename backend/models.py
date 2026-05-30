from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash

# Hardcoded admin credentials - only one admin allowed
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD_HASH = generate_password_hash('JPureva@Admin2026')
ADMIN_EMAIL = 'admin@jpureva.com'

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=False, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False) # admin, partner, consumer
    email = db.Column(db.String(120), unique=True, nullable=True)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    email_verification_token = db.Column(db.String(120), nullable=True)
    email_verification_sent_at = db.Column(db.DateTime, nullable=True)
    password_reset_token = db.Column(db.String(120), nullable=True)
    password_reset_sent_at = db.Column(db.DateTime, nullable=True)
    profile_image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    restaurants = db.relationship('Restaurant', backref='owner', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)

class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    certification_status = db.Column(db.String(50), default='Pending Audit') # Verified, Pending, Suspended
    last_verified = db.Column(db.DateTime, default=datetime.utcnow)
    image_url = db.Column(db.String(500))
    address = db.Column(db.String(500))
    owner_name = db.Column(db.String(120))
    owner_phone = db.Column(db.String(50))
    working_hours = db.Column(db.String(200))
    about = db.Column(db.Text)
    cover_image_url = db.Column(db.String(500))
    gallery_images = db.Column(db.Text) # JSON string array
    videos = db.Column(db.Text) # JSON string array
    reels = db.Column(db.Text) # JSON string of reel URLs
    slug = db.Column(db.String(255), unique=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    reviews = db.relationship('Review', backref='restaurant', lazy=True)
    audits = db.relationship('Audit', backref='restaurant', lazy=True)
    ratings = db.relationship('Rating', backref='restaurant', lazy=True)

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reviewer_name = db.Column(db.String(100), nullable=False)
    reviewer_type = db.Column(db.String(50), default='Consumer') # Consumer, Critic
    content = db.Column(db.Text, nullable=False)
    sentiment_score = db.Column(db.Float) # AI calculated score
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Audit(db.Model):
    __tablename__ = 'audits'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    audit_date = db.Column(db.DateTime, default=datetime.utcnow)
    audit_type = db.Column(db.String(50)) # Hygiene, Quality
    auditor_id = db.Column(db.Integer)
    result = db.Column(db.String(50)) # Pass, Fail
    status = db.Column(db.String(50), default='Pending Approval') # Pending Approval, Audit Pending, Completed
    overall_rating = db.Column(db.Float)
    hygiene_rating = db.Column(db.Float)
    taste_rating = db.Column(db.Float)
    quality_rating = db.Column(db.Float)
    report_url = db.Column(db.String(500))
    notes = db.Column(db.Text)

class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    pillar = db.Column(db.String(50), nullable=False) # Hygiene, Taste, Quality
    score = db.Column(db.Integer, nullable=False) # 1-5 scale or out of 100
    details = db.Column(db.Text)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ConnectionRequest(db.Model):
    __tablename__ = 'connection_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Lab(db.Model):
    __tablename__ = 'labs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class HomeConfig(db.Model):
    __tablename__ = 'home_configs'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False) # e.g., 'weekly_reels', 'weekly_stories'
    value = db.Column(db.Text) # JSON string array of IDs or URLs
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class OnboardingRequest(db.Model):
    __tablename__ = 'onboarding_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Pending') # Pending, Approved, Rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    recipient_role = db.Column(db.String(50), nullable=False) # admin, partner
    recipient_user_id = db.Column(db.Integer, nullable=True)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default='info') # info, success, warning, error
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Testimonial(db.Model):
    __tablename__ = 'testimonials'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # Consumer, Partner, Critic
    content = db.Column(db.Text, nullable=False)
    avatar_url = db.Column(db.String(500))
    is_featured = db.Column(db.Boolean, default=False)  # For landing page
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TrustStoryBlock(db.Model):
    __tablename__ = 'trust_story_blocks'
    id = db.Column(db.Integer, primary_key=True)
    block_type = db.Column(db.String(20), nullable=False)  # testimonial, image, video, text, document
    position = db.Column(db.Integer, nullable=False, default=0)
    config = db.Column(db.Text, nullable=False)  # JSON: depends on block_type
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def ensure_admin_exists():
    """Create the sole admin user if it doesn't exist."""
    from flask import current_app
    admin = User.query.filter_by(role='admin').first()
    if not admin:
        admin = User(
            username=ADMIN_USERNAME,
            password_hash=ADMIN_PASSWORD_HASH,
            email=ADMIN_EMAIL,
            role='admin',
            email_verified=True
        )
        db.session.add(admin)
        db.session.commit()
