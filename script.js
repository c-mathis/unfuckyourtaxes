// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // EDIT THIS: Replace with your form submission endpoint
    formEndpoint: 'https://formsubmit.co/your@email.com', // CHANGE THIS
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
        title: 'What\'s going on?',
        options: [
            'I owe money to the IRS',
            'Haven\'t filed in years',
            'Got a scary letter from the IRS',
            'Not sure, but something feels wrong'
        ],
        required: true
    },

    debt_amount: {
        id: 'debt_amount',
        type: 'select',
        title: 'How deep in the hole are you?',
        options: [
            'Under $10k',
            '$10k - $25k',
            '$25k - $50k',
            '$50k - $100k',
            'Over $100k',
            'No idea'
        ],
        required: true
    },

    collection_action: {
        id: 'collection_action',
        type: 'pills',
        title: 'Has the IRS done any of this yet?',
        options: [
            'Garnishing my wages',
            'Froze my bank account',
            'Filed a lien',
            'Just sending threats',
            'Nothing yet'
        ],
        required: true
    },

    unfiled_years: {
        id: 'unfiled_years',
        type: 'pills',
        title: 'How many years behind are you?',
        options: [
            '1-2 years',
            '3-5 years',
            '6+ years',
            'Honestly no idea'
        ],
        required: true
    },

    notice_type: {
        id: 'notice_type',
        type: 'pills',
        title: 'What kind of letter was it?',
        options: [
            'They say I owe money',
            'Audit or review notice',
            'Missing information request',
            'No idea what it means'
        ],
        required: true
    },

    notice_responded: {
        id: 'notice_responded',
        type: 'pills',
        title: 'Have you responded to them yet?',
        options: [
            'No, haven\'t responded',
            'Tried but got confused',
            'Yes, but still have issues',
            'Ignored it'
        ],
        required: true
    },

    unsure_situation: {
        id: 'unsure_situation',
        type: 'pills',
        title: 'What\'s making you nervous?',
        options: [
            'Haven\'t filed in a while',
            'Not sure if I owe anything',
            'Got paid in cash, no records',
            'Just have a bad feeling'
        ],
        required: true
    },

    unsure_filed_recently: {
        id: 'unsure_filed_recently',
        type: 'pills',
        title: 'Did you file last year?',
        options: [
            'Yes',
            'No',
            'Can\'t remember'
        ],
        required: true
    }
};

// Conditional flow based on first answer
const FLOWS = {
    'I owe money to the IRS': ['debt_amount', 'collection_action'],
    'Haven\'t filed in years': ['unfiled_years'],
    'Got a scary letter from the IRS': ['notice_type', 'notice_responded'],
    'Not sure, but something feels wrong': ['unsure_situation', 'unsure_filed_recently']
};

// ============================================
// STATE & DOM ELEMENTS
// ============================================

let currentPath = [];
let stepIndex = 0;
const data = {};

const progressFill = document.getElementById('progressFill');
const currentStepEl = document.getElementById('currentStep');
const totalStepsEl = document.getElementById('totalSteps');
const quizContainer = document.getElementById('quizContainer');
const resultContainer = document.getElementById('resultContainer');
const resultVerdict = document.getElementById('resultVerdict');
const resultMessage = document.getElementById('resultMessage');

// ============================================
// PATH BUILDING & NAVIGATION
// ============================================

function buildPath() {
    currentPath = ['tax_problem'];

    // Add conditional questions based on tax_problem answer
    if (data.tax_problem && FLOWS[data.tax_problem]) {
        currentPath = currentPath.concat(FLOWS[data.tax_problem]);
    }

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

function updateProgress() {
    const total = getTotalSteps();
    const current = stepIndex + 1;

    // Only update if elements exist
    if (currentStepEl) currentStepEl.textContent = current;
    if (totalStepsEl) totalStepsEl.textContent = total;

    if (progressFill) {
        const percent = (current / total) * 100;
        progressFill.style.width = percent + '%';
    }
}

// ============================================
// RENDERING
// ============================================

function render() {
    const step = getCurrentStep();
    if (!step) {
        showResults();
        return;
    }

    updateProgress();

    // Clear previous content
    quizContainer.innerHTML = '';

    // Create question container
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-card';
    questionDiv.style.cssText = 'max-width: 600px; margin: 0 auto;';

    // Question title
    const title = document.createElement('h2');
    title.textContent = step.title;
    title.style.cssText = 'font-size: clamp(1.5rem, 4vw, 2rem); margin-bottom: 2rem; font-weight: 500;';
    questionDiv.appendChild(title);

    // Create input based on type
    if (step.type === 'pills') {
        const optionsDiv = document.createElement('div');
        optionsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 0;';

        step.options.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = option;
            button.style.cssText = `
                background: transparent;
                color: white;
                border: none;
                border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                padding: 1rem 0;
                font-size: 1rem;
                cursor: pointer;
                text-align: left;
                transition: all 0.2s ease;
                font-family: 'DM Sans', sans-serif;
            `;

            button.addEventListener('mouseenter', () => {
                button.style.borderBottomColor = 'rgba(255, 255, 255, 1)';
                button.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.borderBottomColor = 'rgba(255, 255, 255, 0.3)';
                button.style.backgroundColor = 'transparent';
            });

            button.addEventListener('click', () => {
                advance(option);
            });

            optionsDiv.appendChild(button);
        });

        questionDiv.appendChild(optionsDiv);
    } else if (step.type === 'select') {
        const select = document.createElement('select');
        select.style.cssText = `
            width: 100%;
            background-color: transparent;
            border: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 0;
            font-size: 1rem;
            font-family: 'Lora', serif;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1.25rem;
            padding-right: 3rem;
        `;

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = 'Select an option';
        select.appendChild(placeholder);

        step.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            opt.style.cssText = 'background-color: #000000; color: white;';
            select.appendChild(opt);
        });

        select.addEventListener('change', () => {
            if (select.value) {
                advance(select.value);
            }
        });

        questionDiv.appendChild(select);
    }

    quizContainer.appendChild(questionDiv);
}

function advance(value) {
    const step = getCurrentStep();

    // Store the answer
    data[step.id] = value;

    // Move to next step
    stepIndex++;

    // Add a small delay for better UX
    setTimeout(() => {
        if (stepIndex < getTotalSteps()) {
            render();
        } else {
            showResults();
        }
    }, 300);
}

// ============================================
// RESULTS & VERDICT
// ============================================

function calculateFuckedScore() {
    let score = 0;

    // Tax problem weight
    const problem = data.tax_problem || '';
    if (problem.includes('owe money')) score += 3;
    if (problem.includes('unfiled')) score += 2;
    if (problem.includes('notice')) score += 2;

    // Debt amount weight
    const debt = data.debt_amount || '';
    if (debt.includes('Under $10,000')) score += 1;
    if (debt.includes('$10,000 - $25,000')) score += 2;
    if (debt.includes('$25,000 - $50,000')) score += 3;
    if (debt.includes('$50,000 - $100,000')) score += 4;
    if (debt.includes('Over $100,000')) score += 5;

    // Collection action weight
    const action = data.collection_action || '';
    if (action.includes('Wage garnishment')) score += 5;
    if (action.includes('Bank levy')) score += 5;
    if (action.includes('Tax lien')) score += 4;
    if (action.includes('threatening letters')) score += 2;

    // Unfiled years weight
    const years = data.unfiled_years || '';
    if (years.includes('1-2')) score += 2;
    if (years.includes('3-5')) score += 3;
    if (years.includes('6+')) score += 5;
    if (years.includes('no idea')) score += 3;

    // Notice type weight
    const notice = data.notice_type || '';
    if (notice.includes('owe money')) score += 3;
    if (notice.includes('Audit')) score += 4;
    if (notice.includes('No idea')) score += 2;

    // Notice response weight
    const responded = data.notice_responded || '';
    if (responded.includes('Ignored')) score += 3;
    if (responded.includes('haven\'t responded')) score += 2;

    // Unsure situation weight
    const unsure = data.unsure_situation || '';
    if (unsure.includes('Haven\'t filed')) score += 3;
    if (unsure.includes('paid in cash')) score += 4;
    if (unsure.includes('Not sure if I owe')) score += 2;

    // Unsure filed recently weight
    const filed = data.unsure_filed_recently || '';
    if (filed.includes('No')) score += 2;
    if (filed.includes('Can\'t remember')) score += 3;

    return score;
}

function getVerdict(score) {
    return {
        title: 'That\'s f*cked.',
        message: 'Believe it or not, we can help.',
        severity: score >= 10 ? 'high' : score >= 5 ? 'medium' : score >= 2 ? 'low' : 'minimal'
    };
}

function showResults() {
    // Hide quiz, show results
    quizContainer.style.display = 'none';

    // Calculate score and get verdict
    const score = calculateFuckedScore();
    const verdict = getVerdict(score);

    // Display verdict
    resultVerdict.innerHTML = `<h2 style="font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 1rem; font-weight: 500;">${verdict.title}</h2>`;
    resultMessage.innerHTML = `<p style="font-size: clamp(1.125rem, 2.5vw, 1.5rem); color: white; margin-bottom: 0;">${verdict.message}</p>`;

    // Wrap verdict and message in a container for proper flex layout
    if (!resultVerdict.parentElement.classList.contains('results-header')) {
        const headerSection = document.createElement('div');
        headerSection.className = 'results-header';
        resultContainer.insertBefore(headerSection, resultVerdict);
        headerSection.appendChild(resultVerdict);
        headerSection.appendChild(resultMessage);
    }

    // Make result container full viewport
    resultContainer.style.display = 'flex';
    resultContainer.classList.add('results-fullscreen');

    // Set up form submission
    setupFormSubmission();
}

// ============================================
// FORM HANDLING
// ============================================

function setupFormSubmission() {
    const form = document.getElementById('contactForm');
    const submitButton = form.querySelector('.submit-button');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');
    const feedback = document.querySelector('.form-feedback');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Disable form while submitting
        submitButton.disabled = true;
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'inline';
        feedback.style.display = 'none';

        // Get form data
        const formData = new FormData(form);

        // Add quiz data as hidden fields
        formData.append('tax_problem', data.tax_problem || '');
        formData.append('debt_amount', data.debt_amount || '');
        formData.append('collection_action', data.collection_action || '');
        formData.append('unfiled_years', data.unfiled_years || '');
        formData.append('notice_type', data.notice_type || '');
        formData.append('notice_responded', data.notice_responded || '');
        formData.append('unsure_situation', data.unsure_situation || '');
        formData.append('unsure_filed_recently', data.unsure_filed_recently || '');

        // Add UTM tracking
        const trackingData = captureUrlParameters();
        Object.keys(trackingData).forEach(key => {
            if (trackingData[key]) {
                formData.append(key, trackingData[key]);
            }
        });

        try {
            // Submit to configured endpoint
            const response = await fetch(CONFIG.formEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success
                showFeedback('success', CONFIG.successMessage);
                form.reset();
            } else {
                // Server error
                throw new Error('Server returned an error');
            }
        } catch (error) {
            // Network or other error
            console.error('Form submission error:', error);
            showFeedback('error', CONFIG.errorMessage);
        } finally {
            // Re-enable form
            submitButton.disabled = false;
            buttonText.style.display = 'inline';
            buttonLoader.style.display = 'none';
        }
    });

    function showFeedback(type, message) {
        feedback.className = 'form-feedback ' + type;
        feedback.textContent = message;
        feedback.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 5000);
        }
    }
}

// ============================================
// UTM TRACKING
// ============================================

function captureUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const trackingData = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: params.get('utm_content'),
        promo_code: params.get('promo') || params.get('code'),
        referrer: document.referrer,
        landing_page: window.location.href
    };

    // Store in sessionStorage for later use
    sessionStorage.setItem('tracking_data', JSON.stringify(trackingData));

    return trackingData;
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Capture UTMs on page load
    captureUrlParameters();

    // Start the quiz
    render();
});

// ============================================
// CONSOLE EASTER EGG
// ============================================

console.log('%c🔥 Are Your Taxes F*cked? 🔥', 'font-size: 24px; font-weight: bold; color: #FF0000;');
console.log('%cIf you\'re looking at this, you probably know what you\'re doing.', 'font-size: 14px;');
console.log('%cWant to work with us? Fill out the form.', 'font-size: 14px;');
