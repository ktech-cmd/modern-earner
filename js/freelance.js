// ── MODERN EARNER — Freelance Take-Home Calculator ──
// KRA Tax Brackets (Finance Act 2023, still in force) — verified against Finance Act 2026, July 2026
// Source: kra.go.ke
// TODO: Finance Act 2026 restructures these bands (10% to KES 360k/yr, 17.5% next 100k,
// 25% to ~6.07M, 27.5% above), effective 1 Jan 2027. Update KRA_BANDS then.

const KRA_BANDS = [
  { limit: 24000,   rate: 0.10 },
  { limit: 32333,   rate: 0.25 },
  { limit: 500000,  rate: 0.30 },
  { limit: 800000,  rate: 0.325 },
  { limit: Infinity, rate: 0.35 },
];

const PERSONAL_RELIEF_MONTHLY = 2400; // KES per month

// Upwork sliding fee structure
const UPWORK_FEES = [
  { limit: 500,      rate: 0.20 },
  { limit: 10000,    rate: 0.10 },
  { limit: Infinity, rate: 0.05 },
];

// Platform flat fees
const PLATFORM_FEES = {
  fiverr:  0.20,  // 20% flat
  toptal:  0.00,  // Toptal absorbs fee (already netted)
  direct:  0.00,  // Direct client — no platform fee
};

// Active tab state
let activeTab = 'upwork';

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

// ── KRA TAX CALCULATION ──
function calculateKRATax(monthlyKES) {
  let tax = 0;
  let prev = 0;

  for (const band of KRA_BANDS) {
    if (monthlyKES <= prev) break;
    const taxable = Math.min(monthlyKES, band.limit) - prev;
    tax += taxable * band.rate;
    prev = band.limit;
  }

  // Apply personal relief
  tax = Math.max(0, tax - PERSONAL_RELIEF_MONTHLY);
  return tax;
}

// ── UPWORK FEE CALCULATION ──
function calculateUpworkFee(grossUSD) {
  let fee = 0;
  let prev = 0;

  for (const tier of UPWORK_FEES) {
    if (grossUSD <= prev) break;
    const chunk = Math.min(grossUSD, tier.limit) - prev;
    fee += chunk * tier.rate;
    prev = tier.limit;
  }

  return fee;
}

// ── MAIN CALCULATE FUNCTION ──
function calculate() {
  const grossInput = parseFloat(document.getElementById('gross-usd').value);
  const rateInput  = parseFloat(document.getElementById('usd-rate').value);
  const period     = document.getElementById('period').value;

  if (!grossInput || grossInput <= 0) {
    showError('Please enter a valid earnings amount.');
    return;
  }

  // Normalise to monthly USD
  let grossUSD = grossInput;
  if (period === 'weekly')  grossUSD = grossInput * 4.33;
  if (period === 'annual')  grossUSD = grossInput / 12;

  const exchangeRate = rateInput || 129.5;

  // ── Platform fee ──
  let platformFeeUSD = 0;
  let platformLabel  = '';

  if (activeTab === 'upwork') {
    platformFeeUSD = calculateUpworkFee(grossUSD);
    platformLabel  = 'Upwork Fee (sliding 5–20%)';
  } else if (activeTab === 'fiverr') {
    platformFeeUSD = grossUSD * PLATFORM_FEES.fiverr;
    platformLabel  = 'Fiverr Fee (20% flat)';
  } else if (activeTab === 'toptal') {
    platformFeeUSD = 0;
    platformLabel  = 'Toptal Fee (absorbed)';
  } else {
    platformFeeUSD = 0;
    platformLabel  = 'Platform Fee';
  }

  const afterPlatformUSD = grossUSD - platformFeeUSD;

  // ── Convert to KES ──
  const grossKES        = grossUSD * exchangeRate;
  const platformFeeKES  = platformFeeUSD * exchangeRate;
  const afterPlatformKES = afterPlatformUSD * exchangeRate;

  // ── KRA Tax (on monthly KES income) ──
  const kraTax       = calculateKRATax(afterPlatformKES);
  const takeHomeKES  = afterPlatformKES - kraTax;
  const takeHomeUSD  = takeHomeKES / exchangeRate;
  const effectiveRate = ((platformFeeUSD + (kraTax / exchangeRate)) / grossUSD * 100).toFixed(1);

  // ── Render results ──
  renderResults({
    grossUSD, grossKES,
    platformFeeUSD, platformFeeKES, platformLabel,
    afterPlatformUSD, afterPlatformKES,
    kraTax,
    takeHomeKES, takeHomeUSD,
    effectiveRate,
    period,
    exchangeRate,
  });
}

function renderResults(d) {
  const fmt     = (n) => n.toLocaleString('en-KE', { maximumFractionDigits: 0 });
  const fmtUSD  = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Top stat cards
  document.getElementById('stat-takehome-kes').textContent  = `KES ${fmt(d.takeHomeKES)}`;
  document.getElementById('stat-takehome-usd').textContent  = `≈ $${fmtUSD(d.takeHomeUSD)}`;
  document.getElementById('stat-platform-fee').textContent  = `$${fmtUSD(d.platformFeeUSD)}`;
  document.getElementById('stat-platform-sub').textContent  = `KES ${fmt(d.platformFeeKES)}`;
  document.getElementById('stat-kra-tax').textContent       = `KES ${fmt(d.kraTax)}`;
  document.getElementById('stat-effective').textContent     = `${d.effectiveRate}%`;

  // Breakdown table
  document.getElementById('bd-gross').textContent           = `$${fmtUSD(d.grossUSD)} (KES ${fmt(d.grossKES)})`;
  document.getElementById('bd-platform').textContent        = `−$${fmtUSD(d.platformFeeUSD)} (KES ${fmt(d.platformFeeKES)})`;
  document.getElementById('bd-platform-label').textContent  = d.platformLabel;
  document.getElementById('bd-after-platform').textContent  = `$${fmtUSD(d.afterPlatformUSD)} (KES ${fmt(d.afterPlatformKES)})`;
  document.getElementById('bd-kra').textContent             = `−KES ${fmt(d.kraTax)}`;
  document.getElementById('bd-personal-relief').textContent = `+KES 2,400`;
  document.getElementById('bd-takehome').textContent        = `KES ${fmt(d.takeHomeKES)} ($${fmtUSD(d.takeHomeUSD)})`;

  // Tax bar — effective total deduction rate
  const barPct = Math.min(parseFloat(d.effectiveRate), 100);
  setTimeout(() => {
    document.getElementById('tax-bar-fill').style.width = barPct + '%';
  }, 100);

  // Show results
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
  el.style.display = 'none';
}

// Pre-fill USD rate on load
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('usd-rate').placeholder = '129.5 (default)';
});