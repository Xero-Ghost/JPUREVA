# FoodTrust Platform

FoodTrust is a modern, transparent food auditing and review platform that bridges the gap between culinary quality, scientific lab testing, and consumer trust. Built with an editorial and premium design aesthetic, it ensures that high-quality establishments get the recognition they deserve while providing consumers with indisputable safety data.

## Features & Architecture

The application is built on a robust full-stack architecture featuring a **React (Vite)** frontend and a **Python (Flask)** backend with a PostgreSQL database.

### Role-Based Access Control (RBAC)
The platform features three distinct user roles, each with a dedicated dashboard:
1. **Admin (`/admin`)**: 
   - Manage the entire ecosystem.
   - Add new NABL-accredited Lab Partners.
   - Configure dynamic content for the Home page (e.g., setting the "Weekly Reels" and "Weekly Trust Stories").
   - Override or manage store configurations.
2. **Partner (`/partner/dashboard`)**:
   - For Elite Establishments and Shop Owners.
   - View historical Audit Reports and test results.
   - Update shop profile information (Name, Category).
   - Link Instagram Reels showcasing their kitchen hygiene.
3. **Consumer (`/consumer/dashboard`)**:
   - Submit reviews and testimonials.
   - Utilize the **Safety Override System** to immediately report critical hygiene breaches, triggering automated AI review alerts.

### Key Pages
- **Home**: Dynamic landing page featuring 3-pillar methodologies, connected stats, weekly trust stories, weekly reels, and a direct connection/inquiry form.
- **Audit Directory**: A searchable database of all certified establishments.
- **Lab Hub**: Transparency center detailing the scientific testing benchmarks (Trans-Fats, TPC, Sodium) and displaying Trusted Partner Labs fetched dynamically from the database.
- **Trust Stories**: A community ledger of verified experiences.
- **Partner Portal**: Marketing page explaining the ROI of the FoodTrust certification for prospective elite operators.

### Admin Workflow Updates
- Admin dashboard shows onboarding requests, audit requests, and total shop counts.
- Admin can approve or reject onboarding requests and complete audit reports.
- Latest admin notifications appear in the dashboard.

### Media Uploads
- Admin and Partner dashboards include image/video upload controls.
- Uploaded files are stored in `backend/uploads` and served via `/uploads/*`.

### Public Partner Pages
- Each approved shop gets a public page at `/<shop-name>-<user-id>`.
- The page displays cover image, audit summary, gallery, videos/reels, reviews, and shop details.

## Tech Stack
- **Frontend**: React 18, Vite, React Router DOM, Tailwind CSS (Custom Design System with `index.css`).
- **Backend**: Python 3, Flask, Flask-SQLAlchemy, Flask-CORS.
- **Database**: PostgreSQL (or SQLite for local rapid prototyping).

## Setup Instructions

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```
Install the required Python packages:
```bash
pip install -r requirements.txt
```
*Note: Ensure your PostgreSQL server is running. You can modify the `DATABASE_URL` environment variable or the fallback URI in `app.py` to match your local database credentials.*

Run the Flask server:
```bash
python app.py
```
*The server will automatically create the required database tables (`users`, `restaurants`, `labs`, `home_configs`, `connection_requests`, etc.) on the first run.*

### 2. Frontend Setup
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```
Install the Node dependencies:
```bash
npm install
```
Start the Vite development server:
```bash
npm run dev
```

### 3. Testing the Multi-Role System
To fully test the platform, you will need to register 3 accounts via the `/login` page:
1. Register an account and select the **Administrator** role.
2. Register an account and select the **Partner (Shop Owner)** role.
3. Register an account and select the **Consumer** role.

Log in with each account to view their respective secure dashboards.

## API Endpoints Reference
- **Auth**: `POST /api/register`, `POST /api/login`
- **Admin**: `GET/POST /api/admin/labs`
- **Partner**: `GET /api/partner/dashboard`, `POST /api/partner/update`
- **Consumer**: `POST /api/consumer/review`, `POST /api/consumer/report` (To be fully implemented)
- **Public**: `GET /api/restaurants`, `POST /api/connect`, `POST /api/onboard`
