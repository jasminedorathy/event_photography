// Photo upload functionality

document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const uploadButton = document.getElementById('uploadButton');
    const filesInput = document.getElementById('files');
    const dropZone = document.getElementById('dropZone');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = uploadProgress ? uploadProgress.querySelector('.progress-bar') : null;

    if (!uploadForm) return;

    let selectedFiles = [];

    // Handle file selection
    if (filesInput) {
        filesInput.addEventListener('change', function(e) {
            handleFileSelection(e.target.files);
        });
    }

    // Handle drag and drop
    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            handleFileSelection(e.dataTransfer.files);
        });

        dropZone.addEventListener('click', function() {
            if (filesInput) {
                filesInput.click();
            }
        });
    }

    // Handle file selection
    function handleFileSelection(files) {
        selectedFiles = Array.from(files);
        
        if (selectedFiles.length === 0) {
            updateDropZoneText('Drag and drop photos here or click to select');
            return;
        }

        // Validate files
        const validFiles = [];
        const errors = [];

        selectedFiles.forEach(function(file) {
            if (!validateFileType(file)) {
                errors.push(`${file.name}: Invalid file type`);
            } else if (!validateFileSize(file)) {
                errors.push(`${file.name}: File too large (max 16MB)`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            alert('Some files were not selected:\n' + errors.join('\n'));
        }

        selectedFiles = validFiles;
        updateDropZoneText(`${selectedFiles.length} file(s) selected`);
        
        // Update files input
        if (filesInput) {
            const dt = new DataTransfer();
            selectedFiles.forEach(function(file) {
                dt.items.add(file);
            });
            filesInput.files = dt.files;
        }
    }

    // Update drop zone text
    function updateDropZoneText(text) {
        if (dropZone) {
            const textElement = dropZone.querySelector('p');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }

    // Handle upload
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            if (selectedFiles.length === 0) {
                alert('Please select at least one file to upload.');
                return;
            }

            const albumSelect = document.getElementById('album_select');
            if (albumSelect && !albumSelect.value) {
                alert('Please select an album.');
                return;
            }

            uploadFiles();
        });
    }

    // Upload files
    function uploadFiles() {
        const formData = new FormData();
        
        // Add files
        selectedFiles.forEach(function(file) {
            formData.append('files', file);
        });

        // Add form data
        const albumId = document.getElementById('album_select')?.value || 
                       document.querySelector('input[name="album_id"]')?.value;
        const title = document.getElementById('photo_title')?.value || '';
        const description = document.getElementById('photo_description')?.value || '';

        if (albumId) formData.append('album_id', albumId);
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);

        // Show progress
        showProgress(true);
        updateProgress(0);

        // Upload with fetch
        fetch('/upload_photo', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            if (!response.ok) {
                return response.json().then(function(data) {
                    throw new Error(data.error || 'Upload failed');
                });
            }
            return response.json();
        })
        .then(function(data) {
            updateProgress(100);
            showSuccess(data.message, document.body);
            
            // Reset form
            resetForm();
            
            // Close modal and reload page
            setTimeout(function() {
                const modal = bootstrap.Modal.getInstance(document.getElementById('uploadPhotosModal'));
                if (modal) {
                    modal.hide();
                }
                window.location.reload();
            }, 1500);
        })
        .catch(function(error) {
            showError(error.message || 'Upload failed. Please try again.', document.body);
        })
        .finally(function() {
            showProgress(false);
        });
    }

    // Show/hide progress
    function showProgress(show) {
        if (uploadProgress) {
            uploadProgress.style.display = show ? 'block' : 'none';
        }
        if (uploadButton) {
            uploadButton.disabled = show;
            uploadButton.innerHTML = show ? 
                '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...' : 
                '<i class="fas fa-cloud-upload-alt"></i> Upload Photos';
        }
    }

    // Update progress bar
    function updateProgress(percent) {
        if (progressBar) {
            progressBar.style.width = percent + '%';
            progressBar.textContent = percent + '%';
        }
    }

    // Reset form
    function resetForm() {
        if (uploadForm) {
            uploadForm.reset();
        }
        selectedFiles = [];
        updateDropZoneText('Drag and drop photos here or click to select');
    }

    // File validation functions
    function validateFileType(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return allowedTypes.includes(file.type);
    }

    function validateFileSize(file, maxSizeMB = 16) {
        const maxSize = maxSizeMB * 1024 * 1024;
        return file.size <= maxSize;
    }

    // Preview selected images
    function showImagePreviews(files) {
        const previewContainer = document.getElementById('imagePreview');
        if (!previewContainer) return;

        previewContainer.innerHTML = '';

        Array.from(files).forEach(function(file, index) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'img-thumbnail me-2 mb-2';
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Batch upload with progress tracking
    function uploadWithProgress(files, albumId, title, description) {
        return new Promise(function(resolve, reject) {
            const formData = new FormData();
            
            files.forEach(function(file) {
                formData.append('files', file);
            });
            
            formData.append('album_id', albumId);
            if (title) formData.append('title', title);
            if (description) formData.append('description', description);

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', function(e) {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    updateProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', function() {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error('Invalid response format'));
                    }
                } else {
                    try {
                        const error = JSON.parse(xhr.responseText);
                        reject(new Error(error.error || 'Upload failed'));
                    } catch (e) {
                        reject(new Error('Upload failed'));
                    }
                }
            });

            xhr.addEventListener('error', function() {
                reject(new Error('Network error occurred'));
            });

            xhr.open('POST', '/upload_photo');
            xhr.send(formData);
        });
    }
});
