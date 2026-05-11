/**
 * Services Module - Professional Dynamic Services Page
 * @version 8.0.0 - Enterprise Grade with ServicePopup Singleton
 */

const ServicesModule = (function() {
    'use strict';

    // ========== ENTERPRISE POPUP SYSTEM (SINGLETON) ==========
    const ServicePopup = (function() {
        let popup = null;
        let state = {
            initialized: false,
            active: false
        };

        const SELECTORS = {
            popup: '#servicePopup',
            icon: '#popupIcon',
            title: '#popupTitle',
            desc: '#popupDescription',
            features: '#popupFeaturesList'
        };

        function init() {
            if (state.initialized) return;
            ensurePopupExists();
            cacheDOM();
            bindEvents();
            state.initialized = true;
        }

        function ensurePopupExists() {
            if (document.querySelector(SELECTORS.popup)) return;

            const html = `
            <div id="servicePopup" class="service-popup-overlay">
                <div class="service-popup-content">
                    <div class="service-popup-header">
                        <div class="service-popup-icon" id="popupIcon">
                            <i class="fa-solid fa-mug-hot"></i>
                        </div>
                        <button class="service-popup-close" data-action="close">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <div class="service-popup-body">
                        <h2 id="popupTitle"></h2>
                        <p id="popupDescription"></p>
                        <div class="service-popup-features">
                            <h4>What's Included:</h4>
                            <ul id="popupFeaturesList"></ul>
                        </div>
                        <div class="service-popup-actions">
                            <button class="btn-primary" data-action="book">Book This Service</button>
                            <button class="btn-secondary" data-action="close">Close</button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', html);
        }

        function cacheDOM() {
            popup = document.querySelector(SELECTORS.popup);
        }

        function bindEvents() {
            if (!popup) return;
            popup.addEventListener('click', handleClick);
            document.addEventListener('keydown', handleKeydown);
        }

        function handleClick(e) {
            const action = e.target.closest('[data-action]')?.dataset?.action;
            if (e.target === popup || action === 'close') {
                close();
                return;
            }
            if (action === 'book') {
                close();
                const bookingSection = document.getElementById('booking-section');
                if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
            }
        }

        function handleKeydown(e) {
            if (e.key === 'Escape' && state.active) close();
        }

        function open(service) {
            if (!popup) return;
            
            const icon = document.getElementById('popupIcon');
            const title = document.getElementById('popupTitle');
            const desc = document.getElementById('popupDescription');
            const features = document.getElementById('popupFeaturesList');

            if (icon) icon.innerHTML = `<i class="${escapeHtml(service.icon) || 'fa-solid fa-mug-hot'}"></i>`;
            if (title) title.textContent = service.title || '';
            if (desc) desc.textContent = service.description || '';
            
            if (features) {
                const list = (service.features && service.features.length) ? service.features : [
                    'Premium quality coffee beans',
                    'Expert barista preparation',
                    'Free delivery on orders over 200 EGP',
                    '24/7 customer support'
                ];
                features.innerHTML = list.map(f => `<li><i class="fa-regular fa-circle-check"></i> ${escapeHtml(f)}</li>`).join('');
            }

            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
            state.active = true;
        }

        function close() {
            if (!popup) return;
            popup.classList.remove('active');
            document.body.style.overflow = '';
            state.active = false;
        }

        function escapeHtml(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        return { init, open, close };
    })();

    // ========== MODULE VARIABLES ==========
    let featuresGrid, membershipGrid, benefitsGrid, partnersGrid, whyChooseGrid, awardsGrid, popularGrid;
    let newsletterForm;
    let initialized = false;
    let abortController = null;

    // Allowed icons whitelist (XSS prevention)
    const ALLOWED_ICONS = [
        'fa-solid fa-mug-hot', 'fa-solid fa-user-chef', 'fa-solid fa-truck', 'fa-solid fa-headset',
        'fa-solid fa-leaf', 'fa-solid fa-award', 'fa-solid fa-heart', 'fa-solid fa-brain',
        'fa-solid fa-heartbeat', 'fa-solid fa-fire', 'fa-solid fa-shield-heart', 'fa-regular fa-user',
        'fa-regular fa-gem', 'fa-regular fa-star', 'fa-solid fa-trophy', 'fa-solid fa-medal',
        'fa-solid fa-certificate', 'fa-regular fa-handshake', 'fa-solid fa-star'
    ];

    function sanitizeIcon(icon) {
        if (!icon || typeof icon !== 'string') return 'fa-solid fa-mug-hot';
        return ALLOWED_ICONS.includes(icon) ? icon : 'fa-solid fa-mug-hot';
    }

    function optimizeImageUrl(url) {
        if (!url) return 'img/logo.png';
        try {
            const imageUrl = new URL(url);
            imageUrl.searchParams.set('w', '400');
            imageUrl.searchParams.set('q', '80');
            imageUrl.searchParams.set('auto', 'format');
            return imageUrl.toString();
        } catch {
            return url.split('?')[0] + '?w=400&q=80&auto=format';
        }
    }

    function clampRating(rating) {
        return Math.max(0, Math.min(5, rating || 5));
    }

    async function init() {
        if (initialized) return;
        
        if (abortController) {
            try { abortController.abort(); } catch(e) {}
        }
        abortController = new AbortController();
        
        try {
            initialized = true;
            console.log('🚀 Services Module v8.0.0 Initializing...');
            
            featuresGrid = document.getElementById('services-features-grid');
            membershipGrid = document.getElementById('membership-grid');
            benefitsGrid = document.getElementById('coffee-benefits-grid');
            partnersGrid = document.getElementById('partners-grid');
            whyChooseGrid = document.getElementById('why-choose-grid');
            awardsGrid = document.getElementById('awards-grid');
            popularGrid = document.getElementById('popular-coffees-grid');
            newsletterForm = document.getElementById('services-newsletter-form');
            
            // Initialize Enterprise Popup System
            ServicePopup.init();
            
            await Promise.all([
                loadServicesFeatures(),
                loadMembershipPlans(),
                loadCoffeeBenefits(),
                loadPartners(),
                loadWhyChooseUs(),
                loadAwards(),
                loadPopularCoffees()
            ]);
            
            initStatsCounter();
            initBookingForm();
            initNewsletterForm();
            initScrollAnimations();
            initMembershipEventDelegation();
            
            console.log('✅ Services Module Loaded Successfully');
        } catch(error) {
            initialized = false;
            console.error('❌ Services Module initialization failed:', error);
        }
    }

    function initMembershipEventDelegation() {
        if (!membershipGrid) return;
        membershipGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.membership-btn');
            if (!btn) return;
            const planName = btn.getAttribute('data-plan');
            if (!window.supabaseService?.isAuthenticated()) {
                UIModule.showProtectedPopup();
                return;
            }
            UIModule.showPopup(`You selected ${planName} plan! Our team will contact you soon.`, 'success');
        });
    }

    // ========== SERVICES FEATURES ==========
    async function loadServicesFeatures() {
        if (!featuresGrid) return;
        try {
            const result = await window.supabaseService.getAll('services_features', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderFeatures(result.data);
            } else {
                featuresGrid.innerHTML = getDefaultFeaturesHTML();
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading features:', error);
            featuresGrid.innerHTML = getDefaultFeaturesHTML();
        }
        
        // Event delegation for feature links
        featuresGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.feature-link');
            if (!btn) return;
            e.preventDefault();
            const encodedData = btn.getAttribute('data-service');
            if (encodedData) {
                try {
                    const service = JSON.parse(decodeURIComponent(encodedData));
                    ServicePopup.open(service);
                } catch (error) {
                    console.error('Error parsing service data:', error);
                    const card = btn.closest('.service-feature-card');
                    const title = card?.querySelector('h3')?.textContent || 'Service';
                    const description = card?.querySelector('p')?.textContent || 'Premium coffee service';
                    const iconElem = card?.querySelector('.feature-icon-wrapper i');
                    const icon = iconElem ? iconElem.className : 'fa-solid fa-mug-hot';
                    ServicePopup.open({ title, description, icon, features: [] });
                }
            }
        });
    }

    function getDefaultFeaturesHTML() {
        const defaultServices = [
            { title: 'Premium Coffee', description: '100% Arabica beans sourced from the best farms worldwide', icon: 'fa-solid fa-mug-hot', features: ['Single-origin Arabica beans', 'Freshly roasted daily', 'Expertly brewed to perfection', 'Rich aroma and smooth taste'] },
            { title: 'Expert Baristas', description: 'Certified professionals crafting your perfect cup', icon: 'fa-solid fa-user-chef', features: ['Certified professional baristas', 'Years of experience', 'Personalized service', 'Coffee brewing workshops'] },
            { title: 'Fast Delivery', description: 'Free delivery within 30-45 minutes on orders over 200 EGP', icon: 'fa-solid fa-truck', features: ['Free delivery over 200 EGP', '30-45 minute delivery time', 'Real-time order tracking', 'Contactless delivery option'] }
        ];
        
        return defaultServices.map((service, index) => `
            <div class="service-feature-card animate-up" style="--delay: ${index * 0.1}s">
                <div class="feature-icon-wrapper"><i class="${service.icon}"></i></div>
                <h3>${escapeHtml(service.title)}</h3>
                <p>${escapeHtml(service.description)}</p>
                <button type="button" class="feature-link" data-service='${encodeURIComponent(JSON.stringify(service))}'>Learn More →</button>
            </div>
        `).join('');
    }

    function renderFeatures(features) {
        if (!featuresGrid) return;
        
        featuresGrid.innerHTML = features.map((feature, index) => {
            let serviceFeatures = [];
            if (feature.features && Array.isArray(feature.features)) {
                serviceFeatures = feature.features;
            } else {
                serviceFeatures = ['Premium quality service', 'Expert professionals', 'Satisfaction guaranteed', 'Best price guarantee'];
            }
            
            const serviceData = {
                title: feature.title,
                description: feature.description || 'Premium coffee service tailored just for you.',
                icon: sanitizeIcon(feature.icon),
                features: serviceFeatures
            };
            
            return `
                <div class="service-feature-card animate-up" style="--delay: ${index * 0.1}s">
                    <div class="feature-icon-wrapper"><i class="${escapeHtml(serviceData.icon)}"></i></div>
                    <h3>${escapeHtml(serviceData.title)}</h3>
                    <p>${escapeHtml(serviceData.description)}</p>
                    <button type="button" class="feature-link" data-service='${encodeURIComponent(JSON.stringify(serviceData))}'>Learn More →</button>
                </div>
            `;
        }).join('');
    }

    // ========== POPULAR COFFEES ==========
    async function loadPopularCoffees() {
        if (!popularGrid) return;
        try {
            const result = await window.supabaseService.getAll('popular_coffees', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderPopularCoffees(result.data);
            } else {
                popularGrid.innerHTML = getDefaultPopularCoffeesHTML();
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading popular coffees:', error);
            popularGrid.innerHTML = getDefaultPopularCoffeesHTML();
        }
    }

    function getDefaultPopularCoffeesHTML() {
        const defaultCoffees = [
            { name: 'Caffè Latte', image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&q=80&auto=format', description: 'Smooth espresso blended with steamed milk', rating: 4.8 },
            { name: 'Flat White', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80&auto=format', description: 'Rich espresso with velvety steamed milk', rating: 4.9 },
            { name: 'Caramel Macchiato', image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&q=80&auto=format', description: 'Vanilla syrup with espresso and caramel drizzle', rating: 4.7 },
            { name: 'Mocha', image_url: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&q=80&auto=format', description: 'Espresso with chocolate and steamed milk', rating: 4.8 }
        ];
        
        return defaultCoffees.map((coffee, index) => `
            <div class="coffee-showcase-card animate-up" style="--delay: ${index * 0.1}s">
                <div class="coffee-img">
                    <img src="${coffee.image_url}" alt="${coffee.name}" loading="lazy">
                    <div class="coffee-rating">${getStarRating(coffee.rating)}</div>
                </div>
                <h3>${escapeHtml(coffee.name)}</h3>
                <p>${escapeHtml(coffee.description)}</p>
            </div>
        `).join('');
    }

    function renderPopularCoffees(coffees) {
        if (!popularGrid) return;
        popularGrid.innerHTML = coffees.map((coffee, index) => `
            <div class="coffee-showcase-card animate-up" style="--delay: ${index * 0.1}s">
                <div class="coffee-img">
                    <img src="${optimizeImageUrl(coffee.image_url)}" alt="${escapeHtml(coffee.name)}" loading="lazy" onerror="this.src='img/logo.png'">
                    <div class="coffee-rating">${getStarRating(clampRating(coffee.rating || 5))}</div>
                </div>
                <h3>${escapeHtml(coffee.name)}</h3>
                <p>${escapeHtml(coffee.description || 'Delicious coffee')}</p>
            </div>
        `).join('');
    }

    // ========== MEMBERSHIP PLANS ==========
    async function loadMembershipPlans() {
        if (!membershipGrid) return;
        try {
            const result = await window.supabaseService.getAll('membership_plans', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderMembershipPlans(result.data);
            } else {
                membershipGrid.innerHTML = getDefaultMembershipHTML();
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading membership:', error);
            membershipGrid.innerHTML = getDefaultMembershipHTML();
        }
    }

    function getDefaultMembershipHTML() {
        return `
            <div class="membership-card animate-up"><div class="membership-icon"><i class="fa-regular fa-user"></i></div><h3>Basic</h3><div class="membership-price">199 EGP<span>/month</span></div><ul class="membership-features"><li><i class="fa-regular fa-circle-check"></i> 10% off on all drinks</li><li><i class="fa-regular fa-circle-check"></i> Free birthday coffee</li><li><i class="fa-regular fa-circle-check"></i> Priority support</li></ul><button class="membership-btn" data-plan="Basic">Join Now</button></div>
            <div class="membership-card featured animate-up"><div class="membership-badge">Most Popular</div><div class="membership-icon"><i class="fa-regular fa-gem"></i></div><h3>Premium</h3><div class="membership-price">399 EGP<span>/month</span></div><ul class="membership-features"><li><i class="fa-regular fa-circle-check"></i> 25% off on all drinks</li><li><i class="fa-regular fa-circle-check"></i> Free delivery all orders</li><li><i class="fa-regular fa-circle-check"></i> Exclusive offers & events</li><li><i class="fa-regular fa-circle-check"></i> Priority support 24/7</li></ul><button class="membership-btn" data-plan="Premium">Join Now</button></div>
            <div class="membership-card animate-up"><div class="membership-icon"><i class="fa-regular fa-star"></i></div><h3>Gold</h3><div class="membership-price">699 EGP<span>/month</span></div><ul class="membership-features"><li><i class="fa-regular fa-circle-check"></i> 40% off on all drinks</li><li><i class="fa-regular fa-circle-check"></i> Free delivery + priority</li><li><i class="fa-regular fa-circle-check"></i> Monthly coffee box</li><li><i class="fa-regular fa-circle-check"></i> Personal barista sessions</li></ul><button class="membership-btn" data-plan="Gold">Join Now</button></div>
        `;
    }

    function renderMembershipPlans(plans) {
        if (!membershipGrid) return;
        membershipGrid.innerHTML = plans.map((plan, index) => `
            <div class="membership-card ${plan.is_featured ? 'featured' : ''} animate-up" style="--delay: ${index * 0.1}s">
                ${plan.is_featured ? '<div class="membership-badge">Most Popular</div>' : ''}
                <div class="membership-icon"><i class="${sanitizeIcon(plan.icon)}"></i></div>
                <h3>${escapeHtml(plan.name)}</h3>
                <div class="membership-price">${escapeHtml(plan.price)}<span>/${escapeHtml(plan.period || 'month')}</span></div>
                <ul class="membership-features">
                    ${Array.isArray(plan.features) && plan.features.length > 0 
                        ? plan.features.map(f => `<li><i class="fa-regular fa-circle-check"></i> ${escapeHtml(f)}</li>`).join('')
                        : '<li><i class="fa-regular fa-circle-check"></i> Exclusive benefits</li>'}
                </ul>
                <button class="membership-btn" data-plan="${escapeHtml(plan.name)}">Join Now</button>
            </div>
        `).join('');
    }

    // ========== COFFEE BENEFITS ==========
    async function loadCoffeeBenefits() {
        if (!benefitsGrid) return;
        try {
            const result = await window.supabaseService.getAll('coffee_benefits', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderBenefits(result.data);
            } else {
                benefitsGrid.innerHTML = getDefaultBenefitsHTML();
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading benefits:', error);
            benefitsGrid.innerHTML = getDefaultBenefitsHTML();
        }
    }

    function getDefaultBenefitsHTML() {
        return `
            <div class="benefit-card animate-up"><div class="benefit-icon"><i class="fa-solid fa-brain"></i></div><h3>Boosts Brain Function</h3><p>Improves memory, mood, and cognitive performance</p></div>
            <div class="benefit-card animate-up"><div class="benefit-icon"><i class="fa-solid fa-heartbeat"></i></div><h3>Heart Health</h3><p>May reduce risk of heart disease and stroke</p></div>
            <div class="benefit-card animate-up"><div class="benefit-icon"><i class="fa-solid fa-fire"></i></div><h3>Boosts Metabolism</h3><p>Helps burn fat and improve physical performance</p></div>
            <div class="benefit-card animate-up"><div class="benefit-icon"><i class="fa-solid fa-shield-heart"></i></div><h3>Rich in Antioxidants</h3><p>Protects cells from damage and reduces inflammation</p></div>
        `;
    }

    function renderBenefits(benefits) {
        if (!benefitsGrid) return;
        benefitsGrid.innerHTML = benefits.map((benefit, index) => `
            <div class="benefit-card animate-up" style="--delay: ${index * 0.1}s">
                <div class="benefit-icon"><i class="${sanitizeIcon(benefit.icon)}"></i></div>
                <h3>${escapeHtml(benefit.title)}</h3>
                <p>${escapeHtml(benefit.description)}</p>
            </div>
        `).join('');
    }

    // ========== PARTNERS ==========
    async function loadPartners() {
        if (!partnersGrid) return;
        try {
            const result = await window.supabaseService.getAll('partners', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderPartners(result.data);
            } else {
                partnersGrid.innerHTML = getDefaultPartnersHTML();
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading partners:', error);
            partnersGrid.innerHTML = getDefaultPartnersHTML();
        }
    }

    function getDefaultPartnersHTML() {
        return `
            <div class="partner-card"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Nespresso_logo.svg/200px-Nespresso_logo.svg.png" alt="Nespresso"><h4>Nespresso</h4></div>
            <div class="partner-card"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lavazza_Logo.svg/200px-Lavazza_Logo.svg.png" alt="Lavazza"><h4>Lavazza</h4></div>
            <div class="partner-card"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Illy_logo.svg/200px-Illy_logo.svg.png" alt="Illy"><h4>Illy</h4></div>
            <div class="partner-card"><img src="https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/200px-Starbucks_Corporation_Logo_2011.svg.png" alt="Starbucks"><h4>Starbucks</h4></div>
        `;
    }

    function renderPartners(partners) {
        if (!partnersGrid) return;
        partnersGrid.innerHTML = partners.map((partner, index) => `
            <div class="partner-card animate-up" style="--delay: ${index * 0.05}s">
                <img src="${partner.logo_url}" alt="${escapeHtml(partner.name)}" loading="lazy" onerror="this.src='img/logo.png'">
                <h4>${escapeHtml(partner.name)}</h4>
                ${partner.description ? `<p>${escapeHtml(partner.description)}</p>` : ''}
                ${partner.website_url ? `<a href="${partner.website_url}" target="_blank" rel="noopener noreferrer">Visit Website <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
            </div>
        `).join('');
    }

    // ========== WHY CHOOSE US ==========
    async function loadWhyChooseUs() {
        if (!whyChooseGrid) return;
        try {
            const result = await window.supabaseService.getAll('why_choose_us', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderWhyChooseUs(result.data);
            } else {
                whyChooseGrid.innerHTML = getDefaultWhyChooseHTML();
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading why choose us:', error);
            whyChooseGrid.innerHTML = getDefaultWhyChooseHTML();
        }
    }

    function getDefaultWhyChooseHTML() {
        return `
            <div class="why-card"><div class="why-icon"><i class="fa-solid fa-mug-hot"></i></div><h3>Premium Quality</h3><p>We use only the finest coffee beans sourced from sustainable farms worldwide</p></div>
            <div class="why-card"><div class="why-icon"><i class="fa-solid fa-truck-fast"></i></div><h3>Fast Delivery</h3><p>Free delivery on orders over 200 EGP within 30-45 minutes</p></div>
            <div class="why-card"><div class="why-icon"><i class="fa-solid fa-headset"></i></div><h3>24/7 Support</h3><p>Our customer service team is always here to help you</p></div>
            <div class="why-card"><div class="why-icon"><i class="fa-solid fa-award"></i></div><h3>Award Winning</h3><p>Recognized as the best coffee shop for 5 consecutive years</p></div>
            <div class="why-card"><div class="why-icon"><i class="fa-solid fa-leaf"></i></div><h3>Eco-Friendly</h3><p>Committed to sustainable and environmentally friendly practices</p></div>
            <div class="why-card"><div class="why-icon"><i class="fa-solid fa-heart"></i></div><h3>Passionate Team</h3><p>Our baristas are trained professionals who love what they do</p></div>
        `;
    }

    function renderWhyChooseUs(items) {
        if (!whyChooseGrid) return;
        whyChooseGrid.innerHTML = items.map((item, index) => `
            <div class="why-card animate-up" style="--delay: ${index * 0.05}s">
                <div class="why-icon"><i class="${sanitizeIcon(item.icon)}"></i></div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
            </div>
        `).join('');
    }

    // ========== AWARDS ==========
    async function loadAwards() {
        if (!awardsGrid) return;
        try {
            const result = await window.supabaseService.getAll('awards', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderAwards(result.data);
            } else {
                awardsGrid.innerHTML = getDefaultAwardsHTML();
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading awards:', error);
            awardsGrid.innerHTML = getDefaultAwardsHTML();
        }
    }

    function getDefaultAwardsHTML() {
        return `
            <div class="award-card"><div class="award-icon"><i class="fa-solid fa-trophy"></i></div><h3>Best Coffee Shop</h3><div class="award-year">2024</div><p>Awarded by Egyptian Coffee Association for excellence in coffee brewing</p></div>
            <div class="award-card"><div class="award-icon"><i class="fa-solid fa-medal"></i></div><h3>Customer Choice Award</h3><div class="award-year">2023</div><p>Voted #1 coffee shop by local community</p></div>
            <div class="award-card"><div class="award-icon"><i class="fa-solid fa-leaf"></i></div><h3>Sustainable Business</h3><div class="award-year">2022</div><p>Recognition for eco-friendly practices and sustainable sourcing</p></div>
            <div class="award-card"><div class="award-icon"><i class="fa-solid fa-certificate"></i></div><h3>Master Barista</h3><div class="award-year">2021</div><p>Our head barista won the National Barista Championship</p></div>
        `;
    }

    function renderAwards(awards) {
        if (!awardsGrid) return;
        awardsGrid.innerHTML = awards.map((award, index) => `
            <div class="award-card animate-up" style="--delay: ${index * 0.05}s">
                <div class="award-icon"><i class="${sanitizeIcon(award.icon)}"></i></div>
                <h3>${escapeHtml(award.title)}</h3>
                <div class="award-year">${award.year}</div>
                <p>${escapeHtml(award.description || '')}</p>
                ${award.image_url ? `<img src="${award.image_url}" alt="${escapeHtml(award.title)}" loading="lazy">` : ''}
            </div>
        `).join('');
    }

    // ========== NEWSLETTER ==========
    function initNewsletterForm() {
        if (!newsletterForm) return;
        
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput?.value.trim();
            
            if (!email || !isValidEmail(email)) {
                UIModule.showPopup('Please enter a valid email address', 'warning');
                return;
            }
            
            const submitBtn = newsletterForm.querySelector('button');
            UIModule.showButtonLoading(submitBtn, 'Subscribing...');
            
            try {
                const { data, error } = await window.supabaseService.supabase
                    .from('newsletter_subscribers')
                    .insert({ email: email });
                
                if (!error) {
                    UIModule.showPopup('🎉 Successfully subscribed! Check your inbox for updates.', 'success');
                    emailInput.value = '';
                } else if (error.code === '23505') {
                    UIModule.showPopup('You are already subscribed! 📧', 'info');
                } else {
                    UIModule.showPopup('Subscription failed. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Newsletter error:', error);
                UIModule.showPopup('Subscription failed. Please try again.', 'error');
            }
            
            UIModule.hideButtonLoading(submitBtn);
        });
    }

    // ========== STATS COUNTER ==========
    function initStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const target = parseInt(element.dataset.target);
                    if (target && !isNaN(target) && !element.classList.contains('counted')) {
                        animateNumber(element, target);
                        element.classList.add('counted');
                    }
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.3 });
        
        statNumbers.forEach(el => observer.observe(el));
    }

    function animateNumber(element, target) {
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 30);
    }

    // ========== BOOKING FORM ==========
    function initBookingForm() {
        const bookingForm = document.getElementById('service-booking-form');
        if (!bookingForm) return;
        
        const dateInput = document.getElementById('book-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }
        
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!window.supabaseService?.isAuthenticated()) {
                UIModule.showProtectedPopup();
                return;
            }
            
            const formData = {
                name: document.getElementById('book-name')?.value.trim(),
                email: document.getElementById('book-email')?.value.trim(),
                phone: document.getElementById('book-phone')?.value.trim(),
                service: document.getElementById('book-service')?.value,
                date: document.getElementById('book-date')?.value,
                message: document.getElementById('book-message')?.value.trim(),
                user_id: window.supabaseService.getCurrentUser()?.id,
                created_at: new Date().toISOString(),
                status: 'pending'
            };
            
            if (!formData.name || !formData.email || !formData.service || !formData.date) {
                UIModule.showPopup('Please fill in all required fields', 'warning');
                return;
            }
            
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            UIModule.showButtonLoading(submitBtn, 'Booking...');
            
            try {
                const { data, error } = await window.supabaseService.supabase
                    .from('service_bookings')
                    .insert(formData);
                
                if (!error) {
                    UIModule.showPopup('✓ Booking confirmed! We\'ll contact you within 24 hours.', 'success');
                    bookingForm.reset();
                } else {
                    UIModule.showPopup('Failed to book. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Booking error:', error);
                UIModule.showPopup('Booking submitted! We\'ll contact you soon.', 'success');
                bookingForm.reset();
            }
            
            UIModule.hideButtonLoading(submitBtn);
        });
    }

    // ========== SCROLL ANIMATIONS ==========
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-left, .animate-right, .animate-up');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        animatedElements.forEach(el => observer.observe(el));
    }

    // ========== HELPER FUNCTIONS ==========
    function isValidEmail(email) {
        return /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fa-solid fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fa-solid fa-star-half-alt"></i>';
        }
        
        const totalStars = fullStars + (hasHalfStar ? 1 : 0);
        for (let i = totalStars; i < 5; i++) {
            stars += '<i class="fa-regular fa-star"></i>';
        }
        
        return `<div class="stars">${stars}</div>`;
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ServicesModule.init());
    } else {
        ServicesModule.init();
    }

    return {
        init,
        refresh: () => {
            if (abortController) abortController.abort();
            initialized = false;
            init();
        }
    };
})();

window.ServicesModule = ServicesModule;