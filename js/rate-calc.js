// ── MODERN EARNER — Freelancer Rate Calculator ──
// "What should I charge to hit my income goal?"
// Accounts for: target income, expenses, taxes, platform fees, billable hours

const PLATFORMS = {
  upwork:  { label: 'Upwork',  fee: 0.20 }, // worst case (under $500 lifetime)
  fiverr:  { label: 'Fiverr',  fee: 0.20 },
  toptal:  { label: 'Toptal',  fee: 0.00 },
  direct:  { label: 'Direct',  fee: 0.00 },
};

// KRA tax bands (monthly KES) — Finance Act 2023, still in force; verified against Finance Act 2026, July 2026
// TODO: Finance Act 2026 restructures these bands (10% to KES 360k/yr, 17.5% next 100k,
// 25% to ~6.07M, 27.5% above), effective 1 Jan 2027. Update KRA_BANDS then.
const KRA_BANDS = [
  { limit: 24000,    rate: 0.10 },
  { limit: 32333,    rate: 0.25 },
  { limit: 500000,   rate: 0.30 },
  { limit: 800000,   rate: 0.325 },
  { limit: Infinity, rate: 0.35 },
];
const PERSONAL_RELIEF = 2400;

function calcKRATax(monthlyKES) {
  let tax = 0, prev = 0;
  for (const band of KRA_BANDS) {
    if (monthlyKES <= prev) break;
    tax += (Math.min(monthlyKES, band.limit) - prev) * band.rate;
    prev = band.limit;
  }
  return Math.max(0, tax - PERSONAL_RELIEF);
}

// Populate dropdowns
window.addEventListener('DOMContentLoaded', () => {
  const platformSelect = document.getElementById('platform');
  Object.entries(PLATFORMS).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = val.label;
    platformSelect.appendChild(opt);
  });
});

function calculate() {
  const targetKES    = parseFloat(document.getElementById('target-income').value);
  const expensesKES  = parseFloat(document.getElementById('expenses').value) || 0;
  const hoursPerWeek = parseFloat(document.getElementById('hours-week').value);
  const weeksOff     = parseFloat(document.getElementById('weeks-off').value) || 4;
  const platformKey  = document.getElementById('platform').value;
  const usdRate      = parseFloat(document.getElementById('usd-rate').value) || 129.5;
  const includeTax   = document.getElementById('include-tax').checked;

  if (!targetKES || targetKES <= 0)    { showError('Please enter your target monthly income.'); return; }
  if (!hoursPerWeek || hoursPerWeek <= 0) { showError('Please enter your weekly hours.'); return; }

  const platform = PLATFORMS[platformKey];

  // ── Billable hours per month ──
  const workingWeeks   = 52 - weeksOff;
  const hoursPerMonth  = (hoursPerWeek * workingWeeks) / 12;

  // Billable rate is typically 70% of total hours (admin, revisions, comms)
  const billableHours  = hoursPerMonth * 0.70;

  // ── What you need to GROSS (before tax) ──
  // targetKES = after-tax take-home
  // Work backwards: gross = target + tax on gross
  let grossNeededKES = targetKES + expensesKES;

  if (includeTax) {
    // Iterative solve: find gross such that gross - KRAtax(gross) = target + expenses
    let gross = grossNeededKES * 1.35; // start estimate
    for (let i = 0; i < 20; i++) {
      const tax = calcKRATax(gross);
      const takeHome = gross - tax;
      const needed   = targetKES + expensesKES;
      gross = gross + (needed - takeHome) * 0.8;
    }
    grossNeededKES = Math.max(gross, 0);
  }

  // ── Gross USD needed per month ──
  const grossNeededUSD = grossNeededKES / usdRate;

  // ── Inflate for platform fee ──
  // If platform takes X%, you need to charge grossNeeded / (1 - X%)
  const chargeNeededUSD = grossNeededUSD / (1 - platform.fee);

  // ── Hourly rate ──
  const hourlyRateUSD = chargeNeededUSD / billableHours;
  const hourlyRateKES = hourlyRateUSD * usdRate;

  // ── Project rates ──
  const dailyRate    = hourlyRateUSD * 8;
  const weeklyRate   = hourlyRateUSD * hoursPerWeek;
  const monthlyRate  = chargeNeededUSD;

  // ── Tax calculation ──
  const kraMonthly = includeTax ? calcKRATax(grossNeededKES) : 0;

  // ── Sanity check — market rates ──
  let marketNote = '';
  if (hourlyRateUSD < 5)  marketNote = 'warning';
  else if (hourlyRateUSD < 15) marketNote = 'low';
  else if (hourlyRateUSD < 50) marketNote = 'competitive';
  else if (hourlyRateUSD < 100) marketNote = 'senior';
  else marketNote = 'expert';

  renderResults({
    targetKES, expensesKES, grossNeededKES, grossNeededUSD,
    chargeNeededUSD, hourlyRateUSD, hourlyRateKES,
    dailyRate, weeklyRate, monthlyRate,
    hoursPerWeek, hoursPerMonth, billableHours,
    platform, kraMonthly, usdRate,
    includeTax, marketNote, weeksOff,
  });
}

function renderResults(d) {
  const fmtUSD = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtKES = (n) => 'KES ' + n.toLocaleString('en-KE', { maximumFractionDigits: 0 });
  const fmtHr  = (n) => '$' + n.toFixed(2) + '/hr';

  // Hero rate
  document.getElementById('stat-hourly-usd').textContent  = fmtHr(d.hourlyRateUSD);
  document.getElementById('stat-hourly-kes').textContent  = fmtKES(d.hourlyRateKES) + '/hr';

  // Rate cards
  document.getElementById('stat-daily').textContent    = fmtUSD(d.dailyRate);
  document.getElementById('stat-weekly').textContent   = fmtUSD(d.weeklyRate);
  document.getElementById('stat-monthly').textContent  = fmtUSD(d.monthlyRate);

  document.getElementById('stat-daily-kes').textContent   = fmtKES(d.dailyRate * d.usdRate);
  document.getElementById('stat-weekly-kes').textContent  = fmtKES(d.weeklyRate * d.usdRate);
  document.getElementById('stat-monthly-kes').textContent = fmtKES(d.monthlyRate * d.usdRate);

  // Breakdown
  document.getElementById('bd-target').textContent     = fmtKES(d.targetKES);
  document.getElementById('bd-expenses').textContent   = fmtKES(d.expensesKES);
  document.getElementById('bd-tax').textContent        = d.includeTax ? fmtKES(d.kraMonthly) : 'Not included';
  document.getElementById('bd-gross-kes').textContent  = fmtKES(d.grossNeededKES);
  document.getElementById('bd-gross-usd').textContent  = fmtUSD(d.grossNeededUSD);
  document.getElementById('bd-platform').textContent   = `${(d.platform.fee * 100).toFixed(0)}% ${d.platform.label} fee`;
  document.getElementById('bd-charge').textContent     = fmtUSD(d.chargeNeededUSD);
  document.getElementById('bd-billable').textContent   = `${d.billableHours.toFixed(1)} hrs/mo (70% of ${d.hoursPerMonth.toFixed(1)})`;
  document.getElementById('bd-hourly').textContent     = fmtHr(d.hourlyRateUSD);

  // Market position note
  const noteEl   = document.getElementById('market-note');
  const notes = {
    warning:     { text: '⚠ Below $5/hr is below minimum viable for most freelance work. Consider if your target income is realistic or if you need more billable hours.', color: 'var(--danger)' },
    low:         { text: '📌 $5–$15/hr is entry-level on Upwork. This is achievable for beginners but aim to increase as you build reviews.', color: 'var(--warning)' },
    competitive: { text: '✓ $15–$50/hr is a competitive mid-level rate. Very achievable on Upwork and Fiverr with a solid profile.', color: 'var(--accent)' },
    senior:      { text: '⭐ $50–$100/hr is senior-level. Realistic on Toptal or direct clients. Requires strong portfolio and niche specialisation.', color: 'var(--accent)' },
    expert:      { text: '🏆 $100+/hr is expert/consultant territory. Achievable via direct clients, agencies, or Toptal with proven track record.', color: 'var(--accent)' },
  };
  const note = notes[d.marketNote];
  noteEl.textContent   = note.text;
  noteEl.style.color   = note.color;
  noteEl.style.borderColor = note.color + '44';
  noteEl.style.background  = note.color + '10';

  // Hours breakdown
  document.getElementById('hrs-week').textContent    = `${d.hoursPerWeek} hrs`;
  document.getElementById('hrs-weeks-off').textContent = `${d.weeksOff} weeks off/year`;
  document.getElementById('hrs-month').textContent   = `${d.hoursPerMonth.toFixed(1)} hrs`;
  document.getElementById('hrs-billable').textContent= `${d.billableHours.toFixed(1)} hrs`;

  const resultsEl = document.getElementById('results');
  resultsEl.classList.add('visible');
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  clearError();
}

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.style.display = 'block';
}

function clearError() {
  const el = document.getElementById('error-msg');
  if (el) el.style.display = 'none';
}