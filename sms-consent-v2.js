/* Optional marketing SMS consent. Keep this version immutable as consent evidence. */
(function () {
  'use strict';
  var VERSION = '2026-11-09-v2';
  var MARKETING = 'Send me automated marketing texts from Unfuck Your Taxes.';
  var DISCLOSURE = 'Optional; not required to buy. Message frequency varies. Message and data rates may apply. Reply STOP to opt out; HELP for help.';

  function mount(container, existing) {
    existing = existing || {};
    var fieldset = document.createElement('div');
    fieldset.className = 'sms-consent';
    var label = document.createElement('label');
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'sms_marketing';
    input.value = 'yes';
    input.checked = existing.marketing === true;
    var text = document.createElement('span');
    text.textContent = MARKETING;
    label.append(input, text);
    fieldset.appendChild(label);
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
    var selected = form.elements.sms_marketing.checked;
    var message = selected && phone.value.replace(/\D/g, '').length < 10
      ? 'Enter a valid phone number to receive texts, or leave the text option unchecked.' : '';
    phone.setCustomValidity(message);
    return message;
  }

  function capture(form) {
    return {
      version: VERSION,
      scope: 'marketing',
      service_updates: false,
      marketing: form.elements.sms_marketing.checked,
      recorded_at: new Date().toISOString(),
      source_url: window.location.origin + window.location.pathname,
      marketing_text: MARKETING,
      disclosure: DISCLOSURE,
      terms_url: new URL('/terms#text-messages', window.location.origin).href,
      privacy_url: new URL('/privacy#text-messages', window.location.origin).href
    };
  }
  window.UFYT_SMS_CONSENT = { mount: mount, validate: validate, capture: capture };
})();
