/**
 * ShopRetail PDP — gallery, variants, qty, Buy1/Buy2, Ajax ATC, sticky bar, accordions
 */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function money(cents, moneyFormat) {
    var amount = (Number(cents) || 0) / 100;
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function' && moneyFormat) {
      return window.Shopify.formatMoney(cents, moneyFormat);
    }
    return '$' + amount.toFixed(2);
  }

  function cartAddUrl() {
    var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    return root + 'cart/add.js';
  }

  function refreshHorizonCart() {
    if (typeof window.srRefreshHorizonCart === 'function') {
      window.srRefreshHorizonCart();
      return;
    }
    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.dispatchEvent(new CustomEvent('cart:update', { detail: { cart: cart } }));
        document.dispatchEvent(new CustomEvent('cart:refresh'));
        var drawer = document.querySelector('cart-drawer');
        if (drawer && typeof drawer.open === 'function') drawer.open();
      })
      .catch(function () {});
  }

  ready(function () {
    document.querySelectorAll('.sr-theme [data-sr-product]').forEach(initProduct);
    initPdpAccordions();
    initReviewsIfPresent();
    initFaqIfPresent();
  });

  function initProduct(root) {
    var productJsonEl = root.querySelector('[data-sr-product-json]');
    var variants = [];
    try {
      variants = JSON.parse(productJsonEl ? productJsonEl.textContent : '[]');
    } catch (e) {
      variants = [];
    }

    var moneyFormat = root.getAttribute('data-money-format') || '${{amount}}';
    var form = root.querySelector('[data-sr-product-form]');
    var variantInput = root.querySelector('[name="id"]');
    var qtyInput = root.querySelector('[data-sr-qty-input]');
    var qtyMinus = root.querySelector('[data-sr-qty-minus]');
    var qtyPlus = root.querySelector('[data-sr-qty-plus]');
    var priceEl = root.querySelector('[data-sr-price]');
    var compareEl = root.querySelector('[data-sr-compare]');
    var saveEl = root.querySelector('[data-sr-save]');
    var saleBadge = root.querySelector('[data-sr-sale-badge]');
    var mainImage = root.querySelector('[data-sr-main-image]');
    var thumbnails = Array.from(root.querySelectorAll('[data-sr-thumb]'));
    var gallery = root.querySelector('[data-sr-gallery]');
    var zoomTrigger = root.querySelector('[data-sr-zoom]');
    var lightbox = root.querySelector('[data-sr-lightbox]');
    var lightboxImage = root.querySelector('[data-sr-lightbox-image]');
    var lightboxClose = root.querySelector('[data-sr-lightbox-close]');
    var optionGroups = Array.from(root.querySelectorAll('[data-sr-option-group]'));
    var purchaseOptions = Array.from(root.querySelectorAll('[data-sr-purchase-option]'));
    var addToCart = root.querySelector('[data-sr-add-to-cart]');
    var addToCartLabel = root.querySelector('[data-sr-add-to-cart-label]');
    var stickyBar = root.querySelector('[data-sr-sticky-bar]');
    var stickyPrice = root.querySelector('[data-sr-sticky-price]');
    var stickyCompare = root.querySelector('[data-sr-sticky-compare]');
    var stickyAdd = root.querySelector('[data-sr-sticky-add]');
    var stickyAddLabel = root.querySelector('[data-sr-sticky-add-label]');
    var productInfo = root.querySelector('[data-sr-product-info]');

    var state = {
      qty: 1,
      packQty: 1,
      selectedOptions: {},
      variant: variants.find(function (v) { return v.available; }) || variants[0] || null,
    };

    optionGroups.forEach(function (group) {
      var name = group.getAttribute('data-option-name');
      var active = group.querySelector('.pdp-option-chip.active');
      if (name && active) state.selectedOptions[name] = active.getAttribute('data-option-value');
    });

    function findVariant() {
      return (
        variants.find(function (v) {
          return v.options.every(function (opt, i) {
            var optionName = 'option' + (i + 1);
            var selected = state.selectedOptions[optionName] || state.selectedOptions[String(i)];
            // Prefer matching by option index keys option1..n stored on chips
            var key = 'option' + (i + 1);
            var val = state.selectedOptions[key];
            return val == null || String(opt) === String(val);
          });
        }) || state.variant
      );
    }

    function clampQty(value) {
      var next = parseInt(value, 10);
      if (Number.isNaN(next) || next < 1) return 1;
      if (next > 99) return 99;
      return next;
    }

    function updatePrices() {
      if (!state.variant) return;
      var unit = state.variant.price;
      var compare = state.variant.compare_at_price || 0;
      var lineQty = state.qty * state.packQty;
      var total = unit * lineQty;
      var compareTotal = compare * lineQty;
      var savePercent =
        compare > unit ? Math.round((1 - unit / compare) * 100) : 0;

      if (priceEl) priceEl.textContent = money(total, moneyFormat);
      if (compareEl) {
        compareEl.textContent = compareTotal > total ? money(compareTotal, moneyFormat) : '';
        compareEl.hidden = !(compareTotal > total);
      }
      if (saveEl) {
        saveEl.textContent = savePercent ? 'SAVE ' + savePercent + '%' : '';
        saveEl.hidden = !savePercent;
      }
      if (saleBadge) {
        saleBadge.textContent = savePercent ? 'SAVE ' + savePercent + '%' : '';
        saleBadge.hidden = !savePercent;
      }
      if (addToCartLabel) {
        addToCartLabel.textContent = state.variant.available
          ? 'Add to cart — ' + money(total, moneyFormat)
          : 'Sold out';
      }
      if (stickyPrice) stickyPrice.textContent = money(total, moneyFormat);
      if (stickyCompare) {
        stickyCompare.textContent = compareTotal > total ? money(compareTotal, moneyFormat) : '';
        stickyCompare.hidden = !(compareTotal > total);
      }
      if (qtyInput) qtyInput.value = String(state.qty);
      if (variantInput) variantInput.value = String(state.variant.id);
      if (addToCart) addToCart.disabled = !state.variant.available;
      if (stickyAdd) stickyAdd.disabled = !state.variant.available;
    }

    function applyVariantMedia() {
      if (!state.variant || !mainImage) return;
      var featured = state.variant.featured_image;
      if (featured && featured.src) {
        mainImage.src = featured.src;
        thumbnails.forEach(function (thumb) {
          var mid = thumb.getAttribute('data-media-id');
          thumb.classList.toggle('active', mid && String(mid) === String(featured.id));
        });
      }
    }

    function selectVariant() {
      state.variant = findVariant();
      updatePrices();
      applyVariantMedia();
    }

    optionGroups.forEach(function (group) {
      var optionKey = group.getAttribute('data-option-key'); // option1
      group.querySelectorAll('.pdp-option-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          group.querySelectorAll('.pdp-option-chip').forEach(function (c) {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
          });
          chip.classList.add('active');
          chip.setAttribute('aria-checked', 'true');
          state.selectedOptions[optionKey] = chip.getAttribute('data-option-value');
          selectVariant();
        });
      });
    });

    purchaseOptions.forEach(function (option) {
      option.addEventListener('click', function () {
        purchaseOptions.forEach(function (item) {
          item.classList.remove('active');
          item.setAttribute('aria-checked', 'false');
        });
        option.classList.add('active');
        option.setAttribute('aria-checked', 'true');
        state.packQty = parseInt(option.getAttribute('data-pack-qty') || '1', 10) || 1;
        updatePrices();
      });
    });

    if (qtyMinus) {
      qtyMinus.addEventListener('click', function () {
        state.qty = clampQty(state.qty - 1);
        updatePrices();
      });
    }
    if (qtyPlus) {
      qtyPlus.addEventListener('click', function () {
        state.qty = clampQty(state.qty + 1);
        updatePrices();
      });
    }
    if (qtyInput) {
      qtyInput.addEventListener('change', function () {
        state.qty = clampQty(qtyInput.value);
        updatePrices();
      });
    }

    function setActiveThumb(index) {
      if (!thumbnails.length) return;
      var safe = (index + thumbnails.length) % thumbnails.length;
      var thumb = thumbnails[safe];
      var src = thumb.getAttribute('data-image');
      thumbnails.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      thumb.classList.add('active');
      thumb.setAttribute('aria-pressed', 'true');
      if (mainImage && src) {
        mainImage.style.opacity = '0';
        setTimeout(function () {
          mainImage.src = src;
          mainImage.onload = function () {
            mainImage.style.opacity = '1';
          };
        }, 150);
      }
    }

    thumbnails.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        setActiveThumb(index);
      });
    });

    function openLightbox() {
      if (!lightbox || !lightboxImage || !mainImage) return;
      lightboxImage.src = mainImage.src;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      if (!lightbox) return;
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }
    if (zoomTrigger) zoomTrigger.addEventListener('click', openLightbox);
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });

    function addToCartAction() {
      if (!state.variant || !state.variant.available) return;
      var quantity = state.qty * state.packQty;
      var buttons = [addToCart, stickyAdd].filter(Boolean);
      buttons.forEach(function (b) { b.disabled = true; });
      var prevLabel = addToCartLabel ? addToCartLabel.textContent : '';
      var prevSticky = stickyAddLabel ? stickyAddLabel.textContent : '';

      fetch(cartAddUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          items: [{ id: state.variant.id, quantity: quantity }],
        }),
      })
        .then(function (r) {
          if (!r.ok) return r.json().then(function (err) { throw err; });
          return r.json();
        })
        .then(function () {
          if (addToCartLabel) addToCartLabel.textContent = 'Added ✓';
          if (stickyAddLabel) stickyAddLabel.textContent = 'ADDED ✓';
          if (addToCart) addToCart.classList.add('is-added');
          if (stickyAdd) stickyAdd.classList.add('is-added');
          refreshHorizonCart();
          setTimeout(function () {
            updatePrices();
            if (stickyAddLabel) stickyAddLabel.textContent = prevSticky || 'ADD TO CART';
            if (addToCart) addToCart.classList.remove('is-added');
            if (stickyAdd) stickyAdd.classList.remove('is-added');
            buttons.forEach(function (b) { b.disabled = false; });
          }, 1500);
        })
        .catch(function () {
          if (addToCartLabel) addToCartLabel.textContent = prevLabel;
          buttons.forEach(function (b) { b.disabled = false; });
        });
    }

    if (addToCart) {
      addToCart.addEventListener('click', function (e) {
        e.preventDefault();
        addToCartAction();
      });
    }
    if (stickyAdd) {
      stickyAdd.addEventListener('click', function (e) {
        e.preventDefault();
        addToCartAction();
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        addToCartAction();
      });
    }

    if (stickyBar && productInfo) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var show = !entry.isIntersecting;
            stickyBar.classList.toggle('show', show);
            stickyBar.hidden = !show;
            document.body.classList.toggle('sticky-bar-visible', show);
          });
        },
        { threshold: 0, rootMargin: '0px' },
      );
      observer.observe(productInfo);
    }

    selectVariant();
  }

  function initPdpAccordions() {
    document.querySelectorAll('.sr-theme .pdp-accordion').forEach(function (accordion) {
      var button = accordion.querySelector('.pdp-accordion-button');
      if (!button) return;
      button.addEventListener('click', function () {
        var isOpen = accordion.classList.contains('open');
        var section = accordion.closest('.pdp-accordions') || accordion.parentElement;
        section.querySelectorAll('.pdp-accordion').forEach(function (item) {
          item.classList.remove('open');
          var itemButton = item.querySelector('.pdp-accordion-button');
          if (itemButton) itemButton.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          accordion.classList.add('open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initReviewsIfPresent() {
    /* handled by sr-home.js when both scripts load */
  }
  function initFaqIfPresent() {
    /* handled by sr-home.js */
  }
})();
