/* Shared, optional SMS choices. Keep this version immutable as consent evidence. */
(function () {
  'use strict';
  var VERSION = '2026-11-09-v1';
  var SERVICE = 'I agree to texts from Unfuck Your Taxes about customer care, appointments, account/service updates and document delivery.';
  var MARKETING = 'I agree to automated marketing texts and offers from Unfuck Your Taxes.';
  var DISCLOSURE = 'Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is optional and not a condition of purchase.';

  function mount(container, existing) {
    existing = existing || {};
    var fieldset = document.createElement('fieldset');
    fieldset.className = 'sms-consent';
    var legend = document.createElement('legend');
    legend.textContent = 'Text messages (optional)';
    fieldset.appendChild(legend);
    [['sms_service_updates', SERVICE, existing.service_updates], ['sms_marketing', MARKETING, existing.marketing]].forEach(function (choice) {
      var label = document.createElement('label');
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.name = choice[0];
      input.value = 'yes';
      input.checked = choice[2] === true;
      var text = document.createElement('span');
      text.textContent = choice[1];
      label.append(input, text);
      fieldset.appendChild(label);
    });
    var disclosure = document.createElement('p');
    disclosure.className = 'sms-disclosure';
    disclosure.appendChild(document.createTextNode(DISCLOSURE + ' '));
    [['/terms#text-messages', 'Terms of Service'], ['/privacy#text-messages', 'Privacy Policy']].forEach(function (link, index) {
      if (index) disclosure.appendChild(document.createTextNode(' · '));
      var a = document.createElement('a');
      a.href = link[0];
      a.textContent = link[1];
      disclosure.appendChild(a);
    });
    fieldset.appendChild(disclosure);
    container.appendChild(fieldset);
    var form = container.closest('form');
    form.addEventListener('input', function () { form.elements.phone.setCustomValidity(''); });
  }

  function validate(form) {
    var phone = form.elements.phone;
    var selected = form.elements.sms_service_updates.checked || form.elements.sms_marketing.checked;
    var message = selected && phone.value.replace(/\D/g, '').length < 10
      ? 'Enter a valid phone number to receive texts, or leave both text options unchecked.' : '';
    phone.setCustomValidity(message);
    return message;
  }

  function capture(form) {
    return {
      version: VERSION,
      service_updates: form.elements.sms_service_updates.checked,
      marketing: form.elements.sms_marketing.checked,
      recorded_at: new Date().toISOString(),
      source_url: window.location.origin + window.location.pathname,
      service_updates_text: SERVICE,
      marketing_text: MARKETING,
      disclosure: DISCLOSURE,
      terms_url: new URL('/terms#text-messages', window.location.origin).href,
      privacy_url: new URL('/privacy#text-messages', window.location.origin).href
    };
  }
  window.UFYT_SMS_CONSENT = { mount: mount, validate: validate, capture: capture };
})();
