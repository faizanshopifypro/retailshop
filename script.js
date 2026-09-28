document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const mobileToggle = document.querySelector(".mobile-toggle");
  const mobileNav = document.getElementById("mobileNav");
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => mobileNav.classList.remove("open"));
    });
  }

  // Hero carousel — real working slider (click dots or auto-advance)
  const heroImage = document.getElementById("heroSlideImage");
  const heroDotsWrap = document.getElementById("heroDots");
  if (heroImage && heroDotsWrap) {
    let slides = [];
    try {
      slides = JSON.parse(heroImage.dataset.slides || "[]");
    } catch (e) {
      slides = [];
    }
    const dots = Array.from(heroDotsWrap.querySelectorAll(".dot"));
    let current = 0;
    let autoTimer;

    function goToSlide(index) {
      if (!slides.length || index === current) return;
      current = (index + slides.length) % slides.length;
      heroImage.style.opacity = "0";
      setTimeout(() => {
        heroImage.src = slides[current];
        heroImage.style.opacity = "1";
      }, 220);
      dots.forEach((d, i) => d.classList.toggle("active", i === current));
    }

    function nextSlide() {
      goToSlide(current + 1);
    }

    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(nextSlide, 4000);
    }

    heroImage.style.transition = "opacity 0.25s ease";

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        goToSlide(i);
        startAuto();
      });
    });

    if (slides.length > 1) startAuto();
  }

  // Wishlist toggle
  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      btn.style.color = btn.classList.contains("active") ? "var(--orange)" : "";
    });
  });

  // Add to cart feedback
  const cartBadge = document.querySelector(".cart-badge");
  document.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const originalText = btn.innerHTML;
      btn.innerHTML = "Added ✓";
      if (cartBadge) {
        cartBadge.textContent = String(Number(cartBadge.textContent) + 1);
      }
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 1200);
    });
  });

  // Newsletter form (front-end only, no backend)
  document
    .querySelectorAll(".newsletter-form, .footer-form")
    .forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector("button");
        if (input && input.value) {
          const originalText = button.textContent;
          button.textContent = "Subscribed ✓";
          input.value = "";
          setTimeout(() => {
            button.textContent = originalText;
          }, 1800);
        }
      });
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.getElementById("reviewsSlider");
  const prevBtn = document.getElementById("reviewPrev");
  const nextBtn = document.getElementById("reviewNext");
  const progress = document.getElementById("reviewsProgress");

  if (!slider || !prevBtn || !nextBtn || !progress) return;

  const cards = slider.querySelectorAll(".review-card");
  let currentIndex = 0;

  function getVisibleCards() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCards());
  }

  function updateSlider() {
    const maxIndex = getMaxIndex();
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (!cards.length) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(window.getComputedStyle(slider).gap) || 0;
    slider.style.transform = "translateX(-" + currentIndex * (cardWidth + gap) + "px)";

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;

    if (maxIndex === 0) {
      progress.style.width = "100%";
      progress.style.transform = "translateX(0)";
      return;
    }

    const progressWidth = 100 / (maxIndex + 1);
    progress.style.width = progressWidth + "%";
    progress.style.transform = "translateX(" + currentIndex * 100 + "%)";
  }

  nextBtn.addEventListener("click", function () {
    if (currentIndex < getMaxIndex()) {
      currentIndex++;
      updateSlider();
    }
  });

  prevBtn.addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });

  window.addEventListener("resize", updateSlider);
  updateSlider();
});

document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {
    const question = item.querySelector(".faq-question");
    const icon = item.querySelector(".faq-icon");
    if (!question) return;

    question.addEventListener("click", function () {
      const isActive = item.classList.contains("active");

      faqItems.forEach(function (faq) {
        faq.classList.remove("active");
        const faqQuestion = faq.querySelector(".faq-question");
        const faqIcon = faq.querySelector(".faq-icon");
        if (faqQuestion) faqQuestion.setAttribute("aria-expanded", "false");
        if (faqIcon) faqIcon.textContent = "+";
      });

      if (!isActive) {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
        if (icon) icon.textContent = "−";
      }
    });
  });
});
