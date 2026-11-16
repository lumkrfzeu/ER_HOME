/**
 * ER:ON (predict · record · ON) Medical AI Website Main Script
 * Handles Interactive Simulators, Dark/Light Themes, Stats Counter,
 * FAQ Accordion, Audio-to-Draft EMR Simulation, and Contact Form.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeaderScroll();
  initMobileNav();
  initScrollSpy();
  initStatCounters();
  initFaqAccordion();
  initSimulatorPredict();
  initSimulatorRecord();
  initContactForm();
  initBackToTop();
  initRealtimeClock();
});

/* -------------------------------------------------------------------------- */
/* 1. Theme Toggle (Default Dark Mode)                                        */
/* -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem('eron-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('eron-theme', newTheme);
  });
}

/* -------------------------------------------------------------------------- */
/* 2. Header Scroll Effect                                                    */
/* -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* 3. Mobile Navigation                                                       */
/* -------------------------------------------------------------------------- */
function initMobileNav() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!mobileToggle || !navMenu) return;

  mobileToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
      navMenu.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 4. ScrollSpy                                                               */
/* -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* 5. Stat Number Counter Animation                                           */
/* -------------------------------------------------------------------------- */
function initStatCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseInt(el.getAttribute('data-target'), 10);
        animateCounter(el, targetVal);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el, target) {
  let start = 0;
  const duration = 1600;
  const stepTime = 20;
  const steps = duration / stepTime;
  const increment = target / steps;

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      el.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start).toLocaleString();
    }
  }, stepTime);
}

/* -------------------------------------------------------------------------- */
/* 6. FAQ Accordion                                                           */
/* -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const ans = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(other => {
        if (other !== item) {
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      if (expanded) {
        btn.setAttribute('aria-expanded', 'false');
        ans.style.maxHeight = null;
      } else {
        btn.setAttribute('aria-expanded', 'true');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 7. Interactive Simulator - Predict (환자 악화 예측 시뮬레이터)            */
/* -------------------------------------------------------------------------- */
const SCENARIO_DATA = {
  'patient-a': {
    title: '김OO (67세/남) | 내원사유: 급성 호흡곤란 | KTAS 3단계',
    targetEvent: '호흡부전 처치 및 승압제(Vasopressor) 사용',
    hours: {
      1: {
        score: 42,
        level: '주의 (MODERATE)',
        levelClass: 'warning',
        alertText: '주의 관찰 요망 (MONITORING)',
        alertClass: 'warning',
        dashOffset: 182,
        shaps: [
          { name: 'SpO2 경미 하강 (95%)', val: '+0.15', pct: 40, col: 'orange' },
          { name: '호흡수 증가 (22회/분)', val: '+0.12', pct: 32, col: 'orange' },
          { name: '수축기 혈압 (110 mmHg)', val: '-0.05', pct: 15, col: 'green' }
        ],
        vitals: [
          { time: '내원 직후 (0h)', bp: '130/80', hr: '84', rr: '20', spo2: '97%', bt: '36.8°C', tag: 'normal' },
          { time: '+1h (1차 예측)', bp: '110/72', hr: '92', rr: '22', spo2: '95%', bt: '36.9°C', tag: 'normal' }
        ]
      },
      2: {
        score: 84,
        level: '고위험 (HIGH RISK)',
        levelClass: 'danger',
        alertText: '재평가 권고 (URGENT REASSESSMENT)',
        alertClass: 'danger',
        dashOffset: 50,
        shaps: [
          { name: 'SpO2 급락 (96 → 89%)', val: '+0.38', pct: 82, col: 'red' },
          { name: '호흡수 빈호흡 (28회/분)', val: '+0.26', pct: 65, col: 'red' },
          { name: '수축기 혈압 강하 (88 mmHg)', val: '+0.19', pct: 50, col: 'orange' },
          { name: '심박수 빈맥 (118회/분)', val: '+0.14', pct: 38, col: 'orange' }
        ],
        vitals: [
          { time: '내원 직후 (0h)', bp: '130/80', hr: '84', rr: '20', spo2: '97%', bt: '36.8°C', tag: 'normal' },
          { time: '+1h (1차 예측)', bp: '110/72', hr: '92', rr: '22', spo2: '95%', bt: '36.9°C', tag: 'normal' },
          { time: '+2h (2차 예측)', bp: '88/55', hr: '118', rr: '28', spo2: '89%', bt: '37.1°C', tag: 'alert' }
        ]
      },
      3: {
        score: 93,
        level: '초고위험 (CRITICAL)',
        levelClass: 'danger',
        alertText: '즉각적 소생 처치 필요 (CRITICAL INTERVENTION)',
        alertClass: 'danger',
        dashOffset: 22,
        shaps: [
          { name: 'SpO2 저산소증 지속 (86%)', val: '+0.45', pct: 95, col: 'red' },
          { name: '의식 혼미 신호 (GCS 저하)', val: '+0.32', pct: 75, col: 'red' },
          { name: '수축기 저혈압 지속 (80 mmHg)', val: '+0.28', pct: 70, col: 'red' }
        ],
        vitals: [
          { time: '+1h', bp: '110/72', hr: '92', rr: '22', spo2: '95%', bt: '36.9°C', tag: 'normal' },
          { time: '+2h', bp: '88/55', hr: '118', rr: '28', spo2: '89%', bt: '37.1°C', tag: 'alert' },
          { time: '+3h (3차 예측)', bp: '80/50', hr: '124', rr: '32', spo2: '86%', bt: '37.2°C', tag: 'alert' }
        ]
      },
      4: {
        score: 88,
        level: '중환자 처치 중 (ICU TRANSFER)',
        levelClass: 'danger',
        alertText: '기도삽관 및 승압제 투여 중',
        alertClass: 'danger',
        dashOffset: 38,
        shaps: [
          { name: '기관내삽관 완료', val: '+0.30', pct: 65, col: 'orange' },
          { name: '노르에피네프린 투여', val: '+0.25', pct: 55, col: 'orange' }
        ],
        vitals: [
          { time: '+2h', bp: '88/55', hr: '118', rr: '28', spo2: '89%', bt: '37.1°C', tag: 'alert' },
          { time: '+3h', bp: '80/50', hr: '124', rr: '32', spo2: '86%', bt: '37.2°C', tag: 'alert' },
          { time: '+4h (처치 후)', bp: '102/65', hr: '98', rr: '20', spo2: '96%', bt: '37.0°C', tag: 'normal' }
        ]
      },
      5: {
        score: 65,
        level: '안정화 진행 중',
        levelClass: 'warning',
        alertText: '중환자실 입원 대기',
        alertClass: 'warning',
        dashOffset: 110,
        shaps: [
          { name: '승압제 반응성 양호', val: '-0.15', pct: 35, col: 'green' }
        ],
        vitals: [
          { time: '+4h', bp: '102/65', hr: '98', rr: '20', spo2: '96%', bt: '37.0°C', tag: 'normal' },
          { time: '+5h (퇴실 준비)', bp: '115/70', hr: '88', rr: '18', spo2: '98%', bt: '36.8°C', tag: 'normal' }
        ]
      }
    }
  },
  'patient-b': {
    title: '이OO (72세/여) | 내원사유: 발열 및 전신 쇠약 | KTAS 3단계',
    targetEvent: '패혈성 쇼크 진입 및 수액/승압제 투여',
    hours: {
      1: {
        score: 35,
        level: '안정/경과 관찰',
        levelClass: 'stable',
        alertText: '활력징후 일반 모니터링',
        alertClass: 'stable',
        dashOffset: 204,
        shaps: [
          { name: '체온 상승 (38.8°C)', val: '+0.18', pct: 45, col: 'orange' }
        ],
        vitals: [
          { time: '내원 직후 (0h)', bp: '125/75', hr: '95', rr: '18', spo2: '96%', bt: '38.8°C', tag: 'normal' }
        ]
      },
      2: {
        score: 72,
        level: '고위험 (HIGH RISK)',
        levelClass: 'danger',
        alertText: '재평가 권고 (패혈증 스크리닝)',
        alertClass: 'danger',
        dashOffset: 88,
        shaps: [
          { name: '수축기 혈압 하강 (92 mmHg)', val: '+0.31', pct: 72, col: 'red' },
          { name: '맥박수 급증 (115회/분)', val: '+0.22', pct: 55, col: 'red' },
          { name: '젖산치(Lactate) 상승', val: '+0.19', pct: 48, col: 'orange' }
        ],
        vitals: [
          { time: '+1h', bp: '120/70', hr: '98', rr: '20', spo2: '96%', bt: '38.9°C', tag: 'normal' },
          { time: '+2h (위험 감지)', bp: '92/58', hr: '115', rr: '24', spo2: '94%', bt: '39.1°C', tag: 'alert' }
        ]
      },
      3: {
        score: 82,
        level: '고위험 지속',
        levelClass: 'danger',
        alertText: '승압제 및 항생제 투여 요망',
        alertClass: 'danger',
        dashOffset: 56,
        shaps: [
          { name: '수액 반응성 저하', val: '+0.35', pct: 80, col: 'red' }
        ],
        vitals: [
          { time: '+2h', bp: '92/58', hr: '115', rr: '24', spo2: '94%', bt: '39.1°C', tag: 'alert' },
          { time: '+3h', bp: '85/52', hr: '120', rr: '26', spo2: '93%', bt: '38.7°C', tag: 'alert' }
        ]
      },
      4: {
        score: 55,
        level: '중재 후 회복 추세',
        levelClass: 'warning',
        alertText: '혈압 상승 반응 확인',
        alertClass: 'warning',
        dashOffset: 141,
        shaps: [
          { name: '승압제 반응 확인', val: '-0.20', pct: 45, col: 'green' }
        ],
        vitals: [
          { time: '+3h', bp: '85/52', hr: '120', rr: '26', spo2: '93%', bt: '38.7°C', tag: 'alert' },
          { time: '+4h', bp: '105/65', hr: '95', rr: '20', spo2: '96%', bt: '37.8°C', tag: 'normal' }
        ]
      },
      5: {
        score: 40,
        level: '안정화 단계',
        levelClass: 'stable',
        alertText: '일반 병실 전실 준비',
        alertClass: 'stable',
        dashOffset: 188,
        shaps: [
          { name: '활력징후 안정', val: '-0.10', pct: 25, col: 'green' }
        ],
        vitals: [
          { time: '+4h', bp: '105/65', hr: '95', rr: '20', spo2: '96%', bt: '37.8°C', tag: 'normal' },
          { time: '+5h', bp: '118/72', hr: '84', rr: '18', spo2: '98%', bt: '37.2°C', tag: 'normal' }
        ]
      }
    }
  },
  'patient-c': {
    title: '박OO (34세/남) | 내원사유: 우하복부 통증 | KTAS 4단계',
    targetEvent: '급성 충수염 의증 (활력징후 안정)',
    hours: {
      1: {
        score: 12,
        level: '안정 (STABLE)',
        levelClass: 'stable',
        alertText: '정상 경과 관찰 중',
        alertClass: 'stable',
        dashOffset: 276,
        shaps: [
          { name: '혈압 및 맥박 안정', val: '-0.25', pct: 20, col: 'green' },
          { name: '산소포화도 정상 (99%)', val: '-0.30', pct: 15, col: 'green' }
        ],
        vitals: [
          { time: '내원 직후 (0h)', bp: '120/78', hr: '72', rr: '16', spo2: '99%', bt: '36.7°C', tag: 'normal' }
        ]
      },
      2: {
        score: 15,
        level: '안정 (STABLE)',
        levelClass: 'stable',
        alertText: '정상 경과 관찰 중',
        alertClass: 'stable',
        dashOffset: 266,
        shaps: [
          { name: '활력징후 변동 없음', val: '-0.20', pct: 18, col: 'green' }
        ],
        vitals: [
          { time: '+1h', bp: '118/76', hr: '74', rr: '16', spo2: '99%', bt: '36.8°C', tag: 'normal' },
          { time: '+2h', bp: '122/80', hr: '70', rr: '16', spo2: '99%', bt: '36.7°C', tag: 'normal' }
        ]
      },
      3: {
        score: 18,
        level: '안정 (복부 CT 대기)',
        levelClass: 'stable',
        alertText: '수술 필요 여부 검사 대기',
        alertClass: 'stable',
        dashOffset: 257,
        shaps: [
          { name: 'WBC 약한 상승', val: '+0.08', pct: 20, col: 'orange' }
        ],
        vitals: [
          { time: '+2h', bp: '122/80', hr: '70', rr: '16', spo2: '99%', bt: '36.7°C', tag: 'normal' },
          { time: '+3h', bp: '120/78', hr: '76', rr: '16', spo2: '99%', bt: '36.9°C', tag: 'normal' }
        ]
      },
      4: {
        score: 16,
        level: '안정',
        levelClass: 'stable',
        alertText: '외과 수술 협진 완료',
        alertClass: 'stable',
        dashOffset: 263,
        shaps: [
          { name: '생체징후 양호', val: '-0.15', pct: 15, col: 'green' }
        ],
        vitals: [
          { time: '+3h', bp: '120/78', hr: '76', rr: '16', spo2: '99%', bt: '36.9°C', tag: 'normal' },
          { time: '+4h', bp: '124/82', hr: '72', rr: '16', spo2: '99%', bt: '36.7°C', tag: 'normal' }
        ]
      },
      5: {
        score: 14,
        level: '수술실 이동 준비',
        levelClass: 'stable',
        alertText: '병동 전실',
        alertClass: 'stable',
        dashOffset: 270,
        shaps: [
          { name: '안정적', val: '-0.20', pct: 10, col: 'green' }
        ],
        vitals: [
          { time: '+4h', bp: '124/82', hr: '72', rr: '16', spo2: '99%', bt: '36.7°C', tag: 'normal' },
          { time: '+5h', bp: '120/75', hr: '68', rr: '16', spo2: '99%', bt: '36.6°C', tag: 'normal' }
        ]
      }
    }
  }
};

let currentScenario = 'patient-a';
let currentHour = 2;

function initSimulatorPredict() {
  const scenarioBtns = document.querySelectorAll('.scenario-card');
  const timeSlider = document.getElementById('time-slider');
  const timeDisplay = document.getElementById('time-display');

  if (!scenarioBtns.length || !timeSlider) return;

  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScenario = btn.getAttribute('data-scenario');
      renderPredictSimulator();
    });
  });

  timeSlider.addEventListener('input', (e) => {
    currentHour = parseInt(e.target.value, 10);
    timeDisplay.textContent = `+${currentHour}시간 (${currentHour}차 재예측)`;
    renderPredictSimulator();
  });

  renderPredictSimulator();
}

function renderPredictSimulator() {
  const data = SCENARIO_DATA[currentScenario];
  if (!data) return;

  const hourData = data.hours[currentHour];
  if (!hourData) return;

  // Title & Target Event
  const titleEl = document.getElementById('sim-patient-title');
  const targetEl = document.getElementById('sim-target-event');
  if (titleEl) titleEl.textContent = data.title;
  if (targetEl) targetEl.innerHTML = `예측 이벤트: <strong>${data.targetEvent}</strong>`;

  // Alert Badge
  const alertBadge = document.getElementById('sim-alert-badge');
  const alertText = document.getElementById('sim-alert-text');
  if (alertBadge && alertText) {
    alertText.textContent = hourData.alertText;
    if (hourData.alertClass === 'danger') {
      alertBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      alertBadge.style.color = '#f87171';
    } else if (hourData.alertClass === 'warning') {
      alertBadge.style.background = 'rgba(245, 158, 11, 0.2)';
      alertBadge.style.color = '#fbbf24';
    } else {
      alertBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      alertBadge.style.color = '#34d399';
    }
  }

  // Gauge
  const gaugeVal = document.getElementById('sim-gauge-value');
  const gaugeLevel = document.getElementById('sim-gauge-level');
  const gaugeCircle = document.getElementById('sim-gauge-circle');

  if (gaugeVal) gaugeVal.textContent = `${hourData.score}%`;
  if (gaugeLevel) gaugeLevel.textContent = hourData.level;
  if (gaugeCircle) {
    gaugeCircle.style.strokeDashoffset = hourData.dashOffset;
    if (hourData.levelClass === 'danger') {
      gaugeCircle.style.stroke = '#ef4444';
      if (gaugeVal) gaugeVal.style.color = '#ef4444';
    } else if (hourData.levelClass === 'warning') {
      gaugeCircle.style.stroke = '#f59e0b';
      if (gaugeVal) gaugeVal.style.color = '#f59e0b';
    } else {
      gaugeCircle.style.stroke = '#10b981';
      if (gaugeVal) gaugeVal.style.color = '#10b981';
    }
  }

  // SHAP List
  const shapList = document.getElementById('sim-shap-list');
  if (shapList) {
    shapList.innerHTML = hourData.shaps.map(s => `
      <div class="shap-group">
        <div class="shap-item">
          <span class="shap-name">${s.name}</span>
          <span class="shap-val ${s.col === 'red' ? 'positive' : ''}">${s.val}</span>
        </div>
        <div class="shap-bar-bg">
          <div class="shap-bar-fill ${s.col}" style="width: ${s.pct}%;"></div>
        </div>
      </div>
    `).join('');
  }

  // Vitals Table
  const vitalsBody = document.getElementById('sim-vitals-body');
  if (vitalsBody) {
    vitalsBody.innerHTML = hourData.vitals.map(v => `
      <tr>
        <td><strong>${v.time}</strong></td>
        <td>${v.bp}</td>
        <td>${v.hr}</td>
        <td>${v.rr}</td>
        <td>${v.spo2}</td>
        <td>${v.bt}</td>
        <td><span class="v-badge-${v.tag === 'alert' ? 'alert' : 'normal'}">${v.tag === 'alert' ? '주의/이상' : '정상'}</span></td>
      </tr>
    `).join('');
  }
}

/* -------------------------------------------------------------------------- */
/* 8. Interactive Simulator - Record & Tabs                                  */
/* -------------------------------------------------------------------------- */
function initSimulatorRecord() {
  // Tabs
  const tabPredictBtn = document.getElementById('tab-btn-predict');
  const tabRecordBtn = document.getElementById('tab-btn-record');
  const tabPredict = document.getElementById('tab-predict');
  const tabRecord = document.getElementById('tab-record');

  if (tabPredictBtn && tabRecordBtn) {
    tabPredictBtn.addEventListener('click', () => {
      tabPredictBtn.classList.add('active');
      tabPredictBtn.setAttribute('aria-selected', 'true');
      tabRecordBtn.classList.remove('active');
      tabRecordBtn.setAttribute('aria-selected', 'false');
      tabPredict.classList.add('active');
      tabRecord.classList.remove('active');
    });

    tabRecordBtn.addEventListener('click', () => {
      tabRecordBtn.classList.add('active');
      tabRecordBtn.setAttribute('aria-selected', 'true');
      tabPredictBtn.classList.remove('active');
      tabPredictBtn.setAttribute('aria-selected', 'false');
      tabRecord.classList.add('active');
      tabPredict.classList.remove('active');
    });
  }

  // Sign Draft Button
  const btnSignDraft = document.getElementById('btn-sign-draft');
  const statusPill = document.getElementById('draft-status-pill');

  if (btnSignDraft && statusPill) {
    btnSignDraft.addEventListener('click', () => {
      statusPill.textContent = 'STATUS: SIGNED (전자의무기록 전자서명 완료)';
      statusPill.classList.add('signed');
      btnSignDraft.textContent = '✓ 전자서명 승인 완료됨';
      btnSignDraft.disabled = true;
      btnSignDraft.style.opacity = '0.7';
      btnSignDraft.style.cursor = 'default';
    });
  }

  // Replay Audio Animation
  const btnReplay = document.getElementById('btn-replay-audio');
  const formContainer = document.getElementById('record-structured-container');

  if (btnReplay && formContainer) {
    btnReplay.addEventListener('click', () => {
      if (btnSignDraft) {
        btnSignDraft.disabled = false;
        btnSignDraft.style.opacity = '1';
        btnSignDraft.style.cursor = 'pointer';
        btnSignDraft.textContent = '의료진 검토 & 전자서명 확정 (SIGNED)';
      }
      if (statusPill) {
        statusPill.textContent = 'STATUS: DRAFT (실시간 구조화 중)';
        statusPill.classList.remove('signed');
      }

      formContainer.style.opacity = '0.3';
      setTimeout(() => {
        formContainer.style.opacity = '1';
        if (statusPill) statusPill.textContent = 'STATUS: DRAFT';
      }, 600);
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 9. Contact Form Handling                                                   */
/* -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success-msg');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const fields = [
      { id: 'institution', errorId: 'error-institution', validator: val => val.trim().length > 0 },
      { id: 'name', errorId: 'error-name', validator: val => val.trim().length > 0 },
      { id: 'phone', errorId: 'error-phone', validator: val => val.trim().length >= 8 },
      { id: 'email', errorId: 'error-email', validator: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) }
    ];

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const group = input.closest('.form-group');
      if (!f.validator(input.value)) {
        group.classList.add('has-error');
        isValid = false;
      } else {
        group.classList.remove('has-error');
      }
    });

    if (isValid) {
      const submitBtn = document.getElementById('submit-inquiry-btn');
      submitBtn.textContent = '접수 처리 중...';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.reset();
        submitBtn.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
      }, 800);
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 10. Back to Top Button                                                     */
/* -------------------------------------------------------------------------- */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -------------------------------------------------------------------------- */
/* 11. Realtime ER Monitor Clock                                              */
/* -------------------------------------------------------------------------- */
function initRealtimeClock() {
  const clockEl = document.getElementById('monitor-clock');
  if (!clockEl) return;

  let seconds = 2 * 3600 + 40 * 60 + 15;

  setInterval(() => {
    seconds++;
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    clockEl.textContent = `ER 체류 +${h}:${m}:${s}`;
  }, 1000);
}
