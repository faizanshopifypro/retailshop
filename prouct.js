document.addEventListener("DOMContentLoaded", function () {
  /* ================================= PRODUCT IMAGE GALLERY ================================= */ const mainImage =
    document.getElementById("pdpMainImage");
  const thumbnails = document.querySelectorAll(".pdp-thumbnail");
  thumbnails.forEach(function (thumbnail) {
    thumbnail.addEventListener("click", function () {
      const newImage = this.dataset.image;
      mainImage.style.opacity = "0";
      setTimeout(function () {
        mainImage.src = newImage;
        mainImage.onload = function () {
          mainImage.style.opacity = "1";
        };
      }, 150);
      thumbnails.forEach(function (item) {
        item.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
  /* ================================= PURCHASE OPTIONS ================================= */ const purchaseOptions =
    document.querySelectorAll(".pdp-purchase-option");
  purchaseOptions.forEach(function (option) {
    option.addEventListener("click", function () {
      purchaseOptions.forEach(function (item) {
        item.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
  /* ================================= ACCORDIONS ================================= */ const accordions =
    document.querySelectorAll(".pdp-accordion");
  accordions.forEach(function (accordion) {
    const button = accordion.querySelector(".pdp-accordion-button");
    button.addEventListener("click", function () {
      const isOpen = accordion.classList.contains("open");
      /* * Close all other accordions */ accordions.forEach(function (item) {
        item.classList.remove("open");
      });
      /* * Open clicked accordion */ if (!isOpen) {
        accordion.classList.add("open");
      }
    });
  });
  /* ================================= ADD TO CART DEMO ================================= */ const addToCart =
    document.querySelector(".pdp-add-to-cart");
  addToCart.addEventListener("click", function () {
    const selectedOption = document.querySelector(
      ".pdp-purchase-option.active",
    );
    const option = selectedOption.dataset.option;
    console.log(
      "Selected purchase option:",
      option,
    ); /* * Shopify cart logic can be connected here. */
  });
});

/* =========================================
   PRODUCT DETAILS ACCORDION
========================================= */

document.addEventListener("DOMContentLoaded", function () {
  const accordions = document.querySelectorAll(".product-accordion");

  accordions.forEach(function (accordion) {
    const trigger = accordion.querySelector(".accordion-trigger");

    const content = accordion.querySelector(".accordion-content");

    trigger.addEventListener("click", function () {
      const isActive = accordion.classList.contains("active");

      /* Close all other accordions */

      accordions.forEach(function (item) {
        item.classList.remove("active");

        const itemTrigger = item.querySelector(".accordion-trigger");

        const itemContent = item.querySelector(".accordion-content");

        itemTrigger.setAttribute("aria-expanded", "false");

        itemContent.style.maxHeight = null;
      });

      /* Open clicked accordion */

      if (!isActive) {
        accordion.classList.add("active");

        trigger.setAttribute("aria-expanded", "true");

        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
});

// =========================================
// PRODUCT BENEFITS ANIMATION
// =========================================

document.addEventListener("DOMContentLoaded", function () {
  const benefitCards = document.querySelectorAll(".benefit-card");

  if (!benefitCards.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("benefit-card-visible");

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    },
  );

  benefitCards.forEach(function (card, index) {
    card.style.transitionDelay = `${index * 80}ms`;

    observer.observe(card);
  });
});

/* =========================
   CUSTOMER REVIEWS JS
========================= */
document.addEventListener("DOMContentLoaded", function () {
  const slider = document.getElementById("reviewsSlider");
  const prevBtn = document.getElementById("reviewPrev");
  const nextBtn = document.getElementById("reviewNext");
  const progress = document.getElementById("reviewsProgress");

  const cards = slider.querySelectorAll(".review-card");

  let currentIndex = 0;

  /* =========================================
     GET NUMBER OF VISIBLE CARDS
  ========================================= */

  function getVisibleCards() {
    if (window.innerWidth <= 600) {
      return 1;
    }

    if (window.innerWidth <= 900) {
      return 2;
    }

    return 3;
  }

  /* =========================================
     GET MAX SLIDE
  ========================================= */

  function getMaxIndex() {
    const visibleCards = getVisibleCards();

    return Math.max(0, cards.length - visibleCards);
  }

  /* =========================================
     UPDATE SLIDER
  ========================================= */

  function updateSlider() {
    const visibleCards = getVisibleCards();
    const maxIndex = getMaxIndex();

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(window.getComputedStyle(slider).gap) || 0;

    const moveAmount = currentIndex * (cardWidth + gap);

    slider.style.transform = `translateX(-${moveAmount}px)`;

    /* Buttons */

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;

    /* =========================================
       PROGRESS BAR
    ========================================= */

    if (maxIndex === 0) {
      progress.style.width = "100%";
      progress.style.transform = "translateX(0)";

      return;
    }

    const progressWidth = 100 / (maxIndex + 1);

    progress.style.width = `${progressWidth}%`;

    progress.style.transform = `translateX(${currentIndex * 100}%)`;
  }

  /* =========================================
     NEXT
  ========================================= */

  nextBtn.addEventListener("click", function () {
    const maxIndex = getMaxIndex();

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateSlider();
    }
  });

  /* =========================================
     PREVIOUS
  ========================================= */

  prevBtn.addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });

  /* =========================================
     RESIZE
  ========================================= */

  window.addEventListener("resize", function () {
    updateSlider();
  });

  /* Initial */

  updateSlider();
});

/* =========================
   RELATED PRODUCTS JS
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("relatedProductsTrack");
  const prevButton = document.getElementById("relatedPrev");
  const nextButton = document.getElementById("relatedNext");

  const wishlistButtons = document.querySelectorAll(
    ".related-product-wishlist",
  );

  const quickAddButtons = document.querySelectorAll(
    ".related-product-quick-add",
  );

  /* =========================
     PRODUCT SLIDER
  ========================= */

  let currentPosition = 0;

  function getVisibleProducts() {
    if (window.innerWidth <= 767) {
      return 2;
    }

    if (window.innerWidth <= 1000) {
      return 3;
    }

    return 4;
  }

  function updateSlider() {
    if (!track) return;

    const cards = track.querySelectorAll(".related-product-card");

    const visibleProducts = getVisibleProducts();

    const maxPosition = Math.max(0, cards.length - visibleProducts);

    currentPosition = Math.min(currentPosition, maxPosition);

    const cardWidth = cards[0] ? cards[0].offsetWidth : 0;

    const gap = parseFloat(getComputedStyle(track).gap) || 0;

    track.style.transform = `translateX(-${currentPosition * (cardWidth + gap)}px)`;

    if (prevButton) {
      prevButton.disabled = currentPosition === 0;
    }

    if (nextButton) {
      nextButton.disabled = currentPosition >= maxPosition;
    }
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      const cards = track.querySelectorAll(".related-product-card");

      const maxPosition = Math.max(0, cards.length - getVisibleProducts());

      if (currentPosition < maxPosition) {
        currentPosition++;
        updateSlider();
      }
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      if (currentPosition > 0) {
        currentPosition--;
        updateSlider();
      }
    });
  }

  window.addEventListener("resize", () => {
    currentPosition = 0;

    updateSlider();
  });

  updateSlider();

  /* =========================
     WISHLIST
  ========================= */

  wishlistButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");

      if (button.classList.contains("active")) {
        button.textContent = "♥";
      } else {
        button.textContent = "♡";
      }
    });
  });

  /* =========================
     QUICK ADD
  ========================= */

  quickAddButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const originalText = button.textContent;

      button.textContent = "Added ✓";

      button.style.backgroundColor = "#27382d";
      button.style.color = "#fffdf8";

      setTimeout(() => {
        button.textContent = originalText;

        button.style.backgroundColor = "";
        button.style.color = "";
      }, 1500);
    });
  });
});

/* =========================
   FAQ ACCORDION
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const icon = item.querySelector(".faq-icon");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all FAQs
      faqItems.forEach((faq) => {
        faq.classList.remove("active");

        const faqIcon = faq.querySelector(".faq-icon");

        if (faqIcon) {
          faqIcon.textContent = "+";
        }
      });

      // Open clicked FAQ
      if (!isActive) {
        item.classList.add("active");
        icon.textContent = "−";
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {

  const productSection =
    document.getElementById("product-information");

  const stickyBar =
    document.getElementById("stickyProductBar");

  if (!productSection || !stickyBar) {
    return;
  }


  /* =========================================
     SHOW / HIDE STICKY BAR
  ========================================= */

  function checkStickyBar() {

    const sectionRect =
      productSection.getBoundingClientRect();


    /*
      Hide while user is inside
      the product information section.

      Show once the user has
      scrolled below it.
    */

    if (sectionRect.bottom <= 0) {

      stickyBar.classList.add("show");

    } else {

      stickyBar.classList.remove("show");

    }

  }


  window.addEventListener(
    "scroll",
    checkStickyBar,
    { passive: true }
  );


  window.addEventListener(
    "resize",
    checkStickyBar
  );


  checkStickyBar();


  /* =========================================
     STICKY ADD TO CART
  ========================================= */

  const stickyAddToCart =
    document.getElementById("stickyAddToCart");


  stickyAddToCart.addEventListener(
    "click",
    function () {

      /*
        Click the main Add To Cart button
        from your existing product section.
      */

      const mainAddToCart =
        document.querySelector(
          ".pdp-add-to-cart"
        );


      if (mainAddToCart) {

        mainAddToCart.click();

      }

    }
  );

});