document.addEventListener("DOMContentLoaded", function () {
  const productState = {
    option: "single",
    qty: 1,
    price: 49,
    compare: 65,
    chip: "1",
  };

  const mainImage = document.getElementById("pdpMainImage");
  const thumbnails = Array.from(document.querySelectorAll(".pdp-thumbnail"));
  const gallery = document.getElementById("pdpGallery");
  const zoomTrigger = document.getElementById("pdpZoomTrigger");
  const lightbox = document.getElementById("pdpLightbox");
  const lightboxImage = document.getElementById("pdpLightboxImage");
  const lightboxClose = document.getElementById("pdpLightboxClose");
  const purchaseOptions = document.querySelectorAll(".pdp-purchase-option");
  const optionChips = document.querySelectorAll(".pdp-option-chip");
  const qtyInput = document.getElementById("pdpQtyInput");
  const qtyMinus = document.getElementById("pdpQtyMinus");
  const qtyPlus = document.getElementById("pdpQtyPlus");
  const addToCart = document.getElementById("pdpAddToCart");
  const addToCartLabel = document.getElementById("pdpAddToCartLabel");
  const priceEl = document.getElementById("pdpPrice");
  const compareEl = document.getElementById("pdpCompare");
  const saveEl = document.getElementById("pdpSave");
  const saleBadge = document.querySelector(".pdp-sale-badge");
  const stickyPrice = document.getElementById("stickyPrice");
  const stickyCompare = document.getElementById("stickyCompare");
  const stickyAddToCart = document.getElementById("stickyAddToCart");
  const stickyAddToCartLabel = document.getElementById("stickyAddToCartLabel");
  const cartBadge = document.querySelector(".cart-badge");

  function formatMoney(value) {
    return "$" + Number(value).toFixed(2);
  }

  function clampQty(value) {
    const next = parseInt(value, 10);
    if (Number.isNaN(next) || next < 1) return 1;
    if (next > 99) return 99;
    return next;
  }

  function updatePrices() {
    const total = productState.price * productState.qty;
    const compareTotal = productState.compare * productState.qty;
    const savePercent = productState.compare
      ? Math.round((1 - productState.price / productState.compare) * 100)
      : 0;

    if (priceEl) priceEl.textContent = formatMoney(total);
    if (compareEl) compareEl.textContent = formatMoney(compareTotal);
    if (saveEl) saveEl.textContent = "SAVE " + savePercent + "%";
    if (saleBadge) saleBadge.textContent = "SAVE " + savePercent + "%";
    if (addToCartLabel) addToCartLabel.textContent = "Add to cart — " + formatMoney(total);
    if (stickyPrice) stickyPrice.textContent = formatMoney(total);
    if (stickyCompare) stickyCompare.textContent = formatMoney(compareTotal);
    if (qtyInput) qtyInput.value = String(productState.qty);
  }

  function setActiveThumb(index) {
    if (!thumbnails.length) return;
    const safeIndex = (index + thumbnails.length) % thumbnails.length;
    const thumbnail = thumbnails[safeIndex];
    const newImage = thumbnail.dataset.image;

    thumbnails.forEach(function (item) {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    thumbnail.classList.add("active");
    thumbnail.setAttribute("aria-pressed", "true");

    if (mainImage && newImage && mainImage.src !== newImage) {
      mainImage.style.opacity = "0";
      setTimeout(function () {
        mainImage.src = newImage;
        mainImage.onload = function () {
          mainImage.style.opacity = "1";
        };
      }, 150);
    }
  }

  function getActiveThumbIndex() {
    return Math.max(
      0,
      thumbnails.findIndex(function (item) {
        return item.classList.contains("active");
      }),
    );
  }

  function openLightbox() {
    if (!lightbox || !lightboxImage || !mainImage) return;
    lightboxImage.src = mainImage.src;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function confirmAddToCart() {
    const selectedChip = document.querySelector(".pdp-option-chip.active");
    productState.chip = selectedChip ? selectedChip.dataset.optionChip : productState.chip;

    if (cartBadge) {
      const current = parseInt(cartBadge.textContent, 10) || 0;
      cartBadge.textContent = String(current + productState.qty);
    }

    const originalSticky = stickyAddToCartLabel ? stickyAddToCartLabel.textContent : "";

    if (addToCartLabel) addToCartLabel.textContent = "Added ✓";
    if (stickyAddToCartLabel) stickyAddToCartLabel.textContent = "ADDED ✓";
    if (addToCart) addToCart.classList.add("is-added");
    if (stickyAddToCart) stickyAddToCart.classList.add("is-added");

    console.log("Add to cart (static demo):", {
      option: productState.option,
      qty: productState.qty,
      price: productState.price,
      compare: productState.compare,
      chip: productState.chip,
      total: productState.price * productState.qty,
    });

    setTimeout(function () {
      updatePrices();
      if (stickyAddToCartLabel) stickyAddToCartLabel.textContent = originalSticky || "ADD TO CART";
      if (addToCart) addToCart.classList.remove("is-added");
      if (stickyAddToCart) stickyAddToCart.classList.remove("is-added");
    }, 1500);
  }

  thumbnails.forEach(function (thumbnail, index) {
    thumbnail.addEventListener("click", function () {
      setActiveThumb(index);
    });
  });

  let didSwipe = false;

  if (zoomTrigger) {
    zoomTrigger.addEventListener("click", function () {
      if (didSwipe) {
        didSwipe = false;
        return;
      }
      openLightbox();
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeLightbox();
    if (!gallery || document.activeElement !== gallery) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveThumb(getActiveThumbIndex() + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveThumb(getActiveThumbIndex() - 1);
    }
  });

  if (mainImage) {
    let touchStartX = 0;
    mainImage.addEventListener(
      "touchstart",
      function (event) {
        touchStartX = event.changedTouches[0].clientX;
        didSwipe = false;
      },
      { passive: true },
    );
    mainImage.addEventListener(
      "touchend",
      function (event) {
        const delta = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) < 40) return;
        didSwipe = true;
        setActiveThumb(getActiveThumbIndex() + (delta < 0 ? 1 : -1));
      },
      { passive: true },
    );
  }

  purchaseOptions.forEach(function (option) {
    option.addEventListener("click", function () {
      purchaseOptions.forEach(function (item) {
        item.classList.remove("active");
        item.setAttribute("aria-checked", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-checked", "true");
      productState.option = this.dataset.option || "single";
      productState.price = parseFloat(this.dataset.price) || 49;
      productState.compare = parseFloat(this.dataset.compare) || 65;
      updatePrices();
    });
  });

  optionChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      optionChips.forEach(function (item) {
        item.classList.remove("active");
        item.setAttribute("aria-checked", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-checked", "true");
      productState.chip = this.dataset.optionChip || "1";
    });
  });

  if (qtyMinus) {
    qtyMinus.addEventListener("click", function () {
      productState.qty = clampQty(productState.qty - 1);
      updatePrices();
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener("click", function () {
      productState.qty = clampQty(productState.qty + 1);
      updatePrices();
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener("change", function () {
      productState.qty = clampQty(this.value);
      updatePrices();
    });
  }

  const accordions = document.querySelectorAll(".pdp-accordion");
  accordions.forEach(function (accordion) {
    const button = accordion.querySelector(".pdp-accordion-button");
    if (!button) return;
    button.addEventListener("click", function () {
      const isOpen = accordion.classList.contains("open");
      accordions.forEach(function (item) {
        item.classList.remove("open");
        const itemButton = item.querySelector(".pdp-accordion-button");
        if (itemButton) itemButton.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        accordion.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  if (addToCart) {
    addToCart.addEventListener("click", confirmAddToCart);
  }

  updatePrices();
});

document.addEventListener("DOMContentLoaded", function () {
  const accordions = document.querySelectorAll(".product-accordion");

  accordions.forEach(function (accordion) {
    const trigger = accordion.querySelector(".accordion-trigger");
    const content = accordion.querySelector(".accordion-content");
    if (!trigger || !content) return;

    trigger.addEventListener("click", function () {
      const isActive = accordion.classList.contains("active");

      accordions.forEach(function (item) {
        item.classList.remove("active");
        const itemTrigger = item.querySelector(".accordion-trigger");
        const itemContent = item.querySelector(".accordion-content");
        if (itemTrigger) itemTrigger.setAttribute("aria-expanded", "false");
        if (itemContent) itemContent.style.maxHeight = null;
      });

      if (!isActive) {
        accordion.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
});

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
    { threshold: 0.15 },
  );

  benefitCards.forEach(function (card, index) {
    card.style.transitionDelay = `${index * 80}ms`;
    observer.observe(card);
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

    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(window.getComputedStyle(slider).gap) || 0;
    slider.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;

    if (maxIndex === 0) {
      progress.style.width = "100%";
      progress.style.transform = "translateX(0)";
      return;
    }

    const progressWidth = 100 / (maxIndex + 1);
    progress.style.width = `${progressWidth}%`;
    progress.style.transform = `translateX(${currentIndex * 100}%)`;
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

document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("relatedProductsTrack");
  const prevButton = document.getElementById("relatedPrev");
  const nextButton = document.getElementById("relatedNext");
  const wishlistButtons = document.querySelectorAll(".related-product-wishlist");
  const quickAddButtons = document.querySelectorAll(".related-product-quick-add");

  let currentPosition = 0;

  function getVisibleProducts() {
    if (window.innerWidth <= 767) return 2;
    if (window.innerWidth <= 1000) return 3;
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
    if (prevButton) prevButton.disabled = currentPosition === 0;
    if (nextButton) nextButton.disabled = currentPosition >= maxPosition;
  }

  if (nextButton && track) {
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

  wishlistButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      button.textContent = button.classList.contains("active") ? "♥" : "♡";
    });
  });

  quickAddButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const originalText = button.textContent;
      button.textContent = "Added ✓";
      button.style.backgroundColor = "var(--primary-green)";
      button.style.color = "var(--cream)";
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = "";
        button.style.color = "";
      }, 1500);
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const icon = item.querySelector(".faq-icon");
    if (!question) return;

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      faqItems.forEach((faq) => {
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

document.addEventListener("DOMContentLoaded", function () {
  const productSection = document.getElementById("product-information");
  const stickyBar = document.getElementById("stickyProductBar");
  const stickyAddToCart = document.getElementById("stickyAddToCart");

  if (!productSection || !stickyBar) return;

  function checkStickyBar() {
    const sectionRect = productSection.getBoundingClientRect();
    if (sectionRect.bottom <= 0) {
      stickyBar.classList.add("show");
      document.body.classList.add("sticky-bar-visible");
    } else {
      stickyBar.classList.remove("show");
      document.body.classList.remove("sticky-bar-visible");
    }
  }

  window.addEventListener("scroll", checkStickyBar, { passive: true });
  window.addEventListener("resize", checkStickyBar);
  checkStickyBar();

  if (stickyAddToCart) {
    stickyAddToCart.addEventListener("click", function () {
      const mainAddToCart = document.querySelector(".pdp-add-to-cart");
      if (mainAddToCart) mainAddToCart.click();
    });
  }
});
