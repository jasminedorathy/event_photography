import os
import uuid
from flask import render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from PIL import Image
from app import app, db
from models import User, Album, Photo, Comment
from utils import allowed_file, create_thumbnail

# Authentication routes
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        # Validation
        if not username or not email or not password:
            flash('All fields are required.', 'error')
            return render_template('register.html')
        
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('register.html')
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists.', 'error')
            return render_template('register.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists.', 'error')
            return render_template('register.html')
        
        # Create new user
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password.', 'error')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

# Main routes
@app.route('/')
def index():
    # Get recent public albums
    recent_albums = Album.query.filter_by(visibility='public').order_by(Album.created_at.desc()).limit(6).all()
    return render_template('index.html', recent_albums=recent_albums)

@app.route('/dashboard')
@login_required
def dashboard():
    # Get user's albums
    user_albums = Album.query.filter_by(created_by=current_user.id).order_by(Album.created_at.desc()).all()
    
    # Get all public albums
    public_albums = Album.query.filter_by(visibility='public').order_by(Album.created_at.desc()).all()
    
    return render_template('dashboard.html', user_albums=user_albums, public_albums=public_albums)

@app.route('/album/<int:album_id>')
def view_album(album_id):
    album = Album.query.get_or_404(album_id)
    
    # Check if user can view this album
    if album.visibility == 'private' and (not current_user.is_authenticated or 
                                         (current_user.id != album.created_by and current_user.role != 'admin')):
        flash('You do not have permission to view this album.', 'error')
        return redirect(url_for('index'))
    
    photos = Photo.query.filter_by(album_id=album_id).order_by(Photo.upload_date.desc()).all()
    return render_template('album.html', album=album, photos=photos)

@app.route('/photo/<int:photo_id>')
def view_photo(photo_id):
    photo = Photo.query.get_or_404(photo_id)
    
    # Check if user can view this photo
    if photo.album.visibility == 'private' and (not current_user.is_authenticated or 
                                               (current_user.id != photo.album.created_by and current_user.role != 'admin')):
        flash('You do not have permission to view this photo.', 'error')
        return redirect(url_for('index'))
    
    comments = Comment.query.filter_by(photo_id=photo_id).order_by(Comment.created_at.desc()).all()
    return render_template('photo.html', photo=photo, comments=comments)

@app.route('/create_album', methods=['POST'])
@login_required
def create_album():
    title = request.form['title']
    description = request.form.get('description', '')
    visibility = request.form.get('visibility', 'public')
    
    if not title:
        flash('Album title is required.', 'error')
        return redirect(url_for('dashboard'))
    
    album = Album(
        title=title,
        description=description,
        visibility=visibility,
        created_by=current_user.id
    )
    db.session.add(album)
    db.session.commit()
    
    flash('Album created successfully!', 'success')
    return redirect(url_for('view_album', album_id=album.id))

@app.route('/upload_photo', methods=['POST'])
@login_required
def upload_photo():
    if 'files' not in request.files:
        return jsonify({'error': 'No files selected'}), 400
    
    files = request.files.getlist('files')
    album_id = request.form.get('album_id')
    
    if not album_id:
        return jsonify({'error': 'Album ID is required'}), 400
    
    # Check if album exists and user has permission
    album = Album.query.get_or_404(album_id)
    if album.created_by != current_user.id and current_user.role != 'admin':
        return jsonify({'error': 'You do not have permission to upload to this album'}), 403
    
    uploaded_files = []
    
    for file in files:
        if file and file.filename and allowed_file(file.filename):
            # Generate unique filename
            original_filename = secure_filename(file.filename)
            filename = f"{uuid.uuid4()}.{original_filename.rsplit('.', 1)[1].lower()}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save file
            file.save(filepath)
            
            # Create thumbnail
            create_thumbnail(filepath, filename)
            
            # Get file info
            file_size = os.path.getsize(filepath)
            
            # Create photo record
            photo = Photo(
                filename=filename,
                original_filename=original_filename,
                title=request.form.get('title', original_filename),
                description=request.form.get('description', ''),
                album_id=album_id,
                uploaded_by=current_user.id,
                file_size=file_size,
                mime_type=file.mimetype
            )
            db.session.add(photo)
            uploaded_files.append(filename)
    
    db.session.commit()
    
    return jsonify({
        'message': f'{len(uploaded_files)} files uploaded successfully',
        'files': uploaded_files
    })

@app.route('/add_comment', methods=['POST'])
@login_required
def add_comment():
    photo_id = request.form['photo_id']
    comment_text = request.form['comment_text']
    
    if not comment_text:
        flash('Comment cannot be empty.', 'error')
        return redirect(url_for('view_photo', photo_id=photo_id))
    
    comment = Comment(
        photo_id=photo_id,
        user_id=current_user.id,
        comment_text=comment_text
    )
    db.session.add(comment)
    db.session.commit()
    
    flash('Comment added successfully!', 'success')
    return redirect(url_for('view_photo', photo_id=photo_id))

@app.route('/delete_comment/<int:comment_id>')
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    
    # Check if user can delete this comment
    if comment.user_id != current_user.id and current_user.role != 'admin':
        flash('You do not have permission to delete this comment.', 'error')
        return redirect(url_for('view_photo', photo_id=comment.photo_id))
    
    photo_id = comment.photo_id
    db.session.delete(comment)
    db.session.commit()
    
    flash('Comment deleted successfully!', 'success')
    return redirect(url_for('view_photo', photo_id=photo_id))

@app.route('/admin')
@login_required
def admin_panel():
    if current_user.role != 'admin':
        flash('You do not have permission to access the admin panel.', 'error')
        return redirect(url_for('dashboard'))
    
    # Get statistics
    total_users = User.query.count()
    total_albums = Album.query.count()
    total_photos = Photo.query.count()
    total_comments = Comment.query.count()
    
    # Get recent activity
    recent_photos = Photo.query.order_by(Photo.upload_date.desc()).limit(10).all()
    recent_comments = Comment.query.order_by(Comment.created_at.desc()).limit(10).all()
    
    return render_template('admin.html', 
                         total_users=total_users,
                         total_albums=total_albums,
                         total_photos=total_photos,
                         total_comments=total_comments,
                         recent_photos=recent_photos,
                         recent_comments=recent_comments)

# File serving routes
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/uploads/thumbnails/<filename>')
def thumbnail_file(filename):
    return send_from_directory(app.config['THUMBNAIL_FOLDER'], filename)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500
