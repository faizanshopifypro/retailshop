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
      btn.style.color = btn.classList.contains("active") ? "#E8743C" : "";
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
