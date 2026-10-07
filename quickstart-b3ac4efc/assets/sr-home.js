/**
 * ShopRetail home interactions — scoped to .sr-theme
 * Hero slides, reviews slider, FAQ accordion, wishlist UI
 */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initHeroSliders();
    initWishlist();
    initFeaturedQuickAdd();
    initReviewsSliders();
    initFaq();
  });

  function initHeroSliders() {
    document.querySelectorAll('.sr-theme .hero[data-sr-hero]').forEach(function (hero) {
      var heroImage = hero.querySelector('[data-sr-hero-image]');
      var heroDotsWrap = hero.querySelector('[data-sr-hero-dots]');
      if (!heroImage || !heroDotsWrap) return;

      var slides = [];
      try {
        slides = JSON.parse(heroImage.getAttribute('data-slides') || '[]');
      } catch (e) {
        slides = [];
      }
      var dots = Array.from(heroDotsWrap.querySelectorAll('.dot'));
      var current = 0;
      var autoTimer;

      function goToSlide(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        heroImage.style.opacity = '0';
        setTimeout(function () {
          heroImage.src = slides[current];
          heroImage.style.opacity = '1';
        }, 220);
        dots.forEach(function (d, i) {
          d.classList.toggle('active', i === current);
        });
      }

      function startAuto() {
        clearInterval(autoTimer);
        if (slides.length > 1) autoTimer = setInterval(function () {
          goToSlide(current + 1);
        }, 4000);
      }

      heroImage.style.transition = 'opacity 0.25s ease';
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          goToSlide(i);
          startAuto();
        });
      });
      startAuto();
    });
  }

  function initWishlist() {
    document.querySelectorAll('.sr-theme .wishlist-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        btn.classList.toggle('active');
        btn.style.color = btn.classList.contains('active') ? 'var(--orange)' : '';
      });
    });
  }

  function initFeaturedQuickAdd() {
    document.querySelectorAll('.sr-theme .btn-add-cart[data-variant-id]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var id = btn.getAttribute('data-variant-id');
        if (!id) return;
        var original = btn.innerHTML;
        btn.disabled = true;
        fetch(window.Shopify && window.Shopify.routes && window.Shopify.routes.root
          ? window.Shopify.routes.root + 'cart/add.js'
          : '/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: Number(id), quantity: 1 }] }),
        })
          .then(function (r) {
            if (!r.ok) throw new Error('Add failed');
            return r.json();
          })
          .then(function () {
            btn.innerHTML = 'Added ✓';
            refreshHorizonCart();
            setTimeout(function () {
              btn.innerHTML = original;
              btn.disabled = false;
            }, 1200);
          })
          .catch(function () {
            btn.innerHTML = original;
            btn.disabled = false;
          });
      });
    });
  }

  function refreshHorizonCart() {
    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.dispatchEvent(new CustomEvent('cart:update', { detail: { cart: cart } }));
        document.dispatchEvent(new CustomEvent('cart:refresh'));
        var drawer = document.querySelector('cart-drawer, .cart-drawer, theme-cart-drawer');
        if (drawer) {
          if (typeof drawer.open === 'function') drawer.open();
          else if (typeof drawer.show === 'function') drawer.show();
          else drawer.setAttribute('open', '');
        }
        var bubbles = document.querySelectorAll('[data-cart-count], .cart-bubble, cart-icon .count');
        bubbles.forEach(function (el) {
          el.textContent = String(cart.item_count || 0);
        });
      })
      .catch(function () {});
  }

  window.srRefreshHorizonCart = refreshHorizonCart;

  function initReviewsSliders() {
    document.querySelectorAll('.sr-theme .reviews-section').forEach(function (section) {
      var slider = section.querySelector('.reviews-slider');
      var prevBtn = section.querySelector('[data-sr-review-prev]');
      var nextBtn = section.querySelector('[data-sr-review-next]');
      var progress = section.querySelector('.reviews-progress-bar');
      if (!slider || !prevBtn || !nextBtn || !progress) return;

      var cards = slider.querySelectorAll('.review-card');
      var currentIndex = 0;

      function getVisibleCards() {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 900) return 2;
        return 3;
      }

      function getMaxIndex() {
        return Math.max(0, cards.length - getVisibleCards());
      }

      function updateSlider() {
        var maxIndex = getMaxIndex();
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        if (!cards.length) return;
        var cardWidth = cards[0].offsetWidth;
        var gap = parseFloat(window.getComputedStyle(slider).gap) || 0;
        slider.style.transform = 'translateX(-' + currentIndex * (cardWidth + gap) + 'px)';
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === maxIndex;
        if (maxIndex === 0) {
          progress.style.width = '100%';
          progress.style.transform = 'translateX(0)';
          return;
        }
        var progressWidth = 100 / (maxIndex + 1);
        progress.style.width = progressWidth + '%';
        progress.style.transform = 'translateX(' + currentIndex * 100 + '%)';
      }

      nextBtn.addEventListener('click', function () {
        if (currentIndex < getMaxIndex()) {
          currentIndex++;
          updateSlider();
        }
      });
      prevBtn.addEventListener('click', function () {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlider();
        }
      });
      window.addEventListener('resize', updateSlider);
      updateSlider();
    });
  }

  function initFaq() {
    document.querySelectorAll('.sr-theme .faq-section').forEach(function (section) {
      var faqItems = section.querySelectorAll('.faq-item');
      faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question');
        var icon = item.querySelector('.faq-icon');
        if (!question) return;
        question.addEventListener('click', function () {
          var isActive = item.classList.contains('active');
          faqItems.forEach(function (faq) {
            faq.classList.remove('active');
            var faqQuestion = faq.querySelector('.faq-question');
            var faqIcon = faq.querySelector('.faq-icon');
            if (faqQuestion) faqQuestion.setAttribute('aria-expanded', 'false');
            if (faqIcon) faqIcon.textContent = '+';
          });
          if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
            if (icon) icon.textContent = '−';
          }
        });
      });
    });
  }
})();
