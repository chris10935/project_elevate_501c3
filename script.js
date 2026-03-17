/* ============================================================
   PROJECT ELEVATE — script.js
   ============================================================ */

(function () {
  'use strict';

  // ===================== NAVBAR SCROLL =====================
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  // ===================== MOBILE NAV =====================
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close nav on link click
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close nav on outside click
  document.addEventListener('click', function (e) {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !navToggle.contains(e.target)) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // ===================== BACK TO TOP =====================
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===================== SMOOTH SCROLL =====================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navbarHeight = navbar.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ===================== FLIP CARDS (click / keyboard for touch & accessibility) =====================
  document.querySelectorAll('.flip-card').forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

  // ===================== HIGHLIGHT CARDS BOUNCE ON SCROLL =====================
  const highlightItems = document.querySelectorAll('.highlight-item');

  if ('IntersectionObserver' in window && highlightItems.length) {
    const highlightObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const index = Array.prototype.indexOf.call(highlightItems, entry.target);
          setTimeout(function () {
            entry.target.classList.add('bounce-in');
          }, index * 120);
          highlightObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    highlightItems.forEach(function (item) {
      highlightObserver.observe(item);
    });
  } else {
    highlightItems.forEach(function (item) { item.classList.add('bounce-in'); });
  }

  // ===================== VALUES CAROUSEL =====================
  (function () {
    var carousel = document.querySelector('.values-carousel');
    var track = document.querySelector('.values-track');
    if (!carousel || !track) return;

    var GAP = 28;
    var currentIndex = 0;
    var autoTimer = null;

    // Clone all cards and append to create seamless loop
    var origCards = Array.from(track.children);
    origCards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    var allCards = Array.from(track.children);

    function getVisibleCount() {
      return window.innerWidth > 768 ? 3 : 1;
    }

    function updateCardWidths() {
      var visibleCount = getVisibleCount();
      var containerWidth = carousel.offsetWidth;
      var cardWidth = (containerWidth - GAP * (visibleCount - 1)) / visibleCount;
      allCards.forEach(function (card) {
        card.style.width = cardWidth + 'px';
      });
    }

    function getStepPx() {
      return allCards[0] ? allCards[0].offsetWidth + GAP : 0;
    }

    function goTo(index, animate) {
      if (animate === false) {
        track.style.transition = 'none';
      } else {
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      }
      currentIndex = index;
      track.style.transform = 'translateX(-' + (currentIndex * getStepPx()) + 'px)';
    }

    // After each transition, if we're into the clone zone, silently reset to original
    track.addEventListener('transitionend', function () {
      if (currentIndex >= origCards.length) {
        goTo(currentIndex - origCards.length, false);
      }
    });

    function advance() {
      goTo(currentIndex + 1, true);
    }

    function startAuto() {
      autoTimer = setInterval(advance, 2500);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    document.querySelector('.carousel-btn-prev').addEventListener('click', function () {
      // Going left: if at 0, jump silently to clone zone then animate back
      if (currentIndex <= 0) {
        goTo(origCards.length, false);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { goTo(origCards.length - 1, true); });
        });
      } else {
        goTo(currentIndex - 1, true);
      }
      resetAuto();
    });

    document.querySelector('.carousel-btn-next').addEventListener('click', function () {
      advance();
      resetAuto();
    });

    window.addEventListener('resize', function () {
      updateCardWidths();
      goTo(currentIndex, false);
    });

    updateCardWidths();
    startAuto();
  })();

  // ===================== ABOUT SLIDESHOW =====================
  (function () {
    var track = document.querySelector('.slideshow-track');
    var dotsContainer = document.querySelector('.slideshow-dots');
    if (!track || !dotsContainer) return;

    var slides = Array.from(track.querySelectorAll('.slide'));
    var total = slides.length;
    var current = 0;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'slideshow-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsContainer.appendChild(dot);
    });

    var dots = Array.from(dotsContainer.querySelectorAll('.slideshow-dot'));

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === current);
      });
    }

    setInterval(function () { goTo(current + 1); }, 3500);
  })();

  // ===================== STATS COUNTER =====================
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let statsAnimated = false;

  function animateCounters() {
    statNumbers.forEach(function (el) {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const duration = 1800;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(update);
    });
  }

  if ('IntersectionObserver' in window) {
    const statsSection = document.getElementById('impact');
    if (statsSection) {
      const statsObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !statsAnimated) {
          statsAnimated = true;
          animateCounters();
          statsObserver.disconnect();
        }
      }, { threshold: 0.3 });
      statsObserver.observe(statsSection);
    }
  }

  // ===================== DONATE AMOUNT SELECTOR =====================
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customAmount = document.getElementById('customAmount');

  amountBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      amountBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (customAmount) customAmount.value = '';
    });
  });

  if (customAmount) {
    customAmount.addEventListener('input', function () {
      amountBtns.forEach(function (b) { b.classList.remove('active'); });
    });
  }

  // ===================== TOAST NOTIFICATION =====================
  const toast = document.getElementById('toast');

  function showToast(message, type) {
    toast.textContent = message;
    toast.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(function () {
      toast.className = 'toast';
    }, 4000);
  }

  // ===================== DONATE FORM =====================
  const donateForm = document.getElementById('donateForm');

  if (donateForm) {
    donateForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('donorName').value.trim();
      const email = document.getElementById('donorEmail').value.trim();

      if (!name) {
        showToast('Please enter your full name.', '');
        document.getElementById('donorName').focus();
        return;
      }

      if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', '');
        document.getElementById('donorEmail').focus();
        return;
      }

      // In a real implementation, this would submit to a payment processor
      showToast('Thank you, ' + sanitize(name) + '! Your support elevates lives. We\'ll be in touch soon.', 'success');
      donateForm.reset();
      amountBtns.forEach(function (b) { b.classList.remove('active'); });
      document.querySelector('.amount-btn[data-amount="100"]').classList.add('active');
    });
  }

  // ===================== CONTACT FORM =====================
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name) {
        showToast('Please enter your full name.', '');
        document.getElementById('contactName').focus();
        return;
      }

      if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', '');
        document.getElementById('contactEmail').focus();
        return;
      }

      if (!message) {
        showToast('Please enter a message.', '');
        document.getElementById('contactMessage').focus();
        return;
      }

      // In a real implementation, this would POST to a backend endpoint
      showToast('Message received, ' + sanitize(name) + '! We\'ll respond within 48 hours.', 'success');
      contactForm.reset();
    });
  }

  // ===================== HELPERS =====================
  function isValidEmail(email) {
    // RFC 5322-based regex — validates structure without executing user input
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function sanitize(str) {
    // Escape HTML special chars before inserting into DOM text
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, function (m) { return map[m]; });
  }

})();
