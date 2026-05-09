(function () {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggle = document.getElementById('sidebar-toggle');
  const close = document.getElementById('sidebar-close');

  function open() {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  }

  function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }

  toggle.addEventListener('click', open);
  close.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);

  // Tabs
  const tabButtons = document.querySelectorAll('[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tab = btn.getAttribute('data-tab');
      tabButtons.forEach(function (b) {
        b.classList.remove('text-primary', 'border-primary');
        b.classList.add('text-muted', 'border-transparent');
        b.setAttribute('aria-selected', 'false');
      });
      tabContents.forEach(function (c) {
        c.classList.add('hidden');
      });
      btn.classList.remove('text-muted', 'border-transparent');
      btn.classList.add('text-primary', 'border-primary');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById('tab-' + tab).classList.remove('hidden');
    });
  });

  // Modal
  const addBtn = document.getElementById('add-user-btn');
  const modal = document.getElementById('add-user-modal');
  const modalCancel = document.getElementById('modal-cancel');
  const addUserForm = document.getElementById('add-user-form');
  const nameInput = document.getElementById('user-name');
  const emailInput = document.getElementById('user-email');
  const toast = document.getElementById('toast');
  const toastMessage = toast ? toast.querySelector('.toast-message') : null;

  if (addBtn && modal) {
    addBtn.addEventListener('click', function () {
      modal.classList.remove('modal-hidden');
      modal.classList.add('modal-open');
      clearFormErrors();
    });
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('modal-open');
      // Wait for transition to finish before fully hiding
      setTimeout(function () {
        if (modal) modal.classList.add('modal-hidden');
      }, 300);
    }
  }

  if (modalCancel) modalCancel.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      var content = modal.querySelector('.modal-panel');
      if (content && content.contains(e.target)) return;
      closeModal();
    });
  }

  // Form validation
  function clearFormErrors() {
    if (!nameInput || !emailInput) return;
    nameInput.classList.remove('is-invalid');
    emailInput.classList.remove('is-invalid');
    var nameError = nameInput.parentElement.querySelector('.form-error');
    var emailError = emailInput.parentElement.querySelector('.form-error');
    if (nameError) nameError.classList.add('hidden');
    if (emailError) emailError.classList.add('hidden');
  }

  function showFieldError(input, show) {
    if (!input) return;
    var errorSpan = input.parentElement.querySelector('.form-error');
    if (show) {
      input.classList.add('is-invalid');
      if (errorSpan) errorSpan.classList.remove('hidden');
    } else {
      input.classList.remove('is-invalid');
      if (errorSpan) errorSpan.classList.add('hidden');
    }
  }

  function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateForm() {
    var nameValue = nameInput ? nameInput.value.trim() : '';
    var emailValue = emailInput ? emailInput.value.trim() : '';
    var nameValid = nameValue.length > 0;
    var emailValid = validateEmail(emailValue);

    showFieldError(nameInput, !nameValid);
    showFieldError(emailInput, !emailValid);

    return nameValid && emailValid;
  }

  function showToast(message, type) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.remove('toast--success', 'toast--error');
    toast.classList.add(type === 'success' ? 'toast--success' : 'toast--error');
    toast.classList.add('toast-visible');
    setTimeout(function () {
      toast.classList.remove('toast-visible');
    }, 3000);
  }

  if (addUserForm) {
    addUserForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateForm()) {
        addUserForm.reset();
        closeModal();
        showToast('User added successfully', 'success');
      }
    });
  }

  // Clear errors on input
  if (nameInput) {
    nameInput.addEventListener('input', function () {
      showFieldError(nameInput, false);
    });
  }
  if (emailInput) {
    emailInput.addEventListener('input', function () {
      showFieldError(emailInput, false);
    });
  }

  // Dropdowns
  var notificationBtn = document.getElementById('notification-btn');
  var notificationDropdown = document.getElementById('notification-dropdown');
  var profileBtn = document.getElementById('profile-btn');
  var profileDropdown = document.getElementById('profile-dropdown');

  function toggleDropdown(btn, dropdown) {
    if (!btn || !dropdown) return;
    var isHidden = dropdown.classList.contains('hidden');
    closeDropdowns();
    if (isHidden) {
      dropdown.classList.remove('hidden');
    }
  }

  function closeDropdowns() {
    if (notificationDropdown) notificationDropdown.classList.add('hidden');
    if (profileDropdown) profileDropdown.classList.add('hidden');
  }

  if (notificationBtn) {
    notificationBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(notificationBtn, notificationDropdown);
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(profileBtn, profileDropdown);
    });
  }

  document.addEventListener('click', function () {
    closeDropdowns();
  });

  if (notificationDropdown) {
    notificationDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  if (profileDropdown) {
    profileDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }
})();

// =============================================
// REVENUE CHART
// Own IIFE keeps variables scoped.
// window.revenueChart is exposed intentionally
// so the dark mode toggle can call .update() later.
// =============================================
(function () {

  // Bail if canvas doesn't exist — safe for other pages sharing main.js
  var canvas = document.getElementById('revenueChart');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');

  // --- GRADIENT FILL ---
  // Built fresh on every render so it survives resize correctly.
  // chartArea gives exact pixel bounds of the plot (excludes axes).
  function createGradient(ctx, chartArea) {
    var gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)'); // emerald 25% at top
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');    // transparent at bottom
    return gradient;
  }

  // --- MOCK DATA ---
  // Realistic curve: slight dip in Feb, recovery, acceleration into May.
  // May value matches the $48,294 shown in the Revenue KPI card.
  var labels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  var revenue = [38200, 41500, 39800, 43100, 46700, 48294];

  // --- CHART INSTANCE ---
  window.revenueChart = new Chart(ctx, {
    type: 'line',

    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue',
        data: revenue,

        // Line
        borderColor: '#10b981',
        borderWidth: 2,

        // Gradient fill under the line
        fill: 'origin',
        backgroundColor: function (context) {
          var chart = context.chart;
          var chartArea = chart.chartArea;
          if (!chartArea) return 'transparent'; // guard: null on first tick
          return createGradient(chart.ctx, chartArea);
        },

        // Curve smoothness: 0 = sharp, 1 = very curved, 0.4 = sweet spot
        tension: 0.4,

        // Data point dots
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#09090b',       // matches body bg — creates a ring effect
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false, // wrapper div controls height, not Chart.js

      animation: {
        duration: 800,
        easing: 'easeInOutQuart'
      },

      interaction: {
        mode: 'nearest',     // tooltip fires near a point, not only on it
        intersect: false,    // works without pixel-perfect tap — essential on mobile
        axis: 'x'
      },

      plugins: {
        legend: {
          display: false     // one dataset + card title = legend is redundant
        },

        tooltip: {
          backgroundColor: '#18181b',
          borderColor: '#27272a',
          borderWidth: 1,
          titleColor: '#a1a1aa',
          bodyColor: '#f4f4f5',
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function (context) {
              return '$' + context.parsed.y.toLocaleString();
            }
          }
        }
      },

      scales: {
        x: {
          border: { display: false },
          grid: { display: false },   // no vertical grid lines — cleaner
          ticks: {
            color: '#a1a1aa',
            font: { size: 12 }
          }
        },

        y: {
          border: { display: false },
          grid: {
            color: '#27272a',          // matches your --border token
            lineWidth: 1
          },
          ticks: {
            color: '#a1a1aa',
            font: { size: 12 },
            callback: function (value) {
              return '$' + (value / 1000).toFixed(0) + 'k'; // 38200 → $38k
            }
          }
        }
      }
    }
  });

})();
