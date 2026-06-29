/* ============================================
   YEDITEPE FOLKLOR — ÖN KAYIT FORMU
   JavaScript: Doğrulama, Gönderim, Animasyonlar
   ============================================ */

(function () {
  'use strict';

  // =============================================
  // CONFIG
  // =============================================
  // ÖNEMLİ: Aşağıdaki URL'yi kendi Google Apps Script Web App URL'nizle değiştirin.
  // README.md dosyasındaki kurulum adımlarını takip edin.
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw179jjiwVwsQ0GS6OIH-QDLozclw_U96bLVpYbQ-L0H3i0GWcMu9fevLRIMfJg98Qr/exec';

  // =============================================
  // DOM ELEMENTS
  // =============================================
  const form = document.getElementById('onKayitForm');
  const formContent = document.getElementById('formContent');
  const successScreen = document.getElementById('successScreen');
  const submitBtn = document.getElementById('submitBtn');

  // =============================================
  // PHONE MASK
  // =============================================
  const telefonInput = document.getElementById('telefon');

  telefonInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');

    // Max 11 digits (05XX XXX XX XX)
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    // Format: 0(5XX) XXX XX XX
    let formatted = '';
    if (value.length > 0) {
      formatted = value.substring(0, 1); // 0
    }
    if (value.length > 1) {
      formatted += '(' + value.substring(1, 4); // (5XX
    }
    if (value.length > 4) {
      formatted += ') ' + value.substring(4, 7); // ) XXX
    }
    if (value.length > 7) {
      formatted += ' ' + value.substring(7, 9); // XX
    }
    if (value.length > 9) {
      formatted += ' ' + value.substring(9, 11); // XX
    }

    e.target.value = formatted;
  });

  // Prevent non-numeric input on keypress
  telefonInput.addEventListener('keypress', function (e) {
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
      e.preventDefault();
    }
  });

  // =============================================
  // SCROLL ANIMATIONS (IntersectionObserver)
  // =============================================
  function initScrollAnimations() {
    const groups = document.querySelectorAll('.form-group');

    // If IntersectionObserver is not supported, show all immediately
    if (!('IntersectionObserver' in window)) {
      groups.forEach(function (g) { g.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    groups.forEach(function (group, index) {
      group.style.transitionDelay = (index * 0.06) + 's';
      observer.observe(group);
    });
  }

  // =============================================
  // VALIDATION
  // =============================================
  function showError(fieldId, show) {
    var errorEl = document.getElementById('error-' + fieldId);
    var inputEl = document.getElementById(fieldId);

    if (errorEl) {
      if (show) {
        errorEl.classList.add('show');
      } else {
        errorEl.classList.remove('show');
      }
    }

    if (inputEl) {
      if (show) {
        inputEl.classList.add('error');
      } else {
        inputEl.classList.remove('error');
      }
    }
  }

  function validateForm() {
    let isValid = true;

    // 1. Ad Soyad (required)
    const adsoyad = document.getElementById('adsoyad').value.trim();
    if (!adsoyad || adsoyad.length < 3) {
      showError('adsoyad', true);
      isValid = false;
    } else {
      showError('adsoyad', false);
    }

    // 2. E-posta (required)
    const eposta = document.getElementById('eposta').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!eposta || !emailRegex.test(eposta)) {
      showError('eposta', true);
      isValid = false;
    } else {
      showError('eposta', false);
    }

    // 3. Doğum Tarihi (required)
    const dogumtarihi = document.getElementById('dogumtarihi').value;
    if (!dogumtarihi) {
      showError('dogumtarihi', true);
      isValid = false;
    } else {
      showError('dogumtarihi', false);
    }

    // 3. Cinsiyet (required)
    const cinsiyet = document.querySelector('input[name="cinsiyet"]:checked');
    if (!cinsiyet) {
      showError('cinsiyet', true);
      isValid = false;
    } else {
      showError('cinsiyet', false);
    }

    // 4. Telefon (required, min 10 digits)
    const telefonRaw = document.getElementById('telefon').value.replace(/\D/g, '');
    if (!telefonRaw || telefonRaw.length < 10) {
      showError('telefon', true);
      isValid = false;
    } else {
      showError('telefon', false);
    }

    // 5. Adres — optional, no validation
    // 6. Tecrübe (required)
    const tecrube = document.querySelector('input[name="tecrube"]:checked');
    if (!tecrube) {
      showError('tecrube', true);
      isValid = false;
    } else {
      showError('tecrube', false);
    }

    // 7. Eğitim aldığı yöreler — optional

    return isValid;
  }

  // Clear errors on input
  document.querySelectorAll('.form-input').forEach(function (input) {
    input.addEventListener('input', function () {
      this.classList.remove('error');
      var errorEl = document.getElementById('error-' + this.id);
      if (errorEl) {
        errorEl.classList.remove('show');
      }
    });
  });

  // Clear radio errors on change
  document.querySelectorAll('input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var groupName = this.name;
      var errorId = '';
      if (groupName === 'cinsiyet') errorId = 'error-cinsiyet';
      if (groupName === 'tecrube') errorId = 'error-tecrube';
      var errorEl = document.getElementById(errorId);
      if (errorEl) {
        errorEl.classList.remove('show');
      }
    });
  });

  // =============================================
  // FORM SUBMISSION
  // =============================================
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      var firstError = document.querySelector('.error-message.show');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Collect data
    var formData = {
      adsoyad: document.getElementById('adsoyad').value.trim(),
      eposta: document.getElementById('eposta').value.trim(),
      dogumtarihi: formatDateTR(document.getElementById('dogumtarihi').value),
      cinsiyet: document.querySelector('input[name="cinsiyet"]:checked').value,
      telefon: document.getElementById('telefon').value,
      adres: document.getElementById('adres').value.trim(),
      tecrube: document.querySelector('input[name="tecrube"]:checked').value,
      egitim_yoreleri: document.getElementById('egitim-yoreleri').value.trim()
    };

    // Disable button + show spinner
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    // Check if URL is configured
    if (GOOGLE_SCRIPT_URL === 'BURAYA_GOOGLE_APPS_SCRIPT_URL_GELECEK') {
      // Demo mode: simulate submission
      console.warn('Google Apps Script URL henüz ayarlanmamış. Demo modda çalışıyor.');
      console.log('Form Verisi:', formData);
      setTimeout(function () {
        showSuccess();
      }, 1500);
      return;
    }

    // Send to Google Apps Script
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(function () {
      // no-cors mode returns opaque response, so we assume success
      showSuccess();
    })
    .catch(function (error) {
      console.error('Gönderim hatası:', error);
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      alert('Bir hata oluştu. Lütfen tekrar deneyin veya +90 530 952 53 45 numarasını arayın.');
    });
  });

  // =============================================
  // SUCCESS SCREEN
  // =============================================
  function showSuccess() {
    formContent.style.display = 'none';
    successScreen.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =============================================
  // HELPERS
  // =============================================
  function formatDateTR(dateStr) {
    // Convert YYYY-MM-DD to DD.MM.YYYY
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[2] + '.' + parts[1] + '.' + parts[0];
  }

  // =============================================
  // INIT
  // =============================================
  document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
  });

})();
