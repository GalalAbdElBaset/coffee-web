/**
 * About Module - Professional Dynamic About Page
 * @version 2.0.0 - Focused on Brand Story (No duplicates with Services)
 */

const AboutModule = (function() {
    'use strict';

    let initialized = false;
    let abortController = null;
    let statsObserver = null;

    async function init() {
        if (initialized) return;
        
        if (abortController) {
            try { abortController.abort(); } catch(e) {}
        }
        abortController = new AbortController();
        
        try {
            initialized = true;
            console.log('📖 About Module v2.0.0 Initializing...');
            
            await Promise.all([
                loadStory(),
                loadCoffeeJourney(),
                loadMissionVision(),
                loadValues(),
                loadTeam(),
                loadCoffeeOrigins(),
                loadGallery(),
                loadFAQ()
            ]);
            
            initGalleryLightbox();
            initScrollAnimations();
            
            console.log('✅ About Module Loaded Successfully');
        } catch(error) {
            initialized = false;
            console.error('❌ About Module initialization failed:', error);
        }
    }

    // ========== LOAD OUR STORY ==========
    async function loadStory() {
        const container = document.getElementById('about-story-container');
        if (!container) return;
        
        try {
            const result = await window.supabaseService.getAll('about_story', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderStory(result.data[0]);
            } else {
                container.innerHTML = getDefaultStoryHTML();
            }
        } catch(error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading story:', error);
            container.innerHTML = getDefaultStoryHTML();
        }
    }

    function renderStory(story) {
        const container = document.getElementById('about-story-container');
        if (!container) return;
        
        let milestonesHTML = '';
        if (story.milestones && Array.isArray(story.milestones)) {
            milestonesHTML = `
                <div class="story-milestones">
                    <h3>Our Journey Timeline</h3>
                    <div class="timeline">
                        ${story.milestones.map(m => `
                            <div class="timeline-item">
                                <div class="timeline-year">${m.year}</div>
                                <div class="timeline-content">
                                    <h4>${escapeHtml(m.title)}</h4>
                                    <p>${escapeHtml(m.description)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="story-grid">
                <div class="story-content">
                    <h2>${escapeHtml(story.title)}</h2>
                    <p>${escapeHtml(story.content)}</p>
                    ${story.founded_year ? `<div class="founded-year">📅 Founded in ${story.founded_year}</div>` : ''}
                </div>
                ${story.image_url ? `
                    <div class="story-image">
                        <img src="${story.image_url}" alt="${escapeHtml(story.title)}" loading="lazy">
                    </div>
                ` : ''}
            </div>
            ${milestonesHTML}
        `;
    }

    function getDefaultStoryHTML() {
        return `
            <div class="story-grid">
                <div class="story-content">
                    <h2>Our Coffee Journey</h2>
                    <p>Coffee Brand started with one simple idea - to bring the finest coffee experience to every cup. What began as a small passion project has grown into a beloved local coffee destination.</p>
                    <div class="founded-year">📅 Founded in 2019</div>
                </div>
                <div class="story-image">
                    <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600" alt="Our Story" loading="lazy">
                </div>
            </div>
            <div class="story-milestones">
                <h3>Our Journey Timeline</h3>
                <div class="timeline">
                    <div class="timeline-item"><div class="timeline-year">2019</div><div class="timeline-content"><h4>First Store Opened</h4><p>Our journey began in the heart of Assiut</p></div></div>
                    <div class="timeline-item"><div class="timeline-year">2021</div><div class="timeline-content"><h4>Second Branch</h4><p>Expanded to serve more coffee lovers</p></div></div>
                    <div class="timeline-item"><div class="timeline-year">2023</div><div class="timeline-content"><h4>10K Happy Customers</h4><p>Reached a milestone of 10,000 satisfied customers</p></div></div>
                    <div class="timeline-item"><div class="timeline-year">2025</div><div class="timeline-content"><h4>Premium Experience</h4><p>Launched our premium coffee collection</p></div></div>
                </div>
            </div>
        `;
    }

    // ========== LOAD COFFEE JOURNEY ==========
    async function loadCoffeeJourney() {
        const container = document.getElementById('coffee-journey-container');
        if (!container) return;
        
        try {
            const result = await window.supabaseService.getAll('coffee_journey', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderCoffeeJourney(result.data);
            } else {
                container.innerHTML = getDefaultJourneyHTML();
            }
        } catch(error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading journey:', error);
            container.innerHTML = getDefaultJourneyHTML();
        }
    }

    function renderCoffeeJourney(steps) {
        const container = document.getElementById('coffee-journey-container');
        if (!container) return;
        
        container.innerHTML = steps.map((step, index) => `
            <div class="journey-step animate-up" style="animation-delay: ${index * 0.1}s">
                <div class="step-number">${step.step_number}</div>
                <div class="step-icon"><i class="${step.icon || 'fa-solid fa-mug-hot'}"></i></div>
                <h3>${escapeHtml(step.title)}</h3>
                <p>${escapeHtml(step.description)}</p>
            </div>
        `).join('');
    }

    function getDefaultJourneyHTML() {
        return `
            <div class="journey-step animate-up"><div class="step-number">1</div><div class="step-icon"><i class="fa-solid fa-plane"></i></div><h3>Sourcing</h3><p>We source the finest Arabica beans directly from farmers</p></div>
            <div class="journey-step animate-up"><div class="step-number">2</div><div class="step-icon"><i class="fa-solid fa-fire"></i></div><h3>Roasting</h3><p>Master roasters carefully roast each batch</p></div>
            <div class="journey-step animate-up"><div class="step-number">3</div><div class="step-icon"><i class="fa-solid fa-gear"></i></div><h3>Grinding</h3><p>Precision grinding for optimal extraction</p></div>
            <div class="journey-step animate-up"><div class="step-number">4</div><div class="step-icon"><i class="fa-solid fa-mug-hot"></i></div><h3>Brewing</h3><p>Expert baristas craft each cup with passion</p></div>
            <div class="journey-step animate-up"><div class="step-number">5</div><div class="step-icon"><i class="fa-solid fa-heart"></i></div><h3>Serving</h3><p>Served with a smile and love</p></div>
        `;
    }

    // ========== LOAD MISSION & VISION ==========
    async function loadMissionVision() {
        const container = document.getElementById('mission-vision-container');
        if (!container) return;
        
        try {
            const result = await window.supabaseService.getAll('mission_vision', {
                filters: { is_active: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderMissionVision(result.data);
            } else {
                container.innerHTML = getDefaultMissionVisionHTML();
            }
        } catch(error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading mission vision:', error);
            container.innerHTML = getDefaultMissionVisionHTML();
        }
    }

    function renderMissionVision(items) {
        const container = document.getElementById('mission-vision-container');
        if (!container) return;
        
        const mission = items.find(i => i.type === 'mission');
        const vision = items.find(i => i.type === 'vision');
        
        container.innerHTML = `
            <div class="mission-card animate-left">
                <div class="mission-icon"><i class="${mission?.icon || 'fa-solid fa-bullseye'}"></i></div>
                <h3>${escapeHtml(mission?.title || 'Our Mission')}</h3>
                <p>${escapeHtml(mission?.content || 'To serve exceptional coffee that brings people together')}</p>
            </div>
            <div class="vision-card animate-right">
                <div class="vision-icon"><i class="${vision?.icon || 'fa-solid fa-eye'}"></i></div>
                <h3>${escapeHtml(vision?.title || 'Our Vision')}</h3>
                <p>${escapeHtml(vision?.content || 'To become Egypt\'s most beloved coffee brand')}</p>
            </div>
        `;
    }

    function getDefaultMissionVisionHTML() {
        return `
            <div class="mission-card animate-left"><div class="mission-icon"><i class="fa-solid fa-bullseye"></i></div><h3>Our Mission</h3><p>To serve exceptional coffee that brings people together, while supporting sustainable farming practices and our local community.</p></div>
            <div class="vision-card animate-right"><div class="vision-icon"><i class="fa-solid fa-eye"></i></div><h3>Our Vision</h3><p>To become Egypt's most beloved coffee brand, known for quality, authenticity, and genuine coffee culture.</p></div>
        `;
    }

    // ========== LOAD VALUES ==========
    async function loadValues() {
        const container = document.getElementById('values-container');
        if (!container) return;
        
        try {
            const result = await window.supabaseService.getAll('our_values', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderValues(result.data);
            } else {
                container.innerHTML = getDefaultValuesHTML();
            }
        } catch(error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading values:', error);
            container.innerHTML = getDefaultValuesHTML();
        }
    }

    function renderValues(values) {
        const container = document.getElementById('values-container');
        if (!container) return;
        
        container.innerHTML = values.map((val, index) => `
            <div class="value-card animate-up" style="animation-delay: ${index * 0.1}s">
                <div class="value-icon"><i class="${val.icon}"></i></div>
                <h3>${escapeHtml(val.title)}</h3>
                <p>${escapeHtml(val.description)}</p>
            </div>
        `).join('');
    }

    function getDefaultValuesHTML() {
        return `
            <div class="value-card animate-up"><div class="value-icon"><i class="fa-solid fa-heart"></i></div><h3>Passion</h3><p>We pour our hearts into every cup.</p></div>
            <div class="value-card animate-up"><div class="value-icon"><i class="fa-solid fa-star"></i></div><h3>Quality</h3><p>Only the finest beans make it to your cup.</p></div>
            <div class="value-card animate-up"><div class="value-icon"><i class="fa-solid fa-leaf"></i></div><h3>Sustainability</h3><p>Supporting eco-friendly farming.</p></div>
            <div class="value-card animate-up"><div class="value-icon"><i class="fa-solid fa-users"></i></div><h3>Community</h3><p>Bringing people together over coffee.</p></div>
        `;
    }

    // ========== LOAD TEAM ==========
    async function loadTeam() {
        const container = document.getElementById('team-container');
        if (!container) return;
        
        try {
            const result = await window.supabaseService.getAll('team_members', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderTeam(result.data);
            } else {
                container.innerHTML = getDefaultTeamHTML();
            }
        } catch(error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading team:', error);
            container.innerHTML = getDefaultTeamHTML();
        }
    }

    function renderTeam(team) {
        const container = document.getElementById('team-container');
        if (!container) return;
        
        container.innerHTML = team.map((member, index) => `
            <div class="team-card animate-up" style="animation-delay: ${index * 0.1}s">
                <div class="team-img">
                    <img src="${member.image_url || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${escapeHtml(member.name)}" loading="lazy">
                    <div class="team-social">
                        ${member.social_instagram ? `<a href="${member.social_instagram}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
                        ${member.social_facebook ? `<a href="${member.social_facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ''}
                        ${member.social_twitter ? `<a href="${member.social_twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
                    </div>
                </div>
                <div class="team-info">
                    <h3>${escapeHtml(member.name)}</h3>
                    <p class="team-position">${escapeHtml(member.position)}</p>
                    <p class="team-bio">${escapeHtml(member.bio || '')}</p>
                </div>
            </div>
        `).join('');
    }

    function getDefaultTeamHTML() {
        return `
            <div class="team-card animate-up"><div class="team-img"><img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Ahmed Hassan"><div class="team-social"><a href="#"><i class="fab fa-instagram"></i></a></div></div><div class="team-info"><h3>Ahmed Hassan</h3><p class="team-position">Head Barista</p><p class="team-bio">Certified barista with 10+ years of experience</p></div></div>
            <div class="team-card animate-up"><div class="team-img"><img src="https://randomuser.me/api/portraits/women/1.jpg" alt="Sara Mahmoud"><div class="team-social"><a href="#"><i class="fab fa-instagram"></i></a></div></div><div class="team-info"><h3>Sara Mahmoud</h3><p class="team-position">Roasting Specialist</p><p class="team-bio">Expert in coffee roasting techniques</p></div></div>
            <div class="team-card animate-up"><div class="team-img"><img src="https://randomuser.me/api/portraits/men/2.jpg" alt="Omar Khalil"><div class="team-social"><a href="#"><i class="fab fa-instagram"></i></a></div></div><div class="team-info"><h3>Omar Khalil</h3><p class="team-position">Quality Manager</p><p class="team-bio">Q-Grader certified professional</p></div></div>
            <div class="team-card animate-up"><div class="team-img"><img src="https://randomuser.me/api/portraits/women/2.jpg" alt="Laila Nour"><div class="team-social"><a href="#"><i class="fab fa-instagram"></i></a></div></div><div class="team-info"><h3>Laila Nour</h3><p class="team-position">Customer Experience</p><p class="team-bio">Ensuring every customer leaves happy</p></div></div>
        `;
    }

    // ========== LOAD COFFEE ORIGINS ==========
    async function loadCoffeeOrigins() {
        const container = document.getElementById('coffee-origins-container');
        if (!container) return;
        
        try {
            const result = await window.supabaseService.getAll('coffee_origins', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderCoffeeOrigins(result.data);
            } else {
                container.innerHTML = getDefaultOriginsHTML();
            }
        } catch(error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading origins:', error);
            container.innerHTML = getDefaultOriginsHTML();
        }
    }

    function renderCoffeeOrigins(origins) {
        const container = document.getElementById('coffee-origins-container');
        if (!container) return;
        
        container.innerHTML = origins.map((origin, index) => `
            <div class="origin-card animate-up" style="animation-delay: ${index * 0.1}s">
                <img src="${origin.image_url}" alt="${escapeHtml(origin.country)}" loading="lazy">
                <div class="origin-info">
                    <h3>${escapeHtml(origin.country)}</h3>
                    <p class="origin-region">${escapeHtml(origin.region || '')}</p>
                    <p>${escapeHtml(origin.description || '')}</p>
                    ${origin.flavor_notes ? `<div class="flavor-notes">🎯 Flavor: ${escapeHtml(origin.flavor_notes)}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    function getDefaultOriginsHTML() {
        return `
            <div class="origin-card animate-up"><img src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300" alt="Ethiopia"><div class="origin-info"><h3>Ethiopia</h3><p class="origin-region">Yirgacheffe</p><p>The birthplace of coffee. Known for floral and citrus notes.</p><div class="flavor-notes">🎯 Flavor: Jasmine, Bergamot, Lemon</div></div></div>
            <div class="origin-card animate-up"><img src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300" alt="Colombia"><div class="origin-info"><h3>Colombia</h3><p class="origin-region">Huila</p><p>Perfect balance of acidity and sweetness.</p><div class="flavor-notes">🎯 Flavor: Caramel, Chocolate, Nuts</div></div></div>
            <div class="origin-card animate-up"><img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300" alt="Brazil"><div class="origin-info"><h3>Brazil</h3><p class="origin-region">Minas Gerais</p><p>Smooth, nutty, and chocolatey profile.</p><div class="flavor-notes">🎯 Flavor: Chocolate, Hazelnut, Almond</div></div></div>
        `;
    }

    // ========== LOAD GALLERY ==========
    async function loadGallery() {
        const container = document.getElementById('gallery-container');
        if (!container) return;
        
        try {
            const result = await window.supabaseService.getAll('about_gallery', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderGallery(result.data);
            } else {
                container.innerHTML = getDefaultGalleryHTML();
            }
        } catch(error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading gallery:', error);
            container.innerHTML = getDefaultGalleryHTML();
        }
    }

    function renderGallery(images) {
        const container = document.getElementById('gallery-container');
        if (!container) return;
        
        container.innerHTML = images.map((img, i) => `
            <div class="gallery-item animate-up" style="animation-delay: ${i * 0.05}s" data-img="${img.image_url}">
                <img src="${img.image_url}" alt="${escapeHtml(img.title || 'Gallery')}" loading="lazy">
                ${img.title ? `<div class="gallery-overlay"><span>${escapeHtml(img.title)}</span></div>` : ''}
            </div>
        `).join('');
    }

    function getDefaultGalleryHTML() {
const defaultImages = [
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
            'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
            'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
            'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400',
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400', 
            'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400'
        ];
        return defaultImages.map((url, i) => `
            <div class="gallery-item animate-up" style="animation-delay: ${i * 0.05}s" data-img="${url}">
                <img src="${url}" alt="Gallery" loading="lazy">
            </div>
        `).join('');
    }

    // ========== LOAD FAQ ==========
    async function loadFAQ() {
        const container = document.getElementById('about-faq-container');
        if (!container) return;
        
        try {
            const result = await window.supabaseService.getAll('about_faq', {
                filters: { is_active: true },
                orderBy: { column: 'order', ascending: true }
            }, { signal: abortController?.signal });
            
            if (result.success && result.data && result.data.length > 0) {
                renderFAQ(result.data);
            } else {
                container.innerHTML = getDefaultFAQHTML();
            }
        } catch(error) {
            if (error.name === 'AbortError') return;
            console.error('Error loading FAQ:', error);
            container.innerHTML = getDefaultFAQHTML();
        }
    }

    function renderFAQ(items) {
        const container = document.getElementById('about-faq-container');
        if (!container) return;
        
        container.innerHTML = items.map((item) => `
            <div class="faq-item">
                <div class="faq-question">
                    <span>${escapeHtml(item.question)}</span>
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>${escapeHtml(item.answer)}</p>
                </div>
            </div>
        `).join('');
        
        // Initialize accordion
        document.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    item.classList.toggle('active');
                });
            }
        });
    }

    function getDefaultFAQHTML() {
        return `
            <div class="faq-item"><div class="faq-question"><span>☕ What makes your coffee different?</span><i class="fa-solid fa-chevron-down"></i></div><div class="faq-answer"><p>We source directly from farmers and roast in small batches for maximum freshness.</p></div></div>
            <div class="faq-item"><div class="faq-question"><span>🚚 Where do you source your beans?</span><i class="fa-solid fa-chevron-down"></i></div><div class="faq-answer"><p>We source our beans from Ethiopia, Colombia, and Brazil, working directly with farmers.</p></div></div>
            <div class="faq-item"><div class="faq-question"><span>🎉 Do you offer coffee tasting events?</span><i class="fa-solid fa-chevron-down"></i></div><div class="faq-answer"><p>Yes! We host regular coffee tasting events. Check our services page for upcoming dates.</p></div></div>
            <div class="faq-item"><div class="faq-question"><span>🌱 Are your coffee beans organic?</span><i class="fa-solid fa-chevron-down"></i></div><div class="faq-answer"><p>We prioritize organic and sustainably sourced beans from our partner farms.</p></div></div>
        `;
    }

    // ========== UTILITIES ==========
    function initGalleryLightbox() {
        const container = document.getElementById('gallery-container');
        if (!container) return;
        
        container.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                const imgSrc = item.dataset.img || item.querySelector('img')?.src;
                if (imgSrc) {
                    showLightbox(imgSrc);
                }
            }
        });
    }

    function showLightbox(src) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <img src="${src}" alt="Lightbox">
            </div>
        `;
        document.body.appendChild(lightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
                lightbox.remove();
            }
        });
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                lightbox.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

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

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AboutModule.init());
    } else {
        AboutModule.init();
    }

    return { init };
})();

window.AboutModule = AboutModule;