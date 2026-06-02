from mongoengine import Document, StringField, BooleanField, DateTimeField, FloatField, ReferenceField, IntField, CASCADE
from datetime import datetime
from werkzeug.security import generate_password_hash

# Hardcoded admin credentials - only one admin allowed
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD_HASH = generate_password_hash('JPureva@Admin2026')
ADMIN_EMAIL = 'admin@jpureva.com'

class User(Document):
    meta = {'collection': 'users'}
    username = StringField(max_length=100, required=True)
    password_hash = StringField(max_length=255, required=True)
    role = StringField(max_length=50, required=True) # admin, partner, consumer
    email = StringField(max_length=120, unique=True, null=True)
    email_verified = BooleanField(default=False, required=True)
    email_verification_token = StringField(max_length=120, null=True)
    email_verification_sent_at = DateTimeField(null=True)
    password_reset_token = StringField(max_length=120, null=True)
    password_reset_sent_at = DateTimeField(null=True)
    profile_image_url = StringField(max_length=500, null=True)
    created_at = DateTimeField(default=datetime.utcnow)

class Restaurant(Document):
    meta = {'collection': 'restaurants'}
    name = StringField(max_length=255, required=True)
    category = StringField(max_length=100, required=True)
    certification_status = StringField(max_length=50, default='Pending Audit') # Verified, Pending, Suspended
    last_verified = DateTimeField(default=datetime.utcnow)
    image_url = StringField(max_length=500)
    address = StringField(max_length=500)
    owner_name = StringField(max_length=120)
    owner_phone = StringField(max_length=50)
    working_hours = StringField(max_length=200)
    about = StringField()
    cover_image_url = StringField(max_length=500)
    gallery_images = StringField() # JSON string array
    videos = StringField() # JSON string array
    reels = StringField() # JSON string of reel URLs
    slug = StringField(max_length=255, unique=True)
    owner_id = ReferenceField(User, reverse_delete_rule=CASCADE, null=True)

class Review(Document):
    meta = {'collection': 'reviews'}
    restaurant_id = ReferenceField(Restaurant, reverse_delete_rule=CASCADE, required=True)
    user_id = ReferenceField(User, reverse_delete_rule=CASCADE, null=True)
    reviewer_name = StringField(max_length=100, required=True)
    reviewer_type = StringField(max_length=50, default='Consumer') # Consumer, Critic
    content = StringField(required=True)
    sentiment_score = FloatField() # AI calculated score
    created_at = DateTimeField(default=datetime.utcnow)

class Audit(Document):
    meta = {'collection': 'audits'}
    restaurant_id = ReferenceField(Restaurant, reverse_delete_rule=CASCADE, required=True)
    audit_date = DateTimeField(default=datetime.utcnow)
    audit_type = StringField(max_length=50) # Hygiene, Quality
    auditor_id = StringField() # Using String since IDs are ObjectIds in Mongo
    result = StringField(max_length=50) # Pass, Fail
    status = StringField(max_length=50, default='Pending Approval') # Pending Approval, Audit Pending, Completed
    overall_rating = FloatField()
    hygiene_rating = FloatField()
    taste_rating = FloatField()
    quality_rating = FloatField()
    report_url = StringField(max_length=500)
    notes = StringField()

class Rating(Document):
    meta = {'collection': 'ratings'}
    restaurant_id = ReferenceField(Restaurant, reverse_delete_rule=CASCADE, required=True)
    pillar = StringField(max_length=50, required=True) # Hygiene, Taste, Quality
    score = IntField(required=True) # 1-5 scale or out of 100
    details = StringField()
    updated_at = DateTimeField(default=datetime.utcnow)

class ConnectionRequest(Document):
    meta = {'collection': 'connection_requests'}
    name = StringField(max_length=100, required=True)
    email = StringField(max_length=120, required=True)
    message = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

class Lab(Document):
    meta = {'collection': 'labs'}
    name = StringField(max_length=255, required=True)
    address = StringField(max_length=500)
    email = StringField(max_length=120)
    phone = StringField(max_length=50)
    created_at = DateTimeField(default=datetime.utcnow)

class HomeConfig(Document):
    meta = {'collection': 'home_configs'}
    key = StringField(max_length=50, unique=True, required=True) # e.g., 'weekly_reels', 'weekly_stories'
    value = StringField() # JSON string array of IDs or URLs
    updated_at = DateTimeField(default=datetime.utcnow)

class OnboardingRequest(Document):
    meta = {'collection': 'onboarding_requests'}
    user_id = ReferenceField(User, reverse_delete_rule=CASCADE, null=True)
    name = StringField(max_length=255, required=True)
    category = StringField(max_length=100, required=True)
    contact = StringField(max_length=200, required=True)
    status = StringField(max_length=50, default='Pending') # Pending, Approved, Rejected
    created_at = DateTimeField(default=datetime.utcnow)

class Notification(Document):
    meta = {'collection': 'notifications'}
    recipient_role = StringField(max_length=50, required=True) # admin, partner
    recipient_user_id = ReferenceField(User, reverse_delete_rule=CASCADE, null=True)
    message = StringField(required=True)
    notification_type = StringField(max_length=50, default='info') # info, success, warning, error
    is_read = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

class Testimonial(Document):
    meta = {'collection': 'testimonials'}
    name = StringField(max_length=150, required=True)
    role = StringField(max_length=50, required=True)  # Consumer, Partner, Critic
    content = StringField(required=True)
    avatar_url = StringField(max_length=500)
    is_featured = BooleanField(default=False)  # For landing page
    created_at = DateTimeField(default=datetime.utcnow)

class TrustStoryBlock(Document):
    meta = {'collection': 'trust_story_blocks'}
    block_type = StringField(max_length=20, required=True)  # testimonial, image, video, text, document
    position = IntField(required=True, default=0)
    config = StringField(required=True)  # JSON: depends on block_type
    created_at = DateTimeField(default=datetime.utcnow)

def ensure_admin_exists():
    """Create the sole admin user if it doesn't exist."""
    admin = User.objects(role='admin').first()
    if not admin:
        admin = User(
            username=ADMIN_USERNAME,
            password_hash=ADMIN_PASSWORD_HASH,
            email=ADMIN_EMAIL,
            role='admin',
            email_verified=True
        )
        admin.save()
