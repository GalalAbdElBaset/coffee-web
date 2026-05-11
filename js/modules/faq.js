/**
 * FAQ Module - Manage frequently asked questions
 * @version 1.0.0
 */

const FaqModule = (function() {
    'use strict';

    let faqItems = [];
    let faqContainer = null;

    /**
     * Initialize FAQ module
     */
    async function init() {
        faqContainer = document.querySelector('.faq-container');
        if (!faqContainer) return;
        
        await loadFaqItems();
        initAccordion();
    }

    /**
     * Load FAQ items from Supabase
     */
    async function loadFaqItems() {
        try {
            const result = await window.supabaseService.getAll('faq_items', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            });
            
            if (result.success && result.data.length > 0) {
                faqItems = result.data;
                renderFaqItems();
            } else {
                // Load default FAQ
                loadDefaultFaq();
            }
        } catch (error) {
            console.error('Error loading FAQ:', error);
            loadDefaultFaq();
        }
    }

    /**
     * Load default FAQ items
     */
    function loadDefaultFaq() {
        faqItems = [
            {
                id: '1',
                question: '☕ What are your opening hours?',
                answer: 'We\'re open daily from 10:00 AM to 6:00 PM. Weekend hours may vary, so feel free to call ahead!',
                order: 1
            },
            {
                id: '2',
                question: '🚚 Do you offer delivery?',
                answer: 'Yes! We deliver within Assiut city. Delivery time is typically 30-45 minutes. Free delivery on orders over 200 EGP.',
                order: 2
            },
            {
                id: '3',
                question: '💳 What payment methods do you accept?',
                answer: 'We accept cash on delivery, credit/debit cards, and mobile wallets (Vodafone Cash, InstaPay).',
                order: 3
            },
            {
                id: '4',
                question: '🔄 What is your return policy?',
                answer: 'If you\'re not satisfied with your order, contact us within 30 minutes and we\'ll remake it or issue a refund.',
                order: 4
            },
            {
                id: '5',
                question: '🎉 Do you offer catering for events?',
                answer: 'Yes! We provide coffee catering for corporate events, weddings, and private parties. Contact us for a quote.',
                order: 5
            }
        ];
        renderFaqItems();
    }

    /**
     * Render FAQ items to DOM
     */
    function renderFaqItems() {
        if (!faqContainer) return;
        
        faqContainer.innerHTML = faqItems.map(item => `
            <div class="faq-item" data-id="${item.id}">
                <div class="faq-question">
                    <span>${escapeHtml(item.question)}</span>
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>${escapeHtml(item.answer)}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Initialize accordion functionality
     */
    function initAccordion() {
        const items = document.querySelectorAll('.faq-item');
        
        items.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;
            
            question.addEventListener('click', () => {
                // Close other items
                items.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        });
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
        init,
        getFaqItems: () => faqItems
    };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    FaqModule.init();
});

window.FaqModule = FaqModule;