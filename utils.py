import os
from PIL import Image
from app import app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    """Check if uploaded file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_thumbnail(filepath, filename, size=(300, 300)):
    """Create thumbnail for uploaded image"""
    try:
        with Image.open(filepath) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Create thumbnail
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Save thumbnail
            thumbnail_path = os.path.join(app.config['THUMBNAIL_FOLDER'], filename)
            img.save(thumbnail_path, 'JPEG', quality=85)
            
        return True
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return False

def get_file_size_mb(filepath):
    """Get file size in MB"""
    size_bytes = os.path.getsize(filepath)
    return round(size_bytes / (1024 * 1024), 2)
