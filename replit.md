# Event Photography Upload and Commenting Portal

## Overview

This is a comprehensive Flask-based web application for event photography management. It provides a platform for users to upload, organize, and share photos with community engagement features through comments and albums. The application supports both user and admin roles with appropriate access controls.

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy integration
- **Authentication**: Flask-Login for session management
- **Image Processing**: Pillow (PIL) for thumbnail generation and image manipulation
- **Security**: Werkzeug for password hashing and file handling

### Frontend Architecture
- **Template Engine**: Jinja2 (Flask's default)
- **CSS Framework**: Bootstrap 5 with dark theme
- **JavaScript**: Vanilla ES6+ for interactive features
- **Icons**: Font Awesome 6.0
- **Responsive Design**: Mobile-first approach using Bootstrap's grid system

### Database Schema
- **Users**: Authentication and profile management
- **Albums**: Photo organization with visibility controls
- **Photos**: Image metadata and file management
- **Comments**: User engagement on photos
- **Relationships**: One-to-many relationships between users-albums, albums-photos, and photos-comments

## Key Components

### Authentication System
- User registration and login with secure password hashing
- Role-based access control (user/admin)
- Session management with Flask-Login
- Protected routes for authenticated users

### Photo Management
- Drag-and-drop file upload interface
- File validation (type, size, format)
- Automatic thumbnail generation
- Image metadata storage
- Support for multiple image formats (PNG, JPG, JPEG, GIF, WebP)

### Album Organization
- Album creation and management
- Public/private visibility settings
- Photo organization within albums
- Creator ownership and permissions

### Comment System
- User commenting on individual photos
- Comment display and management
- Integration with photo detail views

### Admin Panel
- System statistics dashboard
- User and content management
- Content moderation capabilities

## Data Flow

1. **User Registration/Login**: User creates account → Password hashed → Session created
2. **Photo Upload**: File selected → Validated → Uploaded to server → Thumbnail generated → Metadata stored in database
3. **Album Creation**: User creates album → Album metadata stored → Photos can be added
4. **Photo Viewing**: User requests photo → Database query → File served → Comments loaded
5. **Comment Creation**: User submits comment → Validation → Database storage → Display update

## External Dependencies

### Python Packages
- Flask: Web framework
- Flask-SQLAlchemy: Database ORM
- Flask-Login: Authentication
- Pillow: Image processing
- Werkzeug: Security utilities

### Frontend Libraries
- Bootstrap 5: UI framework with dark theme
- Font Awesome: Icon library
- Vanilla JavaScript: No external JS frameworks

### Development Tools
- SQLite: Development database
- XAMPP: Production MySQL setup option

## Deployment Strategy

### Development Environment
- SQLite database for local development
- Flask development server
- Debug mode enabled
- File-based session storage

### Production Considerations
- MySQL database support (XAMPP compatible)
- Environment variables for sensitive configuration
- ProxyFix middleware for deployment behind reverse proxy
- Configurable upload limits and file size restrictions
- Proper error handling and logging

### Configuration Management
- Environment-based configuration
- Separate development and production settings
- Secure session key management
- Database connection pooling

## Changelog
- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.