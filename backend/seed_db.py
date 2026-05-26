import sys
import os
import json
from datetime import datetime

# Adjust Python path to load backend app and models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, User, Restaurant, Review, Audit, Rating, Lab, HomeConfig, OnboardingRequest, Notification

def seed():
    with app.app_context():
        print("Starting Database Seeding...")

        # 1. Clear existing data to avoid constraint violations
        db.session.query(Notification).delete()
        db.session.query(OnboardingRequest).delete()
        db.session.query(Rating).delete()
        db.session.query(Audit).delete()
        db.session.query(Review).delete()
        db.session.query(Restaurant).delete()
        db.session.query(Lab).delete()
        db.session.query(HomeConfig).delete()
        db.session.query(User).delete()
        db.session.commit()
        print("Cleared existing database tables successfully.")

        # 2. Seed Users
        # Admin User
        admin_user = User(username="admin", password_hash="admin123", role="admin")
        # Partner/Owner User
        partner_user = User(username="partner", password_hash="partner123", role="partner")
        # Consumer User
        consumer_user = User(username="consumer", password_hash="consumer123", role="consumer")
        
        db.session.add_all([admin_user, partner_user, consumer_user])
        db.session.commit()
        print(f"Users seeded: admin (id: {admin_user.id}), partner (id: {partner_user.id}), consumer (id: {consumer_user.id})")

        # 3. Seed Restaurants
        r1 = Restaurant(
            name="The Green Bistro",
            category="Healthy & Organic",
            certification_status="Verified",
            image_url="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
            cover_image_url="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
            address="14 Green Glen Layout, Outer Ring Rd, Bangalore 560103",
            owner_name="Deepesh Jindal",
            owner_phone="+91 99887 76655",
            working_hours="10:00 AM - 11:00 PM",
            about="The Green Bistro is dedicated to bringing clean, organic food directly from local farms to your plate. Our kitchen runs on zero plastic and clinical hygiene protocols.",
            slug="the-green-bistro-2",
            owner_id=partner_user.id,
            gallery_images=json.dumps([
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"
            ]),
            videos=json.dumps([]),
            reels=json.dumps([
                {"name": "Kitchen Hygiene Reel", "url": "https://instagram.com/reel/example1"},
                {"name": "Farm Sourcing Story", "url": "https://instagram.com/reel/example2"}
            ])
        )

        r2 = Restaurant(
            name="Blue Ocean Sushi & Dining",
            category="Japanese & Seafood",
            certification_status="Verified",
            image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
            cover_image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
            address="Level 2, Premium Mall, Colaba, Mumbai 400001",
            owner_name="Ren Tanaka",
            owner_phone="+91 91234 56789",
            working_hours="12:00 PM - 11:30 PM",
            about="Authentic Japanese dining crafted with imported, certified mercury-free fresh seafood. Tested regularly by bio-chemical laboratories for quality and taste excellence.",
            slug="blue-ocean-sushi-dining-2",
            owner_id=partner_user.id,
            gallery_images=json.dumps([
                "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80"
            ]),
            videos=json.dumps([]),
            reels=json.dumps([
                {"name": "Mastering the Knife", "url": "https://instagram.com/reel/example3"}
            ])
        )

        r3 = Restaurant(
            name="Crimson Kitchen",
            category="Multi-Cuisine Fine Dining",
            certification_status="Suspended",
            image_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
            cover_image_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
            address="8th Main Street, DLF Phase 3, Gurugram 122002",
            owner_name="Vikram Seth",
            owner_phone="+91 88776 65544",
            working_hours="1:00 PM - 12:00 AM",
            about="A gorgeous multi-cuisine space featuring luxury gourmet dishes. Currently seeking remediation for a minor compliance issue in standard refrigeration temperatures.",
            slug="crimson-kitchen-2",
            owner_id=partner_user.id,
            gallery_images=json.dumps([]),
            videos=json.dumps([]),
            reels=json.dumps([])
        )

        db.session.add_all([r1, r2, r3])
        db.session.commit()
        print("Restaurants seeded successfully.")

        # 4. Seed Ratings
        ratings = [
            Rating(restaurant_id=r1.id, pillar="Hygiene", score=95, details="Excellent score. Kitchen maintains outstanding sanitary standard, food prep surfaces are sanitized bi-hourly, staff use appropriate safety gears."),
            Rating(restaurant_id=r1.id, pillar="Taste", score=92, details="AI analysis of 450+ verified reviews indicates extremely high taste satisfaction, particularly in green protein bowls."),
            Rating(restaurant_id=r1.id, pillar="Quality", score=98, details="Zero adulterants detected. Chemical screening shows 100% pure organic ingredient supply chain."),
            
            Rating(restaurant_id=r2.id, pillar="Hygiene", score=96, details="Outstanding cold storage temperature maintenance (mandatory for raw fish). Grade-A sterile processing room."),
            Rating(restaurant_id=r2.id, pillar="Taste", score=95, details="Widely considered the finest sashimi and nigiri in the area. AI sentiment score 4.9/5."),
            Rating(restaurant_id=r2.id, pillar="Quality", score=94, details="NABL lab tests certify zero mercury and heavy metals content in fish shipments."),

            Rating(restaurant_id=r3.id, pillar="Hygiene", score=72, details="Refrigeration logs showed a temperature of 8C (should be < 4C) on recent surprise audit. Status suspended until rectified."),
            Rating(restaurant_id=r3.id, pillar="Taste", score=88, details="Very positive customer sentiment, fine dining dishes well received."),
            Rating(restaurant_id=r3.id, pillar="Quality", score=85, details="Ingredients tested passed standard safety scans, but kitchen requires equipment remediation.")
        ]
        db.session.add_all(ratings)
        db.session.commit()
        print("Ratings seeded successfully.")

        # 5. Seed Reviews
        reviews = [
            Review(restaurant_id=r1.id, user_id=consumer_user.id, reviewer_name="Sarah Jenkins", reviewer_type="Consumer", content="Knowing that a restaurant has the FoodTrust badge completely changes where we choose to eat. Absolute peace of mind."),
            Review(restaurant_id=r1.id, user_id=consumer_user.id, reviewer_name="Amit Sharma", reviewer_type="Consumer", content="The Green Bistro is phenomenal! Clean kitchen, high transparency, and delicious food."),
            Review(restaurant_id=r2.id, user_id=consumer_user.id, reviewer_name="M. Patel", reviewer_type="Consumer", content="The audit reports linked directly from the menu QR code are brilliant. Transparent and easy to read. Best Sushi in town."),
            Review(restaurant_id=r3.id, user_id=consumer_user.id, reviewer_name="Rohit Verma", reviewer_type="Consumer", content="Tastes wonderful, but I noticed their air conditioning and refrigeration were a bit warm. Hope they fix it!")
        ]
        db.session.add_all(reviews)
        db.session.commit()
        print("Reviews seeded successfully.")

        # 6. Seed Audits
        audits = [
            Audit(restaurant_id=r1.id, audit_type="Hygiene", result="Pass", status="Completed", overall_rating=4.8, hygiene_rating=4.9, taste_rating=4.6, quality_rating=4.9, notes="Clinical levels of sanitation. Excellent documentation.", report_url="https://jpureva-uploads.s3.amazonaws.com/reports/green_bistro_hygiene_report.pdf"),
            Audit(restaurant_id=r2.id, audit_type="Hygiene", result="Pass", status="Completed", overall_rating=4.7, hygiene_rating=4.8, taste_rating=4.7, quality_rating=4.6, notes="Outstanding sashimi safety controls.", report_url="https://jpureva-uploads.s3.amazonaws.com/reports/blue_ocean_sushi_report.pdf"),
            Audit(restaurant_id=r3.id, audit_type="Hygiene", result="Fail", status="Completed", overall_rating=3.2, hygiene_rating=3.0, taste_rating=4.4, quality_rating=4.0, notes="Refrigeration temperature violations. Pending remediation re-audit.", report_url="https://jpureva-uploads.s3.amazonaws.com/reports/crimson_kitchen_report.pdf")
        ]
        db.session.add_all(audits)
        db.session.commit()
        print("Audits seeded successfully.")

        # 7. Seed Labs
        labs = [
            Lab(name="Apex Analytical Laboratories", address="120 Science Park Rd, Bandra Kurla Complex, Mumbai, MH 400051", email="contact@apexanalytical.in", phone="+91 22 9876 5432"),
            Lab(name="BioTrace Food Diagnostics", address="Sector 5, Industrial Area, Okhla Phase III, Delhi 110020", email="info@biotrace.com", phone="+91 11 2233 4455"),
            Lab(name="Veritas Food Safety Labs", address="45 Tech Boulevard, Electronic City, Bangalore, KA 560100", email="support@veritaslabs.in", phone="+91 80 8899 0011")
        ]
        db.session.add_all(labs)
        db.session.commit()
        print("Labs seeded successfully.")

        # 8. Seed Home Configs
        reels_data = [
            {"name": "Organic Kitchen Tour", "url": "https://www.w3schools.com/html/mov_bbb.mp4"},
            {"name": "NABL Spectrometry Scan", "url": "https://www.w3schools.com/html/movie.mp4"},
            {"name": "Food Safety 101", "url": "https://www.w3schools.com/html/mov_bbb.mp4"},
            {"name": "Elite Partner Spotlight", "url": "https://www.w3schools.com/html/movie.mp4"}
        ]
        hc = HomeConfig(key="weekly_reels", value=json.dumps(reels_data))
        db.session.add(hc)
        db.session.commit()
        print("Home Config (weekly_reels) seeded successfully.")

        # 9. Seed Notifications
        notif = Notification(recipient_role="admin", message="System Database initialized with secure seed data.", notification_type="success")
        db.session.add(notif)
        db.session.commit()
        print("Initial Notification seeded.")

        print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
