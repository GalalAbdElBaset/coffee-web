"use strict";

(function () {
  'use strict';

  var slides = document.querySelectorAll('.slide');
  var prevBtn = document.getElementById('sliderPrev');
  var nextBtn = document.getElementById('sliderNext');
  var dotsContainer = document.getElementById('sliderDots');
  var progressBar = document.getElementById('progressBar');
  var currentIndex = 0;
  var slideInterval;
  var isAnimating = false;
  var autoSlideDelay = 5000;

  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    slides.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.classList.add('dot');
      if (index === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', function () {
        return goToSlide(index);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots() {
    var dots = document.querySelectorAll('.dot');
    dots.forEach(function (dot, index) {
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
    setTimeout(function () {
      isAnimating = false;
    }, 500);
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function resetProgressBar() {
    if (progressBar) {
      progressBar.style.animation = 'none';
      progressBar.offsetHeight;
      progressBar.style.animation = "progressBarAnimation ".concat(autoSlideDelay, "ms linear forwards");
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

  if (prevBtn) prevBtn.addEventListener('click', function () {
    stopAutoSlide();
    prevSlide();
    startAutoSlide();
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    stopAutoSlide();
    nextSlide();
    startAutoSlide();
  });
  var sliderContainer = document.querySelector('.slider-container');

  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
  }

  if (!document.getElementById('slider-progress-styles')) {
    var style = document.createElement('style');
    style.id = 'slider-progress-styles';
    style.textContent = "@keyframes progressBarAnimation { from { width: 100%; } to { width: 0%; } }";
    document.head.appendChild(style);
  }

  createDots();
  startAutoSlide();
})();
//# sourceMappingURL=home.dev.js.map
