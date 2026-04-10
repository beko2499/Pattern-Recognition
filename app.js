// ===== State =====
let completedSections = JSON.parse(localStorage.getItem('pr_ch2_completed') || '[]');
let currentCard = 0;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    buildSections();
    updateProgress();
    // Mobile menu
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
});

// ===== Navigation =====
function buildNav() {
    const nav = document.getElementById('navLinks');
    let html = `<div class="nav-item active" data-target="heroSection" onclick="navigateTo('heroSection')">
        <span class="nav-icon">🏠</span><span>الرئيسية</span></div>`;
    SECTIONS.forEach(s => {
        const done = completedSections.includes(s.id);
        html += `<div class="nav-item" data-target="${s.id}" onclick="navigateTo('${s.id}')">
            <span class="nav-icon">${s.icon}</span><span>${s.title}</span>
            ${done ? '<span class="check">✓</span>' : ''}</div>`;
    });
    html += `<div class="nav-item" data-target="quizSection" onclick="showFullQuiz()">
        <span class="nav-icon">📝</span><span>اختبار شامل</span></div>`;
    html += `<div class="nav-item" data-target="flashcardsSection" onclick="showFlashcards()">
        <span class="nav-icon">🎴</span><span>بطاقات المراجعة</span></div>`;
    nav.innerHTML = html;
}

function navigateTo(targetId) {
    // Hide all
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('flashcardsSection').style.display = 'none';
    document.querySelectorAll('.section-wrapper').forEach(el => el.style.display = 'none');
    // Show target
    if (targetId === 'heroSection') {
        document.getElementById('heroSection').style.display = '';
    } else {
        const el = document.getElementById(targetId);
        if (el) el.style.display = '';
    }
    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if (navItem) navItem.classList.add('active');
    window.scrollTo({top: 0, behavior: 'smooth'});
    // Close mobile menu
    document.getElementById('sidebar').classList.remove('open');
}

// ===== Build Sections =====
function buildSections() {
    const container = document.getElementById('sectionsContainer');
    let html = '';
    SECTIONS.forEach(section => {
        html += `<div class="section-wrapper" id="${section.id}" style="display:none;">
            <section class="content-section">
                <div class="section-header">
                    <span class="section-icon">${section.icon}</span>
                    <h2>${section.title}<span class="en-sub">${section.enTitle}</span></h2>
                </div>`;
        // Lessons
        section.lessons.forEach(lesson => {
            html += `<div class="lesson-card">
                <h3>${lesson.title} <span class="en-term">${lesson.en}</span></h3>
                ${lesson.content}
            </div>`;
        });
        // Section Quiz
        html += `<div class="section-quiz"><h3>📋 أسئلة تدريبية — ${section.title}</h3>`;
        section.quiz.forEach((q, qi) => {
            const qId = `${section.id}-q${qi}`;
            const diffClass = q.d === 'easy' ? 'q-easy' : q.d === 'medium' ? 'q-medium' : 'q-hard';
            const diffLabel = q.d === 'easy' ? '🟢 سهل' : q.d === 'medium' ? '🟡 متوسط' : '🔴 صعب';
            // Shuffle options
            const indices = shuffleArray([0,1,2,3]);
            const newAns = indices.indexOf(q.ans);
            html += `<div class="quiz-q">
                <span class="q-difficulty ${diffClass}">${diffLabel}</span>
                <div class="q-text">${qi+1}. ${q.q}</div>
                <div class="q-options">`;
            indices.forEach((origIdx, newIdx) => {
                html += `<button class="q-option" onclick="checkAnswer(this,'${qId}',${newIdx},${newAns})">${q.opts[origIdx]}</button>`;
            });
            html += `</div><div class="q-explanation" id="exp-${qId}">${q.exp}</div></div>`;
        });
        html += `</div>`;
        // Complete button
        const isDone = completedSections.includes(section.id);
        html += `<button class="btn-complete ${isDone?'completed':''}" id="btn-${section.id}" 
            onclick="toggleComplete('${section.id}')">
            ${isDone ? '✓ تم الإكمال' : '✅ تم فهم هذا القسم'}</button>`;
        html += `</section></div>`;
    });
    container.innerHTML = html;
}

// ===== Quiz Logic =====
function checkAnswer(btn, qId, selected, correct) {
    const parent = btn.closest('.quiz-q');
    const options = parent.querySelectorAll('.q-option');
    options.forEach((opt, i) => {
        opt.classList.add('disabled');
        if (i === correct) opt.classList.add('correct');
        else if (i === selected && selected !== correct) opt.classList.add('wrong');
    });
    document.getElementById(`exp-${qId}`).classList.add('show');
}

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ===== Complete Section =====
function toggleComplete(sectionId) {
    if (completedSections.includes(sectionId)) {
        completedSections = completedSections.filter(s => s !== sectionId);
    } else {
        completedSections.push(sectionId);
    }
    localStorage.setItem('pr_ch2_completed', JSON.stringify(completedSections));
    const btn = document.getElementById(`btn-${sectionId}`);
    const isDone = completedSections.includes(sectionId);
    btn.className = `btn-complete ${isDone?'completed':''}`;
    btn.textContent = isDone ? '✓ تم الإكمال' : '✅ تم فهم هذا القسم';
    buildNav();
    updateProgress();
    // Navigate to next
    if (isDone) {
        const idx = SECTIONS.findIndex(s => s.id === sectionId);
        if (idx < SECTIONS.length - 1) {
            setTimeout(() => navigateTo(SECTIONS[idx+1].id), 500);
        }
    }
}

function updateProgress() {
    const pct = Math.round((completedSections.length / SECTIONS.length) * 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = pct + '%';
}

// ===== Full Quiz =====
function showFullQuiz() {
    navigateTo('quizSection');
    document.getElementById('quizSection').style.display = '';
    const container = document.getElementById('quizContainer');
    let allQ = [];
    SECTIONS.forEach(s => {
        s.quiz.forEach(q => allQ.push({...q, section: s.title}));
    });
    allQ = shuffleArray(allQ).slice(0, 20);
    let html = `<p style="color:var(--text-dim);margin-bottom:20px;">20 سؤال عشوائي من جميع الأقسام — سهل ومتوسط وصعب</p>`;
    allQ.forEach((q, qi) => {
        const qId = `full-q${qi}`;
        const diffClass = q.d === 'easy' ? 'q-easy' : q.d === 'medium' ? 'q-medium' : 'q-hard';
        const diffLabel = q.d === 'easy' ? '🟢 سهل' : q.d === 'medium' ? '🟡 متوسط' : '🔴 صعب';
        const indices = shuffleArray([0,1,2,3]);
        const newAns = indices.indexOf(q.ans);
        html += `<div class="quiz-q">
            <span class="q-difficulty ${diffClass}">${diffLabel}</span>
            <span style="color:var(--text-dim);font-size:12px;margin-right:8px;">${q.section}</span>
            <div class="q-text">${qi+1}. ${q.q}</div>
            <div class="q-options">`;
        indices.forEach((origIdx, newIdx) => {
            html += `<button class="q-option" onclick="checkAnswer(this,'${qId}',${newIdx},${newAns})">${q.opts[origIdx]}</button>`;
        });
        html += `</div><div class="q-explanation" id="exp-${qId}">${q.exp}</div></div>`;
    });
    container.innerHTML = html;
}

// ===== Flashcards =====
function showFlashcards() {
    navigateTo('flashcardsSection');
    document.getElementById('flashcardsSection').style.display = '';
    currentCard = 0;
    showCard();
}

function showCard() {
    const card = FLASHCARDS[currentCard];
    document.getElementById('flashFront').textContent = card.front;
    document.getElementById('flashBack').textContent = card.back;
    document.getElementById('cardCounter').textContent = `${currentCard + 1} / ${FLASHCARDS.length}`;
    document.getElementById('flashcardInner').classList.remove('flipped');
}

function flipCard() {
    document.getElementById('flashcardInner').classList.toggle('flipped');
}

function nextCard() {
    currentCard = (currentCard + 1) % FLASHCARDS.length;
    showCard();
}

function prevCard() {
    currentCard = (currentCard - 1 + FLASHCARDS.length) % FLASHCARDS.length;
    showCard();
}
