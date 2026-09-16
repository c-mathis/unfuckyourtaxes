/* Unfuck Your Taxes — lead form.
 *
 * Posts to the shared Unfuck Leads worker, the same endpoint unfuckyourweb.com
 * uses, with brand: 'ufyt' so the two do not blend in the dashboard.
 *
 * Deliberately absent: any scoring, ranking, or verdict about the person
 * filling this in. The form captures and routes. It never tells anyone what
 * they qualify for, what they will save, or what the IRS will accept.
 */
(function () {
  'use strict';

  var CONFIG = {
    endpoint: 'https://unfuck-leads-worker.cameron-07f.workers.dev/submit',
    brand: 'ufyt',
    source: 'unfuckyourtaxes',
    thankYou: '/thank-you',
    fallbackEmail: 'hello@unfuckyourtaxes.com',
    successMessage: "Got it. We'll come back to you within one business day.",
    errorMessage: 'That did not send. Email us at ' + 'hello@unfuckyourtaxes.com' + ' and we will pick it up from there.'
  };

  // Problem types where "how much is owed" is a sensible question. For the
  // rest it is noise that costs completions on a cold click.
  var DEBT_PROBLEMS = [
    'I owe the IRS, or I got a notice',
    'Payroll or employment taxes'
  ];

  function captureTracking() {
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem('ufyt_tracking') || '{}'); } catch (e) {}
    var params = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].forEach(function (key) {
      var value = params.get(key);
      if (value) stored[key] = value;              // first touch wins; never overwrite with empty
    });
    if (!stored.landing_page) stored.landing_page = window.location.href;
    if (!stored.referrer) stored.referrer = document.referrer || null;
    stored.fbp = readCookie('_fbp') || stored.fbp || null;
    stored.fbc = readCookie('_fbc') || stored.fbc || (stored.fbclid ? 'fb.1.' + Date.now() + '.' + stored.fbclid : null);
    try { sessionStorage.setItem('ufyt_tracking', JSON.stringify(stored)); } catch (e) {}
    return stored;
  }

  function readCookie(name) {
    var prefix = name + '=';
    var found = document.cookie.split(';').map(function (part) { return part.trim(); }).filter(function (part) {
      return part.indexOf(prefix) === 0;
    })[0];
    return found ? decodeURIComponent(found.slice(prefix.length)) : null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var tracking = captureTracking();

    var form = document.getElementById('leadForm');
    if (!form) return;

    var button = form.querySelector('.quiz-submit');
    var buttonText = button.querySelector('.button-text');
    var buttonLoader = button.querySelector('.button-loader');
    var feedback = form.querySelector('.form-feedback');
    var problem = form.querySelector('#lf-problem');
    var amountField = form.querySelector('#lf-amount-field');

    function showFeedback(kind, message) {
      feedback.className = 'form-feedback ' + kind;
      feedback.textContent = message;
    }

    function setBusy(busy) {
      button.disabled = busy;
      buttonText.style.display = busy ? 'none' : '';
      buttonLoader.style.display = busy ? 'inline' : '';
    }

    // Show the amount question only where it is relevant.
    problem.addEventListener('change', function () {
      amountField.hidden = DEBT_PROBLEMS.indexOf(problem.value) === -1;
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      feedback.className = 'form-feedback';

      if (form.querySelector('#lf-company').value) return;   // honeypot: silently drop

      var missing = null;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (field) {
        if (!missing && !field.value.trim()) missing = field;
      });
      if (missing) {
        showFeedback('error', 'A few fields still need filling in.');
        missing.focus();
        return;
      }

      if (!form.checkValidity()) {
        showFeedback('error', 'Check the highlighted field and try again.');
        form.reportValidity();
        return;
      }

      setBusy(true);

      var data = new FormData(form);
      var eventId = 'ufyt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
      var situationSummary = [
        'Phone: ' + data.get('phone').trim(),
        'What is going on? ' + data.get('problem'),
        'Is anything urgent? ' + data.get('urgency'),
        data.get('amount_owed') ? 'Amount owed: ' + data.get('amount_owed') : null,
        data.get('details') ? 'Additional details: ' + data.get('details').trim() : null
      ].filter(Boolean).join('\n');
      var payload = {
        brand: CONFIG.brand,
        source: CONFIG.source,
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone'),
        problem: situationSummary,
        situation: situationSummary,
        urgency: data.get('urgency'),
        amount_owed: data.get('amount_owed') || null,
        details: data.get('details') || null,
        company_url: data.get('company_url') || '',
        selected_issues: [data.get('problem'), data.get('urgency')].filter(Boolean).join(' | '),
        issues_count: 2,
        event_id: eventId,
        utm_source: tracking.utm_source || null,
        utm_medium: tracking.utm_medium || null,
        utm_campaign: tracking.utm_campaign || null,
        utm_content: tracking.utm_content || null,
        utm_term: tracking.utm_term || null,
        fbclid: tracking.fbclid || null,
        fbp: tracking.fbp || null,
        fbc: tracking.fbc || null,
        gclid: tracking.gclid || null,
        referrer: tracking.referrer || null,
        landing_page: tracking.landing_page || window.location.href,
        submitted_at: new Date().toISOString()
      };

      var controller = new AbortController();
      var timeout = window.setTimeout(function () { controller.abort(); }, 12000);

      fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);

        showFeedback('success', CONFIG.successMessage);
        form.reset();
        amountField.hidden = true;

        try { sessionStorage.setItem('ufyt_lead_event_id', eventId); } catch (e) {}
        // Privacy floor: the problem type, urgency and balance band are the
        // reader's tax status. They go to the leads worker, never to an
        // analytics or ads platform. Only an ID and a surface name leave here.
        if (typeof fbq !== 'undefined') {
          fbq('track', 'Lead', { content_name: 'Contact form' }, { eventID: eventId });
        }
        if (typeof gtag !== 'undefined') {
          gtag('event', 'generate_lead', { event_id: eventId, form_location: 'contact' });
        }
        if (window.zaraz && typeof window.zaraz.track === 'function') {
          window.zaraz.track('generate_lead', { event_id: eventId, form_location: 'contact' });
        }

        window.setTimeout(function () { window.location.href = CONFIG.thankYou; }, 900);
      }).catch(function () {
        // Never lose the lead to a failed POST — hand them the mailto.
        setBusy(false);
        showFeedback('error', CONFIG.errorMessage);
      }).finally(function () {
        window.clearTimeout(timeout);
      });
    });
  });
})();
