/**
 * Contact Module - Professional Contact Page
 * @version 3.0.0 - Senior Level with Support Metrics
 */

const ContactModule = (function() {
    'use strict';

    let metricsObserver = null;

    /**
     * Initialize contact module
     */
    function init() {
        initContactForm();
        initFaqAccordion();
        initMetricsCounter();
        initWorkingHours();
        initLiveStatus();
        initChatButton();
    }

    /**
     * Initialize contact form with inquiry type
     */
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: contactForm.querySelector('input[placeholder="Your Name"]')?.value.trim(),
                email: contactForm.querySelector('input[placeholder="Email Address"]')?.value.trim(),
                phone: contactForm.querySelector('input[placeholder="Phone Number"]')?.value.trim(),
                inquiry_type: document.getElementById('inquiry-type')?.value,
                message: contactForm.querySelector('textarea')?.value.trim(),
                created_at: new Date().toISOString(),
                status: 'pending'
            };
            
            if (!formData.name || !formData.email || !formData.message) {
                UIModule.showPopup('Please fill in all required fields', 'warning');
                return;
            }
            
            if (!isValidEmail(formData.email)) {
                UIModule.showPopup('Please enter a valid email address', 'warning');
                return;
            }
            
            if (!formData.inquiry_type) {
                UIModule.showPopup('Please select an inquiry type', 'warning');
                return;
            }
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            UIModule.showButtonLoading(submitBtn, 'Sending...');
            
            const result = await window.supabaseService.insert('contact_messages', formData);
            
            UIModule.hideButtonLoading(submitBtn);
            
            if (result.success) {
                UIModule.showPopup('Message sent successfully! We\'ll get back to you within 24 hours ☕', 'success');
                contactForm.reset();
            } else {
                UIModule.showPopup('Failed to send message. Please try again.', 'error');
            }
        });
    }

    /**
     * Initialize FAQ accordion
     */
    function initFaqAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;
            
            question.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        });
        
        loadFaqFromSupabase();
    }

     /**
     * Load FAQ from Supabase
     */
    async function loadFaqFromSupabase() {
        const faqContainer = document.querySelector('.faq-container');
        if (!faqContainer) return;
        
        try {
            // ✅ جرب تجيب FAQ خاصة بالـ contact
            let result = await window.supabaseService.getAll('faq_items', {
                filters: { is_active: true, category: 'contact' },
                orderBy: { column: 'order', ascending: true }
            });
            
            // لو مفيش FAQ للـ contact، جيب الـ general
            if (!result.success || !result.data || result.data.length === 0) {
                result = await window.supabaseService.getAll('faq_items', {
                    filters: { is_active: true },
                    orderBy: { column: 'order', ascending: true }
                });
            }
            
            if (result.success && result.data && result.data.length > 0) {
                faqContainer.innerHTML = result.data.map(faq => `
                    <div class="faq-item">
                        <div class="faq-question">
                            <span>${escapeHtml(faq.question)}</span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>${escapeHtml(faq.answer)}</p>
                        </div>
                    </div>
                `).join('');
                
                // Reinitialize accordion
                const newFaqItems = document.querySelectorAll('.faq-item');
                newFaqItems.forEach(item => {
                    const question = item.querySelector('.faq-question');
                    if (question) {
                        question.addEventListener('click', () => {
                            newFaqItems.forEach(otherItem => {
                                if (otherItem !== item && otherItem.classList.contains('active')) {
                                    otherItem.classList.remove('active');
                                }
                            });
                            item.classList.toggle('active');
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error loading FAQ:', error);
        }
    }

    /**
     * Initialize metrics counter (Support Metrics)
     */
    function initMetricsCounter() {
        const metricNumbers = document.querySelectorAll('.metric-number');
        if (metricNumbers.length === 0) return;
        
        if (metricsObserver) metricsObserver.disconnect();
        
        metricsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const target = parseInt(element.dataset.target);
                    if (target && !element.classList.contains('counted')) {
                        animateMetricNumber(element, target);
                        element.classList.add('counted');
                    }
                    metricsObserver.unobserve(element);
                }
            });
        }, { threshold: 0.3 });
        
        metricNumbers.forEach(el => metricsObserver.observe(el));
    }

    /**
     * Animate metric number counting
     */
    function animateMetricNumber(element, target) {
        let current = 0;
        const increment = target / 50;
        const duration = 2000;
        const stepTime = duration / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = Math.floor(target);
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, stepTime);
    }

    /**
     * Initialize Working Hours from Supabase
     */
    async function initWorkingHours() {
        const hoursGrid = document.getElementById('hours-grid');
        if (!hoursGrid) return;
        
        try {
            const result = await window.supabaseService.getAll('working_hours', {
                orderBy: { column: 'order', ascending: true }
            });
            
            if (result.success && result.data && result.data.length > 0) {
                hoursGrid.innerHTML = result.data.map(h => `
                    <div class="hour-card animate-up">
                        <div class="day">${escapeHtml(h.day)}</div>
                        <div class="time">${escapeHtml(h.hours)}</div>
                    </div>
                `).join('');
                
                if (window.UIModule && window.UIModule.initScrollAnimations) {
                    window.UIModule.initScrollAnimations();
                }
            }
        } catch (error) {
            console.log('Using default hours (Supabase table not found)');
        }
    }

    /**
     * Initialize live status (Open/Closed)
     */
    function initLiveStatus() {
        updateLiveStatus();
        setInterval(updateLiveStatus, 60000);
    }

    /**
     * Update live status based on current time
     */
    function updateLiveStatus() {
        const statusContainer = document.getElementById('status-container');
        if (!statusContainer) return;
        
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        
        let isOpen = false;
        let message = '';
        
        if (day === 0) {
            isOpen = hour >= 12 && hour < 20;
            message = isOpen ? '☕ Open Now! (12PM - 8PM)' : '😴 Closed on Sundays';
        } else if (day === 5) {
            isOpen = hour >= 10 && hour < 24;
            message = isOpen ? '🌟 Open Late! (10AM - 12AM)' : '🔒 Closed';
        } else if (day === 6) {
            isOpen = hour >= 10 && hour < 24;
            message = isOpen ? '🎉 Weekend Mode! (10AM - 12AM)' : '🔒 Closed';
        } else {
            isOpen = hour >= 9 && hour < 22;
            message = isOpen ? '✅ Open Now! (9AM - 10PM)' : '🔒 Closed';
        }
        
        statusContainer.innerHTML = `
            <div class="status-badge ${isOpen ? 'open' : 'closed'}">
                <i class="fa-solid fa-circle"></i> ${message}
            </div>
        `;
    }

    /**
     * Initialize chat button
     */
    function initChatButton() {
        const chatBtn = document.getElementById('chatBtn');
        if (!chatBtn) return;
        
        chatBtn.addEventListener('click', () => {
            UIModule.showPopup('Live chat feature coming soon! Please call or email us for immediate assistance.', 'info');
        });
    }

    /**
     * Validate email format
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        return emailRegex.test(email);
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

    // Public API
    return {
        init,
        refreshHours: initWorkingHours
    };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    ContactModule.init();
});

window.ContactModule = ContactModule;