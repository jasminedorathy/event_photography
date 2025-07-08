# 📸 PhotoSphere - Professional Event Photography Portal

![Dashboard Preview](screenshots/dashboard.png)
![Gallery Preview](screenshots/gallery.png)

A full-stack web application for professional event photography management with modern features and secure architecture.

## 🌟 Key Features

### 🛡️ Security & Authentication
- JWT-based user authentication
- Role-based access control (User/Admin)
- Password hashing with Werkzeug
- CSRF protection on all forms

### 🖼️ Photo Management
- Drag-and-drop upload interface
- Automatic thumbnail generation
- Batch file processing
- Advanced image optimization
- Public/private album controls

### 💻 Modern UI/UX
- Glassmorphism design elements
- Dark/light mode toggle
- Responsive mobile-first layout
- Smooth CSS animations
- Intuitive navigation

### ⚙️ Admin Features
- User management dashboard
- Content moderation tools
- System analytics
- Database administration

## 🛠️ Technology Stack

**Backend:**
- Python 3.11+
- Flask framework
- SQLAlchemy ORM
- Flask-Login
- Pillow (image processing)

**Frontend:**
- Bootstrap 5
- JavaScript ES6+
- AOS animations
- Font Awesome icons
- Google Fonts typography

**Database:**
- SQLite (development)
- MySQL (production)

## 🚀 Installation Guide

### Prerequisites
- Python 3.11 or later
- pip package manager
- Git version control
- MySQL (for production)

### Development Setup
```bash
# Clone repository
git clone https://github.com/jasminedorathy/event_photography.git
cd photosphere

# Create virtual environment
python -m venv venv

# Activate environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python -c "from app import app, db; app.app_context().push(); db.create_all()"

# Run development server
python main.py

### 🏗️ Project Structure
text
photosphere/
├── app.py                 # Main application entry
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── static/                # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── images/            # Static images
├── templates/             # Jinja2 templates
│   ├── base.html          # Base template
│   ├── dashboard.html     # User dashboard
│   └── admin/             # Admin templates
├── uploads/               # User uploads
│   └── thumbnails/        # Generated thumbnails
└── README.md              # Project documentation

Access the application at: http://localhost:5000

## Default Admin Credentials:

Username: admin

Password: admin123

### SCREENSHOTS

![image](https://github.com/user-attachments/assets/f4ab10c3-6131-4e6b-bcb2-58ea205237a1)

![image](https://github.com/user-attachments/assets/b76a1ef7-f4e6-468e-8d21-3e58c165cbe5)

