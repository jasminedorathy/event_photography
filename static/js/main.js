// Main JavaScript file for Event Photography Portal

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Loading state management
    window.showLoading = function(element) {
        element.classList.add('loading');
        element.disabled = true;
    };

    window.hideLoading = function(element) {
        element.classList.remove('loading');
        element.disabled = false;
    };

    // Show error message
    window.showError = function(message, container) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        container.appendChild(alertDiv);
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            const alert = new bootstrap.Alert(alertDiv);
            alert.close();
        }, 5000);
    };

    // Show success message
    window.showSuccess = function(message, container) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        container.appendChild(alertDiv);
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            const alert = new bootstrap.Alert(alertDiv);
            alert.close();
        }, 5000);
    };

    // Form validation
    window.validateForm = function(formElement) {
        const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(function(input) {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });

        return isValid;
    };

    // File size validation
    window.validateFileSize = function(file, maxSizeMB = 16) {
        const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
        return file.size <= maxSize;
    };

    // File type validation
    window.validateFileType = function(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
        return allowedTypes.includes(file.type);
    };

    // Format file size
    window.formatFileSize = function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Copy to clipboard
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(function() {
            // Show success message
            const toast = new bootstrap.Toast(document.getElementById('copyToast'));
            toast.show();
        }).catch(function(err) {
            console.error('Failed to copy text: ', err);
        });
    };

    // Confirm deletion
    window.confirmDelete = function(message = 'Are you sure you want to delete this item?') {
        return confirm(message);
    };

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // ESC key to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(function(modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            });
        }
    });

    // Service worker registration for offline functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/js/sw.js').then(function(registration) {
            console.log('Service Worker registered successfully');
        }).catch(function(error) {
            console.log('Service Worker registration failed');
        });
    }

    // Check online status
    window.addEventListener('online', function() {
        showSuccess('You are back online!', document.body);
    });

    window.addEventListener('offline', function() {
        showError('You are offline. Some features may not work.', document.body);
    });
});
