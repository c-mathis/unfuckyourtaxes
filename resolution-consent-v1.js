(function () {
  'use strict';
  var VERSION = 'ufyt-resolution-2026-11-16';
  var TEXT = 'I agree to have my contact details and tax debt amount shared with an independent tax resolution firm, which may call, text, or email me about my request. UFYT may receive compensation for this referral. Consent is not a condition of purchase.';
  function qualifies(value) {
    if (/^Over \$100k$/i.test(value || '')) return true;
    if (!/^\$[\d,]+\s*[-–]\s*\$[\d,]+$/.test(value || '')) return false;
    var amounts = value.split(/[-–]/).map(function (v) { return Number(v.replace(/[^\d]/g, '')); });
    return amounts[0] >= 10000 && amounts[1] > 10000 && amounts[1] >= amounts[0];
  }
  function mount(form, amount, existing) {
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
    var sms = form.querySelector('.sms-consent');
    var disclosure = form.querySelector('[data-sms-disclosure]');
    if (sms) sms.hidden = active;
    var smsInput = form.querySelector('[name="sms_updates"]');
    if (smsInput) { smsInput.disabled = active; if (active) smsInput.checked = false; }
    if (disclosure) disclosure.hidden = active;
    if (!active) return;
    var box = document.createElement('div');
    box.className = 'sms-consent'; box.dataset.resolutionConsent = '';
    var label = document.createElement('label');
    var input = document.createElement('input');
    input.type = 'checkbox'; input.name = 'resolution_referral'; input.required = true;
    input.checked = existing && existing.accepted === true;
    var text = document.createElement('span'); text.textContent = TEXT;
    label.append(input, text); box.appendChild(label);
    var button = form.querySelector('button[type="submit"]');
    button.parentNode.insertBefore(box, button);
  }
  function capture(form) {
    var input = form.querySelector('[name="resolution_referral"]');
    if (!input) return null;
    return { accepted: input.checked, version: VERSION, text: TEXT, captured_at: new Date().toISOString(), page: location.origin + location.pathname };
  }
  function validate(form) {
    var input = form.querySelector('[name="resolution_referral"]');
    if (input && !input.checked) { input.reportValidity(); input.focus(); return false; }
    var phone = form.querySelector('[name="phone"]');
    if (input && phone && !/^1?\d{10}$/.test(phone.value.replace(/\D/g, ''))) {
      phone.setCustomValidity('Enter a 10-digit US phone number so the firm can contact you.');
      phone.reportValidity(); phone.focus(); return false;
    }
    if (phone) phone.setCustomValidity('');
    return true;
  }
  window.UFYT_RESOLUTION = { mount: mount, capture: capture, validate: validate };
})();
