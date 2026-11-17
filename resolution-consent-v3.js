(function () {
  'use strict';
  var VERSION = 'ufyt-resolution-submit-2026-11-16';
  var TEXT = 'By sending, you agree we may share your contact details and tax debt amount with an independent tax resolution firm that may call, text or email you about your enquiry. UFYT may receive a referral fee. Consent is not required to purchase.';
  function qualifies(value) {
    if (/^Over \$100k$/i.test(value || '')) return true;
    if (!/^\$[\d,]+\s*[-–]\s*\$[\d,]+$/.test(value || '')) return false;
    var amounts = value.split(/[-–]/).map(function (v) { return Number(v.replace(/[^\d]/g, '')); });
    return amounts[0] >= 10000 && amounts[1] > 10000 && amounts[1] >= amounts[0];
  }
  function mount(form, amount) {
    var previous = form.querySelector('[data-resolution-consent]');
    if (previous) previous.remove();
    var active = qualifies(amount);
    var phone = form.querySelector('[name="phone"]');
    if (phone) {
      if (!('resolutionWasRequired' in phone.dataset)) phone.dataset.resolutionWasRequired = String(phone.required);
      phone.required = active || phone.dataset.resolutionWasRequired === 'true';
      var optional = form.querySelector('label[for="' + phone.id + '"] .optional');
      if (optional) optional.hidden = active;
      var phoneLabel = form.querySelector('label[for="' + phone.id + '"]');
      if (phoneLabel && !optional) {
        if (!phoneLabel.dataset.originalText) phoneLabel.dataset.originalText = phoneLabel.textContent;
        phoneLabel.textContent = active ? phoneLabel.dataset.originalText.replace(/\s*\(optional\)/i, '') : phoneLabel.dataset.originalText;
      }
    }
    var enquiry = form.querySelector('[data-enquiry-consent]');
    if (enquiry) enquiry.hidden = active;
    // The SMS component no longer mounts; clear referral phone errors on edit.
    if (phone && !phone.dataset.referralValidationBound) {
      phone.addEventListener('input', function () { phone.setCustomValidity(''); });
      phone.dataset.referralValidationBound = 'true';
    }
    if (!active) return;
    var box = document.createElement('p');
    box.className = 'fine-print form-consent resolution-notice';
    box.dataset.resolutionConsent = '';
    box.appendChild(document.createTextNode(TEXT + ' See our '));
    var privacy = document.createElement('a');
    privacy.href = '/privacy'; privacy.textContent = 'Privacy Policy';
    box.append(privacy, document.createTextNode('.'));
    var button = form.querySelector('button[type="submit"]');
    button.parentNode.insertBefore(box, button);
  }
  // Called by the form submit handler only, after field validation succeeds.
  function capture(form) {
    if (!form.querySelector('[data-resolution-consent]')) return null;
    return { accepted: true, version: VERSION, text: TEXT, acceptance_method: 'form_submit', captured_at: new Date().toISOString(), page: location.origin + location.pathname };
  }
  function validate(form) {
    var notice = form.querySelector('[data-resolution-consent]');
    var phone = form.querySelector('[name="phone"]');
    if (notice && phone && !/^1?\d{10}$/.test(phone.value.replace(/\D/g, ''))) {
      phone.setCustomValidity('Enter a 10-digit US phone number so the firm can contact you.');
      phone.reportValidity(); phone.focus(); return false;
    }
    if (phone) phone.setCustomValidity('');
    return true;
  }
  window.UFYT_RESOLUTION = { mount: mount, capture: capture, validate: validate };
})();
