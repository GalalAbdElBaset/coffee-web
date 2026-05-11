    (function() {
            'use strict';
            
            const slides = document.querySelectorAll('.slide');
            const prevBtn = document.getElementById('sliderPrev');
            const nextBtn = document.getElementById('sliderNext');
            const dotsContainer = document.getElementById('sliderDots');
            const progressBar = document.getElementById('progressBar');
            
            let currentIndex = 0;
            let slideInterval;
            let isAnimating = false;
            const autoSlideDelay = 5000;
            
            function createDots() {
                if (!dotsContainer) return;
                dotsContainer.innerHTML = '';
                slides.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.classList.add('dot');
                    if (index === currentIndex) dot.classList.add('active');
                    dot.addEventListener('click', () => goToSlide(index));
                    dotsContainer.appendChild(dot);
                });
            }
            
            function updateDots() {
                const dots = document.querySelectorAll('.dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }
            
            function goToSlide(index) {
                if (isAnimating) return;
                if (index === currentIndex) return;
                if (index < 0) index = slides.length - 1;
                if (index >= slides.length) index = 0;
                
                isAnimating = true;
                slides[currentIndex].classList.remove('active');
                slides[index].classList.add('active');
                currentIndex = index;
                updateDots();
                resetProgressBar();
                
                setTimeout(() => { isAnimating = false; }, 500);
            }
            
            function nextSlide() { goToSlide(currentIndex + 1); }
            function prevSlide() { goToSlide(currentIndex - 1); }
            
            function resetProgressBar() {
                if (progressBar) {
                    progressBar.style.animation = 'none';
                    progressBar.offsetHeight;
                    progressBar.style.animation = `progressBarAnimation ${autoSlideDelay}ms linear forwards`;
                }
            }
            
            function startAutoSlide() {
                if (slideInterval) clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, autoSlideDelay);
                resetProgressBar();
            }
            
            function stopAutoSlide() {
                if (slideInterval) clearInterval(slideInterval);
                if (progressBar) progressBar.style.animation = 'none';
            }
            
            if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoSlide(); prevSlide(); startAutoSlide(); });
            if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoSlide(); nextSlide(); startAutoSlide(); });
            
            const sliderContainer = document.querySelector('.slider-container');
            if (sliderContainer) {
                sliderContainer.addEventListener('mouseenter', stopAutoSlide);
                sliderContainer.addEventListener('mouseleave', startAutoSlide);
            }
            
            if (!document.getElementById('slider-progress-styles')) {
                const style = document.createElement('style');
                style.id = 'slider-progress-styles';
                style.textContent = `@keyframes progressBarAnimation { from { width: 100%; } to { width: 0%; } }`;
                document.head.appendChild(style);
            }
            
            createDots();
            startAutoSlide();
        })();