/**
 * Stats Module - Display and animate statistics
 * @version 1.0.0
 */

const StatsModule = (function() {
    'use strict';

    let statsData = [];
    let statsObserver = null;

    /**
     * Initialize stats module
     */
    async function init() {
        const statsContainer = document.querySelector('.stats-container');
        if (!statsContainer) return;
        
        await loadStats();
        initCounterAnimation();
    }

    /**
     * Load stats from Supabase
     */
    async function loadStats() {
        try {
            const result = await window.supabaseService.getAll('statistics', {
                filters: { is_active: true }
            });
            
            if (result.success && result.data.length > 0) {
                statsData = result.data;
                updateStatsDisplay();
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            // Use default stats
            statsData = [
                { id: '1', label: 'Cups of Coffee Served', target_number: 15000, icon: 'fa-solid fa-mug-hot' },
                { id: '2', label: 'Expert Baristas', target_number: 25, icon: 'fa-solid fa-user-chef' },
                { id: '3', label: 'Branches', target_number: 5, icon: 'fa-solid fa-location-dot' },
                { id: '4', label: '5-Star Reviews', target_number: 4890, icon: 'fa-solid fa-star' }
            ];
            updateStatsDisplay();
        }
    }

    /**
     * Update stats display with loaded data
     */
    function updateStatsDisplay() {
        const statCards = document.querySelectorAll('.stat-card');
        
        if (statCards.length === statsData.length) {
            statCards.forEach((card, index) => {
                const stat = statsData[index];
                if (stat) {
                    const statNumber = card.querySelector('.stat-number');
                    const statLabel = card.querySelector('.stat-label');
                    const statIcon = card.querySelector('.stat-icon i');
                    
                    if (statNumber) statNumber.dataset.target = stat.target_number;
                    if (statLabel) statLabel.textContent = stat.label;
                    if (statIcon && stat.icon) {
                        const [prefix, iconName] = stat.icon.split(' ');
                        statIcon.className = `${prefix} ${iconName}`;
                    }
                }
            });
        }
    }

    /**
     * Initialize counter animation on scroll
     */
    function initCounterAnimation() {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length === 0) return;
        
        statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const target = parseInt(element.dataset.target);
                    
                    if (target && !isNaN(target) && !element.classList.contains('animated')) {
                        animateNumber(element, target);
                        element.classList.add('animated');
                    }
                    statsObserver.unobserve(element);
                }
            });
        }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });
        
        statNumbers.forEach(el => statsObserver.observe(el));
    }

    /**
     * Animate number counting
     * @param {HTMLElement} element 
     * @param {number} target 
     */
    function animateNumber(element, target) {
        let current = 0;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        const stepTime = duration / steps;
        
        // For large numbers (thousands), use K/M suffix
        const isLarge = target >= 1000;
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                element.textContent = formatNumber(target, isLarge);
                clearInterval(timer);
            } else {
                element.textContent = formatNumber(Math.floor(current), isLarge);
            }
        }, stepTime);
    }

    /**
     * Format number with suffix
     * @param {number} num 
     * @param {boolean} useSuffix 
     * @returns {string}
     */
    function formatNumber(num, useSuffix = false) {
        if (!useSuffix) return num.toLocaleString();
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toLocaleString();
    }

    return {
        init,
        refreshStats: loadStats
    };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    StatsModule.init();
});

window.StatsModule = StatsModule;