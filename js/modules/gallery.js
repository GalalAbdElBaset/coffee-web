/**
 * Gallery Module - Footer gallery management
 * @version 1.0.0
 */

const GalleryModule = (function() {
    'use strict';

    let galleryImages = [];
    let galleryContainer = null;

    /**
     * Initialize gallery module
     */
    async function init() {
        galleryContainer = document.querySelector('.footer-gallery .gallery');
        if (!galleryContainer) return;
        
        await loadGalleryImages();
    }

    /**
     * Load gallery images from Supabase
     */
    async function loadGalleryImages() {
        try {
            const result = await window.supabaseService.getAll('gallery_images', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            });
            
            if (result.success && result.data.length > 0) {
                galleryImages = result.data;
            } else {
                const existingImages = galleryContainer.querySelectorAll('img');
                if (existingImages.length > 0) {
                    galleryImages = Array.from(existingImages).map((img, index) => ({
                        id: index,
                        image_url: img.src,
                        alt_text: img.alt || 'Gallery image',
                        order: index
                    }));
                }
            }
            
            // 👇 دايمًا يتعمل
            renderGallery();
        } catch (error) {
            console.error('Error loading gallery:', error);
        }
    }

    /**
     * Render gallery images
     */
    function renderGallery() {
        if (!galleryContainer) return;
        
        galleryContainer.innerHTML = galleryImages.map(img => `
            <img src="${img.image_url}" alt="${escapeHtml(img.alt_text)}" loading="lazy">
        `).join('');
    }

    /**
     * Escape HTML
     */
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    return {
        init
    };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    GalleryModule.init();
});

window.GalleryModule = GalleryModule;