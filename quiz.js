// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Shared Unfuck Leads worker, same as /contact. Tagged brand: 'ufyt'.
  formEndpoint: 'https://unfuck-leads-worker.cameron-07f.workers.dev/submit',
  errorMessage: 'That did not send.'
};

const IRS_CONTACT_OPTION = 'I just need to contact the IRS';

// ============================================
// QUIZ QUESTIONS
// ============================================

const QUESTIONS = {
  tax_problem: {
    id: 'tax_problem',
    type: 'pills',
    title: 'What’s going on with your taxes?',
    options: [
      'I owe money to the IRS or state',
      'I have unfiled tax returns',
      'I received a notice from the IRS or am being audited',
      'I need help filing or organizing my taxes',
      "I'm not sure — I just know I'm f*cked"
    ]
  },
  contact: {
    id: 'contact',
    type: 'contact',
    title: 'Alright. Who are we helping?'
  },
  debt_amount: {
    id: 'debt_amount',
    type: 'pills',
    title: 'Approximately how much do you owe?',
    options: [
      '$0 - $10,000',
      '$10,001 - $20,000',
      '$20,001 - $30,000',
      '$30,001 - $40,000',
      '$40,001 - $50,000',
      '$50,000 - $75,000',
      '$75,000 - $100,000',
      '$100,001 - $199,999',
      '$200,000 - $300,000',
      '$300,000 - $400,000',
      '$400,000 - $500,000'
    ]
  },
  collection_actions: {
    id: 'collection_actions',
    type: 'multi',
    title: 'Have you received any of the following? (Select all that apply)',
    options: [
      'Wage garnishment or bank levy',
      'Tax lien',
      'IRS notice or letter',
      'None yet'
    ]
  },
  unfiled_years: {
    id: 'unfiled_years',
    type: 'pills',
    title: 'How many years are unfiled?',
    options: ['1 year', '2–3 years', '4–5 years', '6+ years']
  },
  self_employed: {
    id: 'self_employed',
    type: 'pills',
    title: 'Are you self-employed?',
    options: ['Yes', 'No']
  },
  notice_type: {
    id: 'notice_type',
    type: 'pills',
    title: 'What type of notice did you receive?',
    options: ['Balance due or collections', 'Audit notice', 'CP2000 or other', 'Not sure']
  },
  notice_deadline: {
    id: 'notice_deadline',
    type: 'date',
    title: 'What is the deadline listed on the notice?',
    optional: true
  },
  filing_status: {
    id: 'filing_status',
    type: 'pills',
    title: 'Are you filing as:',
    options: ['Individual', 'Married filing jointly', 'Self-employed', 'Business owner']
  },
  refund_expectation: {
    id: 'refund_expectation',
    type: 'pills',
    title: 'Do you expect to owe or receive a refund?',
    options: ['Owe', 'Refund', 'Not sure']
  },
  unsure_situation: {
    id: 'unsure_situation',
    type: 'pills',
    title: 'Which of these sounds closest to your situation?',
    options: [
      'I owe money',
      "I haven't filed or need help filing",
      'I got a notice or audit letter',
      'I just need to contact the IRS'
    ]
  }
};

const FLOWS = {
  'I owe money to the IRS or state': ['debt_amount', 'collection_actions'],
  'I have unfiled tax returns': ['unfiled_years', 'self_employed'],
  'I received a notice from the IRS or am being audited': ['notice_type', 'notice_deadline'],
  'I need help filing or organizing my taxes': ['filing_status', 'refund_expectation'],
  "I'm not sure — I just know I'm f*cked": ['unsure_situation']
};

// ============================================
// STATE & DOM ELEMENTS
// ============================================

let currentPath = [];
let stepIndex = 0;
let isAdvancing = false;
let isSubmitting = false;
let submissionEventId = '';
const data = {};

const quizProgressContainer = document.getElementById('quizProgress');
const quizContainer = document.getElementById('quizContainer');

// ============================================
// PATH BUILDING & NAVIGATION
// ============================================

function buildPath() {
  if (data.tax_problem === "I'm not sure — I just know I'm f*cked") {
    currentPath = ['tax_problem', 'unsure_situation', 'contact'];
    return currentPath;
  }

  currentPath = ['tax_problem', 'contact'];
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

function clearOldBranchAnswers() {
  Object.keys(data).forEach((key) => {
    if (key !== 'tax_problem' && key !== 'contact') delete data[key];
  });
}

// ============================================
// RENDERING
// ============================================

function render(moveFocus) {
  const step = getCurrentStep();
  if (!step) return;

  const longStep = step.type === 'contact' || (step.options && step.options.length > 6);
  document.body.classList.toggle('quiz-scroll-step', Boolean(longStep));
  document.body.classList.toggle('quiz-contact-step', step.type === 'contact');
  quizProgressContainer.innerHTML = '';
  quizContainer.innerHTML = '';
  quizContainer.dataset.stepType = step.type;

  renderProgress();

  const title = document.createElement('h2');
  title.id = 'quizQuestion';
  title.className = 'quiz-question-title';
  title.tabIndex = -1;
  title.textContent = step.title;
  quizContainer.appendChild(title);

  if (step.type === 'pills') renderPills(step, title);
  if (step.type === 'multi') renderMulti(step, title);
  if (step.type === 'contact') renderContactStep(title);
  if (step.type === 'date') renderDateStep(step, title);

  isAdvancing = false;
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (moveFocus) title.focus({ preventScroll: true });
}

function renderProgress() {
  const displayedTotal = data.tax_problem ? getTotalSteps() : 4;
  const progress = document.createElement('div');
  progress.className = 'quiz-progress';

  const progressTrack = document.createElement('div');
  progressTrack.className = 'quiz-progress-track';
  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute('aria-label', 'Assessment progress');
  progressTrack.setAttribute('aria-valuemin', '1');
  progressTrack.setAttribute('aria-valuemax', String(displayedTotal));
  progressTrack.setAttribute('aria-valuenow', String(stepIndex + 1));

  const progressValue = document.createElement('span');
  progressValue.style.width = (((stepIndex + 1) / displayedTotal) * 100) + '%';
  progressTrack.appendChild(progressValue);
  progress.appendChild(progressTrack);
  quizProgressContainer.appendChild(progress);

  const progressMeta = document.createElement('div');
  progressMeta.className = 'quiz-progress-meta';
  const progressText = document.createElement('span');
  progressText.textContent = stepIndex === 0 ? 'Question 1' : 'Question ' + (stepIndex + 1) + ' of ' + displayedTotal;
  progressMeta.appendChild(progressText);

  if (stepIndex > 0) {
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'quiz-back';
    backButton.textContent = '\u2190 Back';
    backButton.addEventListener('click', goBack);
    progressMeta.appendChild(backButton);
  }
  quizContainer.appendChild(progressMeta);
}

function renderPills(step, title) {
  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'quiz-options';
  optionsDiv.setAttribute('role', 'group');
  optionsDiv.setAttribute('aria-labelledby', title.id);

  step.options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz-option';
    if (option.length > 46) button.classList.add('quiz-option-long');
    button.textContent = option;
    button.addEventListener('click', () => advance(option));
    optionsDiv.appendChild(button);
  });
  quizContainer.appendChild(optionsDiv);
}

function renderMulti(step, title) {
  const selected = new Set(Array.isArray(data[step.id]) ? data[step.id] : []);
  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'quiz-options quiz-multi-options';
  optionsDiv.setAttribute('role', 'group');
  optionsDiv.setAttribute('aria-labelledby', title.id);

  const continueButton = makeContinueButton('Next');
  continueButton.disabled = selected.size === 0;

  step.options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz-option quiz-multi-option';
    if (option.length > 46) button.classList.add('quiz-option-long');
    button.textContent = option;
    button.setAttribute('aria-pressed', selected.has(option) ? 'true' : 'false');
    button.classList.toggle('is-selected', selected.has(option));
    button.addEventListener('click', () => {
      if (option === 'None yet') {
        selected.clear();
        selected.add(option);
      } else {
        selected.delete('None yet');
        if (selected.has(option)) selected.delete(option);
        else selected.add(option);
      }
      optionsDiv.querySelectorAll('.quiz-multi-option').forEach((optionButton) => {
        const active = selected.has(optionButton.textContent);
        optionButton.classList.toggle('is-selected', active);
        optionButton.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      continueButton.disabled = selected.size === 0;
    });
    optionsDiv.appendChild(button);
  });

  continueButton.addEventListener('click', () => advance(Array.from(selected)));
  quizContainer.appendChild(optionsDiv);
  quizContainer.appendChild(makeActionRow(continueButton));
}

function renderContactStep(title) {
  const existing = data.contact || {};
  const form = document.createElement('form');
  form.className = 'quiz-contact-form';
  form.noValidate = true;
  form.setAttribute('aria-labelledby', title.id);

  const firstName = makeField({ id: 'quizFirstName', name: 'first_name', label: 'First name', autocomplete: 'given-name', value: existing.first_name });
  const lastName = makeField({ id: 'quizLastName', name: 'last_name', label: 'Last name', autocomplete: 'family-name', value: existing.last_name });
  const email = makeField({ id: 'quizEmail', name: 'email', label: 'Email address', type: 'email', autocomplete: 'email', inputmode: 'email', value: existing.email });
  const phone = makeField({ id: 'quizPhone', name: 'phone', label: 'Phone number', type: 'tel', autocomplete: 'tel', inputmode: 'tel', value: existing.phone });

  const nameRow = document.createElement('div');
  nameRow.className = 'quiz-contact-name-row';
  nameRow.append(firstName.wrapper, lastName.wrapper);
  form.append(nameRow, email.wrapper, phone.wrapper);

  const honeypot = document.createElement('div');
  honeypot.className = 'hp-field';
  honeypot.setAttribute('aria-hidden', 'true');
  honeypot.innerHTML = '<label for="quizCompanyUrl">Company website</label><input type="text" id="quizCompanyUrl" name="company_url" tabindex="-1" autocomplete="off">';
  form.appendChild(honeypot);

  const continueButton = makeContinueButton('Next');
  const feedback = document.createElement('p');
  feedback.className = 'form-feedback quiz-step-feedback';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');

  const consent = document.createElement('p');
  consent.className = 'fine-print form-consent quiz-contact-consent';
  consent.innerHTML = 'By continuing, you agree that we may contact you about your enquiry. It does not create a client relationship. <strong>Do not send Social Security numbers, bank details, or tax documents here.</strong> See our <a href="/privacy">Privacy Policy</a>.';

  form.append(consent, feedback, continueButton);
  quizContainer.appendChild(form);

  const fields = [firstName, lastName, email, phone];
  fields.forEach(({ input, error }) => {
    input.addEventListener('blur', () => validateContactField(input, error));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateContactField(input, error);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let firstInvalid = null;
    fields.forEach(({ input, error }) => {
      if (!validateContactField(input, error) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      feedback.className = 'form-feedback error quiz-step-feedback';
      feedback.textContent = 'Check the highlighted fields and try again.';
      firstInvalid.focus();
      return;
    }

    data.contact = {
      first_name: firstName.input.value.trim(),
      last_name: lastName.input.value.trim(),
      email: email.input.value.trim(),
      phone: phone.input.value.trim(),
      company_url: form.elements.company_url.value.trim()
    };
    advance(data.contact);
  });
}

function renderDateStep(step, title) {
  const form = document.createElement('form');
  form.className = 'quiz-date-form';
  form.setAttribute('aria-labelledby', title.id);

  const field = document.createElement('div');
  field.className = 'quiz-field';
  const label = document.createElement('label');
  label.htmlFor = 'quizDeadline';
  label.innerHTML = 'Deadline <span class="optional">Optional</span>';
  const input = document.createElement('input');
  input.type = 'date';
  input.id = 'quizDeadline';
  input.name = 'notice_deadline';
  if (data[step.id] && data[step.id] !== 'Not provided') input.value = data[step.id];
  field.append(label, input);

  const continueButton = makeContinueButton('Submit my answers');
  form.append(field, continueButton);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    advance(input.value || 'Not provided');
  });
  quizContainer.appendChild(form);
}

function makeField({ id, name, label, type = 'text', autocomplete, inputmode, value = '' }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'quiz-field';
  const fieldLabel = document.createElement('label');
  fieldLabel.htmlFor = id;
  fieldLabel.textContent = label;
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.name = name;
  input.required = true;
  input.autocomplete = autocomplete;
  if (inputmode) input.inputMode = inputmode;
  input.value = value || '';
  const error = document.createElement('p');
  error.className = 'field-error';
  error.id = id + 'Error';
  input.setAttribute('aria-describedby', error.id);
  wrapper.append(fieldLabel, input, error);
  return { wrapper, input, error };
}

function validateContactField(field, error) {
  const value = field.value.trim();
  let message = '';
  if (!value) message = 'Please enter your ' + field.previousElementSibling.textContent.toLowerCase() + '.';
  else if (field.type === 'email' && field.validity.typeMismatch) message = 'Please enter a valid email address.';
  else if (field.type === 'tel' && value.replace(/\D/g, '').length < 7) message = 'Please enter a valid phone number.';
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  error.textContent = message;
  return !message;
}

function makeContinueButton(label) {
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button button-light quiz-step-continue';
  button.textContent = label;
  return button;
}

function makeActionRow(button) {
  const row = document.createElement('div');
  row.className = 'quiz-step-actions';
  row.appendChild(button);
  return row;
}

// ============================================
// NAVIGATION & SUBMISSION
// ============================================

function advance(value) {
  if (isAdvancing || isSubmitting) return;
  const step = getCurrentStep();
  if (!step) return;

  if (step.id === 'tax_problem' && data.tax_problem !== value) clearOldBranchAnswers();
  data[step.id] = value;

  if (step.id === 'unsure_situation' && value === IRS_CONTACT_OPTION) {
    delete data.contact;
    renderIrsContactExit();
    return;
  }

  isAdvancing = true;
  quizContainer.querySelectorAll('button, input, select').forEach((control) => { control.disabled = true; });

  const nextIndex = stepIndex + 1;
  const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 140;
  setTimeout(() => {
    if (nextIndex < getTotalSteps()) {
      stepIndex = nextIndex;
      render(true);
    } else {
      submitLead();
    }
  }, delay);
}

function renderIrsContactExit() {
  document.body.classList.remove('quiz-scroll-step');
  document.body.classList.remove('quiz-contact-step');
  quizProgressContainer.innerHTML = '';
  quizContainer.innerHTML = '';
  quizContainer.dataset.stepType = 'exit';

  const meta = document.createElement('p');
  meta.className = 'quiz-progress-meta quiz-submit-meta quiz-irs-meta';
  meta.textContent = 'Official IRS contact';

  const title = document.createElement('h2');
  title.className = 'quiz-question-title';
  title.tabIndex = -1;
  title.textContent = 'Just looking for the IRS?';

  const message = document.createElement('p');
  message.className = 'quiz-submit-message quiz-irs-message';
  message.textContent = 'Use the official IRS website or call their individual taxpayer line. You do not need to fill out anything else here.';

  const actions = document.createElement('div');
  actions.className = 'quiz-irs-actions';

  const website = document.createElement('a');
  website.className = 'button button-light';
  website.href = 'https://www.irs.gov/';
  website.target = '_blank';
  website.rel = 'noopener noreferrer';
  website.textContent = 'Visit IRS.gov';

  const phone = document.createElement('a');
  phone.className = 'text-link quiz-irs-phone';
  phone.href = 'tel:+18008291040';
  phone.textContent = 'Call 800-829-1040';
  phone.setAttribute('aria-label', 'Call the IRS at 800-829-1040');

  actions.append(website, phone);
  quizContainer.append(meta, title, message, actions);
  title.focus({ preventScroll: true });
}

function goBack() {
  if (isAdvancing || isSubmitting || stepIndex === 0) return;
  stepIndex--;
  render(true);
}

async function submitLead() {
  if (isSubmitting) return;
  isSubmitting = true;
  document.body.classList.remove('quiz-scroll-step');
  document.body.classList.remove('quiz-contact-step');
  renderSubmittingState();

  const contact = data.contact || {};
  if (contact.company_url) {
    window.location.href = '/thank-you';
    return;
  }

  const answerKeys = buildPath().filter((key) => key !== 'contact');
  const answerSummary = answerKeys.map((key) => QUESTIONS[key].title + ' ' + formatAnswer(data[key]));
  const situationSummary = ['Phone: ' + (contact.phone || ''), ...answerSummary].join('\n');
  const trackingData = captureUrlParameters();
  submissionEventId = submissionEventId || ('ufyt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11));

  const payload = Object.assign({
    brand: 'ufyt',
    source: 'unfuckyourtaxes',
    surface: 'quiz',
    name: ((contact.first_name || '') + ' ' + (contact.last_name || '')).trim(),
    first_name: contact.first_name || '',
    last_name: contact.last_name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    details: null,
    company_url: '',
    // Compatibility fields for the currently deployed shared lead worker.
    problem: situationSummary,
    situation: situationSummary,
    selected_issues: answerSummary.join(' | '),
    issues_count: answerSummary.length,
    event_id: submissionEventId,
    submitted_at: new Date().toISOString()
  }, flattenAnswers(), trackingData);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) {
      const error = new Error('Server returned an error');
      error.status = response.status;
      throw error;
    }

    // Quiz answers are tax-status information. They go to the lead worker,
    // never to an analytics or advertising platform.
    if (typeof fbq !== 'undefined') fbq('track', 'Lead', { content_name: 'Quiz' }, { eventID: submissionEventId });
    if (typeof gtag !== 'undefined') gtag('event', 'generate_lead', { event_id: submissionEventId, form_location: 'quiz' });
    if (window.zaraz && typeof window.zaraz.track === 'function') {
      window.zaraz.track('generate_lead', { event_id: submissionEventId, form_location: 'quiz' });
    }
    window.location.href = '/thank-you';
  } catch (error) {
    console.error('Form submission error:', error);
    isSubmitting = false;
    const message = error.status === 429
      ? 'Too many attempts from this connection. Please wait a while or email us.'
      : CONFIG.errorMessage + ' Try again or email us instead.';
    renderSubmissionError(message);
  } finally {
    clearTimeout(timeout);
  }
}

function renderSubmittingState() {
  const progressValue = quizProgressContainer.querySelector('.quiz-progress-track span');
  if (progressValue) progressValue.style.width = '100%';
  quizContainer.innerHTML = '';
  const meta = document.createElement('p');
  meta.className = 'quiz-progress-meta quiz-submit-meta';
  meta.textContent = 'All questions answered';
  const title = document.createElement('h2');
  title.className = 'quiz-question-title';
  title.textContent = 'Sending your answers…';
  const message = document.createElement('p');
  message.className = 'quiz-submit-message';
  message.textContent = 'Hang tight. This should only take a moment.';
  quizContainer.append(meta, title, message);
}

function renderSubmissionError(message) {
  quizContainer.innerHTML = '';
  const meta = document.createElement('p');
  meta.className = 'quiz-progress-meta quiz-submit-meta';
  meta.textContent = 'Almost done';
  const title = document.createElement('h2');
  title.className = 'quiz-question-title';
  title.textContent = 'That did not send.';
  const feedback = document.createElement('p');
  feedback.className = 'form-feedback error quiz-submit-error';
  feedback.appendChild(document.createTextNode(message + ' '));
  const email = document.createElement('a');
  email.href = 'mailto:hello@unfuckyourtaxes.com?subject=I%20need%20help%20with%20my%20taxes';
  email.textContent = 'hello@unfuckyourtaxes.com';
  feedback.appendChild(email);
  const retry = makeContinueButton('Try again');
  retry.addEventListener('click', submitLead);
  quizContainer.append(meta, title, feedback, makeActionRow(retry));
}

function formatAnswer(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value == null ? '' : String(value);
}

function flattenAnswers() {
  const answers = {};
  buildPath().forEach((key) => {
    if (key !== 'contact') answers[key] = formatAnswer(data[key]);
  });
  return answers;
}

// ============================================
// UTM TRACKING & INITIALIZATION
// ============================================

function captureUrlParameters() {
  let trackingData = {};
  try {
    trackingData = JSON.parse(sessionStorage.getItem('ufyt_tracking') || '{}');
  } catch (error) {
    trackingData = {};
  }
  const params = new URLSearchParams(window.location.search);
  ['fbclid', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    const value = params.get(key);
    if (value) trackingData[key] = value;
  });
  const promoCode = params.get('promo') || params.get('code');
  if (promoCode) trackingData.promo_code = promoCode;
  if (!trackingData.referrer) trackingData.referrer = document.referrer || null;
  if (!trackingData.landing_page) trackingData.landing_page = window.location.href;
  trackingData.fbp = readCookie('_fbp') || trackingData.fbp || null;
  trackingData.fbc = readCookie('_fbc') || trackingData.fbc || makeFbc(trackingData.fbclid);
  sessionStorage.setItem('ufyt_tracking', JSON.stringify(trackingData));
  sessionStorage.setItem('tracking_data', JSON.stringify(trackingData));
  return trackingData;
}

function readCookie(name) {
  const prefix = name + '=';
  const value = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : null;
}

function makeFbc(fbclid) {
  return fbclid ? 'fb.1.' + Date.now() + '.' + fbclid : null;
}

document.addEventListener('DOMContentLoaded', () => {
  captureUrlParameters();
  render();
});
