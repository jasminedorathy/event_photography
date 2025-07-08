// Gallery functionality for viewing photos

document.addEventListener('DOMContentLoaded', function() {
    const galleryImages = document.querySelectorAll('.gallery-image');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('imageModalTitle');
    const modalDescription = document.getElementById('imageModalDescription');
    const viewPhotoLink = document.getElementById('viewPhotoLink');

    if (!imageModal) return;

    // Handle gallery image clicks
    galleryImages.forEach(function(img) {
        img.addEventListener('click', function() {
            const src = this.dataset.src;
            const title = this.dataset.title;
            const description = this.dataset.description;
            const photoId = this.dataset.photoId;

            if (modalImage) modalImage.src = src;
            if (modalTitle) modalTitle.textContent = title;
            if (modalDescription) modalDescription.textContent = description;
            if (viewPhotoLink && photoId) {
                viewPhotoLink.href = `/photo/${photoId}`;
            }
        });
    });

    // Keyboard navigation in modal
    imageModal.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            showPreviousImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    imageModal.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    imageModal.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                showNextImage();
            } else {
                showPreviousImage();
            }
        }
    }

    function showPreviousImage() {
        const currentImg = document.querySelector('.gallery-image.active');
        if (currentImg) {
            const prevImg = currentImg.parentElement.previousElementSibling?.querySelector('.gallery-image');
            if (prevImg) {
                prevImg.click();
            }
        }
    }

    function showNextImage() {
        const currentImg = document.querySelector('.gallery-image.active');
        if (currentImg) {
            const nextImg = currentImg.parentElement.nextElementSibling?.querySelector('.gallery-image');
            if (nextImg) {
                nextImg.click();
            }
        }
    }

    // Mark current image as active
    galleryImages.forEach(function(img) {
        img.addEventListener('click', function() {
            galleryImages.forEach(function(otherImg) {
                otherImg.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Zoom functionality
    let isZoomed = false;
    
    if (modalImage) {
        modalImage.addEventListener('click', function() {
            if (isZoomed) {
                this.style.transform = 'scale(1)';
                this.style.cursor = 'zoom-in';
                isZoomed = false;
            } else {
                this.style.transform = 'scale(1.5)';
                this.style.cursor = 'zoom-out';
                isZoomed = true;
            }
        });

        // Reset zoom when modal closes
        imageModal.addEventListener('hidden.bs.modal', function() {
            modalImage.style.transform = 'scale(1)';
            modalImage.style.cursor = 'zoom-in';
            isZoomed = false;
        });
    }

    // Lazy loading for gallery images
    if ('IntersectionObserver' in window) {
        const lazyGalleryImages = document.querySelectorAll('.gallery-image[data-src]');
        
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyGalleryImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // Masonry layout for gallery
    function initMasonry() {
        const gallery = document.querySelector('.photo-gallery');
        if (!gallery) return;

        // Simple masonry-like layout
        const columns = getComputedStyle(gallery).getPropertyValue('column-count');
        if (columns && columns !== 'auto') {
            gallery.style.columnGap = '1rem';
            gallery.style.breakInside = 'avoid';
        }
    }

    // Infinite scroll for large galleries
    function initInfiniteScroll() {
        const gallery = document.querySelector('.photo-gallery');
        if (!gallery) return;

        let loading = false;
        let page = 1;

        window.addEventListener('scroll', function() {
            if (loading) return;

            const scrollTop = window.pageYOffset;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - 1000) {
                loading = true;
                loadMorePhotos(page + 1);
            }
        });
    }

    function loadMorePhotos(page) {
        // Implementation would depend on backend API
        // This is a placeholder for infinite scroll functionality
        console.log('Loading more photos, page:', page);
    }

    // Filter and search functionality
    const searchInput = document.getElementById('photoSearch');
    const filterSelect = document.getElementById('photoFilter');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterPhotos(searchTerm);
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const filterValue = this.value;
            filterPhotosByCategory(filterValue);
        });
    }

    function filterPhotos(searchTerm) {
        galleryImages.forEach(function(img) {
            const title = img.dataset.title?.toLowerCase() || '';
            const description = img.dataset.description?.toLowerCase() || '';
            const card = img.closest('.card');

            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function filterPhotosByCategory(category) {
        galleryImages.forEach(function(img) {
            const imgCategory = img.dataset.category;
            const card = img.closest('.card');

            if (category === 'all' || imgCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Lightbox navigation
    function createLightboxNavigation() {
        const modal = document.getElementById('imageModal');
        if (!modal) return;

        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.className = 'btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3';
        prevBtn.style.zIndex = '1060';
        prevBtn.addEventListener('click', showPreviousImage);

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.className = 'btn btn-light position-absolute top-50 end-0 translate-middle-y me-3';
        nextBtn.style.zIndex = '1060';
        nextBtn.addEventListener('click', showNextImage);

        modal.appendChild(prevBtn);
        modal.appendChild(nextBtn);
    }

    // Initialize components
    initMasonry();
    initInfiniteScroll();
    createLightboxNavigation();

    // Preload next/previous images for smoother navigation
    function preloadImages() {
        galleryImages.forEach(function(img, index) {
            img.addEventListener('click', function() {
                // Preload next image
                if (index < galleryImages.length - 1) {
                    const nextImg = new Image();
                    nextImg.src = galleryImages[index + 1].dataset.src;
                }
                
                // Preload previous image
                if (index > 0) {
                    const prevImg = new Image();
                    prevImg.src = galleryImages[index - 1].dataset.src;
                }
            });
        });
    }

    preloadImages();
});
