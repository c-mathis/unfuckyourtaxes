// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Shared Unfuck Leads worker, same as /contact. Tagged brand: 'ufyt'.
  formEndpoint: 'https://unfuck-leads-worker.cameron-07f.workers.dev/submit',
  successMessage: "Got it. We'll get back to you within 24 hours.",
  errorMessage: 'Something went wrong. Try emailing us directly instead.'
};

// ============================================
// QUIZ QUESTIONS
// ============================================

const QUESTIONS = {
  tax_problem: {
    id: 'tax_problem',
    type: 'pills',
    title: "What's going on?",
    options: [
      'I owe money to the IRS',
      "Haven't filed in years",
      'Got a scary letter from the IRS',
      'Not sure, but something feels wrong'
    ]
  },
  debt_amount: {
    id: 'debt_amount',
    type: 'select',
    title: 'How deep in the hole are you?',
    options: ['Under $10k', '$10k - $25k', '$25k - $50k', '$50k - $100k', 'Over $100k', 'No idea']
  },
  collection_action: {
    id: 'collection_action',
    type: 'pills',
    title: 'Has the IRS done any of this yet?',
    options: ['Garnishing my wages', 'Froze my bank account', 'Filed a lien', 'Just sending threats', 'Nothing yet']
  },
  unfiled_years: {
    id: 'unfiled_years',
    type: 'pills',
    title: 'How many years behind are you?',
    options: ['1-2 years', '3-5 years', '6+ years', 'Honestly no idea']
  },
  notice_type: {
    id: 'notice_type',
    type: 'pills',
    title: 'What kind of letter was it?',
    options: ['They say I owe money', 'Audit or review notice', 'Missing information request', 'No idea what it means']
  },
  notice_responded: {
    id: 'notice_responded',
    type: 'pills',
    title: 'Have you responded to them yet?',
    options: ["No, haven't responded", 'Tried but got confused', 'Yes, but still have issues', 'Ignored it']
  },
  unsure_situation: {
    id: 'unsure_situation',
    type: 'pills',
    title: "What's making you nervous?",
    options: ["Haven't filed in a while", 'Not sure if I owe anything', 'Got paid in cash, no records', 'Just have a bad feeling']
  },
  unsure_filed_recently: {
    id: 'unsure_filed_recently',
    type: 'pills',
    title: 'Did you file last year?',
    options: ['Yes', 'No', "Can't remember"]
  }
};

// Conditional flow based on the first answer
const FLOWS = {
  'I owe money to the IRS': ['debt_amount', 'collection_action'],
  "Haven't filed in years": ['unfiled_years'],
  'Got a scary letter from the IRS': ['notice_type', 'notice_responded'],
  'Not sure, but something feels wrong': ['unsure_situation', 'unsure_filed_recently']
};

// ============================================
// STATE & DOM ELEMENTS
// ============================================

let currentPath = [];
let stepIndex = 0;
const data = {};

const quizContainer = document.getElementById('quizContainer');
const resultContainer = document.getElementById('resultContainer');
const resultVerdict = document.getElementById('resultVerdict');
const resultMessage = document.getElementById('resultMessage');

// ============================================
// PATH BUILDING & NAVIGATION
// ============================================

function buildPath() {
  currentPath = ['tax_problem'];
  if (data.tax_problem && FLOWS[data.tax_problem]) currentPath = currentPath.concat(FLOWS[data.tax_problem]);
  return currentPath;
}

function getCurrentStep() {
  buildPath();
  return QUESTIONS[currentPath[stepIndex]];
}

function getTotalSteps() {
  buildPath();
  return currentPath.length;
}

// ============================================
// RENDERING
// ============================================

function render() {
  const step = getCurrentStep();
  if (!step) { showResults(); return; }

  quizContainer.innerHTML = '';

  const title = document.createElement('h2');
  title.className = 'quiz-question-title';
  title.textContent = step.title;
  quizContainer.appendChild(title);

  if (step.type === 'pills') {
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';
    step.options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.textContent = option;
      button.addEventListener('click', () => advance(option));
      optionsDiv.appendChild(button);
    });
    quizContainer.appendChild(optionsDiv);
  } else if (step.type === 'select') {
    const wrap = document.createElement('div');
    wrap.className = 'quiz-select-wrap';
    const select = document.createElement('select');
    select.className = 'quiz-select';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = 'Select an option';
    select.appendChild(placeholder);

    step.options.forEach((option) => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => { if (select.value) advance(select.value); });
    wrap.appendChild(select);
    quizContainer.appendChild(wrap);
  }
}

function advance(value) {
  const step = getCurrentStep();
  data[step.id] = value;
  stepIndex++;
  setTimeout(() => {
    if (stepIndex < getTotalSteps()) render();
    else showResults();
  }, 300);
}

// ============================================
// RESULTS & VERDICT
// ============================================

function calculateFuckedScore() {
  let score = 0;
  const problem = data.tax_problem || '';
  if (problem.includes('owe money')) score += 3;
  if (problem.includes("filed in years")) score += 2;
  if (problem.includes('scary letter')) score += 2;

  const debt = data.debt_amount || '';
  if (debt.includes('Under $10k')) score += 1;
  if (debt.includes('$10k - $25k')) score += 2;
  if (debt.includes('$25k - $50k')) score += 3;
  if (debt.includes('$50k - $100k')) score += 4;
  if (debt.includes('Over $100k')) score += 5;

  const action = data.collection_action || '';
  if (action.includes('Garnishing')) score += 5;
  if (action.includes('Froze')) score += 5;
  if (action.includes('lien')) score += 4;
  if (action.includes('threats')) score += 2;

  const years = data.unfiled_years || '';
  if (years.includes('1-2')) score += 2;
  if (years.includes('3-5')) score += 3;
  if (years.includes('6+')) score += 5;
  if (years.includes('no idea')) score += 3;

  const notice = data.notice_type || '';
  if (notice.includes('owe money')) score += 3;
  if (notice.includes('Audit')) score += 4;
  if (notice.includes('No idea')) score += 2;

  const responded = data.notice_responded || '';
  if (responded.includes('Ignored')) score += 3;
  if (responded.includes("haven't responded")) score += 2;

  const unsure = data.unsure_situation || '';
  if (unsure.includes("Haven't filed")) score += 3;
  if (unsure.includes('paid in cash')) score += 4;
  if (unsure.includes('Not sure if I owe')) score += 2;

  const filed = data.unsure_filed_recently || '';
  if (filed.includes('No')) score += 2;
  if (filed.includes("Can't remember")) score += 3;

  return score;
}

function showResults() {
  const score = calculateFuckedScore();
  resultContainer.dataset.score = score;

  resultVerdict.innerHTML = 'That’s f<span class="censor">*</span>cked.';
  resultMessage.textContent = 'Believe it or not, we can help.';

  resultContainer.classList.add('is-fullscreen');
  requestAnimationFrame(() => requestAnimationFrame(() => resultContainer.classList.add('is-visible')));

  setupFormSubmission();
}

// ============================================
// FORM HANDLING
// ============================================

function setupFormSubmission() {
  const form = document.getElementById('contactForm');
  const submitButton = form.querySelector('.quiz-submit');
  const buttonText = submitButton.querySelector('.button-text');
  const buttonLoader = submitButton.querySelector('.button-loader');
  const feedback = form.querySelector('.form-feedback');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    buttonText.style.display = 'none';
    buttonLoader.style.display = 'inline';
    feedback.className = 'form-feedback';

    const formData = new FormData(form);
    const trackingData = captureUrlParameters();
    const eventId = 'ufyt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);

    const payload = Object.assign({
      brand: 'ufyt',
      source: 'unfuckyourtaxes',
      surface: 'quiz',
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      details: formData.get('details') || null,
      // Internal triage signal only. It is never shown to the person who
      // filled this in and must never become a message about them — no
      // qualification, no predicted outcome, no savings figure.
      internal_triage_score: Number(resultContainer.dataset.score || 0),
      event_id: eventId,
      submitted_at: new Date().toISOString()
    }, data, trackingData);

    try {
      const response = await fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Server returned an error');
      showFeedback('success', CONFIG.successMessage);
      form.reset();

      // Quiz answers are the reader's tax status. They go to the leads
      // worker, never to an analytics or ads platform.
      if (typeof fbq !== 'undefined') fbq('track', 'Lead', { content_name: 'Quiz' }, { eventID: eventId });
      if (typeof gtag !== 'undefined') gtag('event', 'generate_lead', { event_id: eventId, form_location: 'quiz' });

      setTimeout(() => { window.location.href = '/thank-you'; }, 900);
    } catch (error) {
      console.error('Form submission error:', error);
      showFeedback('error', CONFIG.errorMessage);
      submitButton.disabled = false;
      buttonText.style.display = 'inline';
      buttonLoader.style.display = 'none';
    }
  });

  function showFeedback(type, message) {
    feedback.className = 'form-feedback ' + type;
    feedback.textContent = message;
    if (type === 'success') setTimeout(() => { feedback.className = 'form-feedback'; }, 5000);
  }
}

// ============================================
// UTM TRACKING
// ============================================

function captureUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  const trackingData = {
    fbclid: params.get('fbclid'),
    gclid: params.get('gclid'),
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    promo_code: params.get('promo') || params.get('code'),
    referrer: document.referrer,
    landing_page: window.location.href
  };
  sessionStorage.setItem('tracking_data', JSON.stringify(trackingData));
  return trackingData;
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  captureUrlParameters();
  render();
});
