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

  // ===================== INTERSECTION OBSERVER (VALUE CARDS) =====================
  const valueCards = document.querySelectorAll('.value-card');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    valueCards.forEach(function (card) {
      observer.observe(card);
    });
  } else {
    // Fallback: show all cards if IntersectionObserver is not supported
    valueCards.forEach(function (card) { card.classList.add('visible'); });
  }

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
