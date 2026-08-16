// ── MODERN EARNER — YouTube / AdSense Revenue Estimator ──
// CPM/RPM data based on industry averages (2025/2026)
// RPM = Revenue Per Mille (per 1000 views after YouTube's 45% cut)

// Niche RPM ranges [min, max] in USD
const NICHE_RPM = {
  finance:       { label: 'Finance & Investing',         rpm: [9,   25],  emoji: '💰' },
  saas:          { label: 'SaaS & B2B Marketing',        rpm: [8,   22],  emoji: '🚀' },
  business:      { label: 'Business & Entrepreneurship', rpm: [6.5, 18],  emoji: '📊' },
  crypto:        { label: 'Crypto & Web3',               rpm: [5,   16],  emoji: '₿'  },
  tech:          { label: 'Tech, AI & Software',         rpm: [5,   14],  emoji: '💻' },
  education:     { label: 'Education & How-To',          rpm: [3.5, 10],  emoji: '📚' },
  health:        { label: 'Health & Fitness',            rpm: [3,    9],  emoji: '🏃' },
  travel:        { label: 'Travel',                      rpm: [2.5,  8],  emoji: '✈️' },
  beauty:        { label: 'Beauty & Fashion',            rpm: [2.5, 7.5], emoji: '💄' },
  food:          { label: 'Food & Cooking',              rpm: [2,    7],  emoji: '🍳' },
  lifestyle:     { label: 'Lifestyle & Vlogs',           rpm: [1.5, 5.5], emoji: '✨' },
  news:          { label: 'News & Politics',             rpm: [2,    6],  emoji: '📰' },
  kids:          { label: "Kids & Family",               rpm: [1.5,  5],  emoji: '👨‍👩‍👧' },
  gaming:        { label: 'Gaming',                      rpm: [1,  4.5],  emoji: '🎮' },
  entertainment: { label: 'Entertainment & Comedy',      rpm: [1,  4.5],  emoji: '🎭' },
};

// Audience location multipliers (relative to US = 1.0)
const COUNTRY_MULTIPLIERS = {
  us:   { label: 'United States 🇺🇸',   mult: 1.00 },
  uk:   { label: 'United Kingdom 🇬🇧',  mult: 0.85 },
  ca:   { label: 'Canada 🇨🇦',          mult: 0.80 },
  au:   { label: 'Australia 🇦🇺',       mult: 0.80 },
  de:   { label: 'Germany 🇩🇪',         mult: 0.75 },
  in:   { label: 'India 🇮🇳',           mult: 0.25 },
  ng:   { label: 'Nigeria 🇳🇬',         mult: 0.18 },
  ke:   { label: 'Kenya 🇰🇪',           mult: 0.15 },
  ph:   { label: 'Philippines 🇵🇭',     mult: 0.20 },
  pk:   { label: 'Pakistan 🇵🇰',        mult: 0.15 },
  mixed:{ label: 'Mixed / Global 🌍',   mult: 0.50 },
};

// Populate niche dropdown on load
window.addEventListener('DOMContentLoaded', () => {
  const nicheSelect = document.getElementById('niche');
  Object.entries(NICHE_RPM).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${val.emoji}  ${val.label}`;
    nicheSelect.appendChild(opt);
  });

  const countrySelect = document.getElementById('audience-country');
  Object.entries(COUNTRY_MULTIPLIERS).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = val.label;
    if (key === 'mixed') opt.selected = true;
    countrySelect.appendChild(opt);
  });
});

function calculate() {
  const views      = parseFloat(document.getElementById('monthly-views').value);
  const nicheKey   = document.getElementById('niche').value;
  const countryKey = document.getElementById('audience-country').value;
  const ctrInput   = parseFloat(document.getElementById('ctr').value) || 50;

  if (!views || views <= 0) {
    showError('Please enter your monthly views.');
    return;
  }
  if (!nicheKey) {
    showError('Please select your niche.');
    return;
  }

  const niche   = NICHE_RPM[nicheKey];
  const country = COUNTRY_MULTIPLIERS[countryKey];

  // Monetised views (CTR = % of views that are monetised)
  const monetisedRate = Math.min(ctrInput / 100, 1);
  const monetisedViews = views * monetisedRate;

  // RPM range adjusted for audience location
  const rpmMin = niche.rpm[0] * country.mult;
  const rpmMax = niche.rpm[1] * country.mult;
  const rpmMid = (rpmMin + rpmMax) / 2;

  // Monthly revenue (RPM is per 1000 views)
  const revenueMin = (monetisedViews / 1000) * rpmMin;
  const revenueMid = (monetisedViews / 1000) * rpmMid;
  const revenueMax = (monetisedViews / 1000) * rpmMax;

  // KES conversion
  const kesRate = 129.5;

  renderResults({
    views, monetisedViews, nicheKey, niche, country,
    rpmMin, rpmMid, rpmMax,
    revenueMin, revenueMid, revenueMax,
    kesRate,
  });
}

function renderResults(d) {
  const fmt    = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtUSD = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtKES = (n) => 'KES ' + n.toLocaleString('en-KE', { maximumFractionDigits: 0 });

  // Stat cards
  document.getElementById('stat-low').textContent    = fmtUSD(d.revenueMin);
  document.getElementById('stat-mid').textContent    = fmtUSD(d.revenueMid);
  document.getElementById('stat-high').textContent   = fmtUSD(d.revenueMax);

  document.getElementById('stat-low-kes').textContent  = fmtKES(d.revenueMin * d.kesRate);
  document.getElementById('stat-mid-kes').textContent  = fmtKES(d.revenueMid * d.kesRate);
  document.getElementById('stat-high-kes').textContent = fmtKES(d.revenueMax * d.kesRate);

  // Annual
  document.getElementById('annual-low').textContent  = fmtUSD(d.revenueMin * 12);
  document.getElementById('annual-mid').textContent  = fmtUSD(d.revenueMid * 12);
  document.getElementById('annual-high').textContent = fmtUSD(d.revenueMax * 12);

  // Details
  document.getElementById('bd-views').textContent      = fmt(d.views);
  document.getElementById('bd-monetised').textContent  = fmt(d.monetisedViews);
  document.getElementById('bd-rpm-low').textContent    = '$' + d.rpmMin.toFixed(2);
  document.getElementById('bd-rpm-high').textContent   = '$' + d.rpmMax.toFixed(2);
  document.getElementById('bd-niche').textContent      = `${d.niche.emoji} ${d.niche.label}`;
  document.getElementById('bd-country').textContent    = d.country.label;
  document.getElementById('bd-multiplier').textContent = (d.country.mult * 100).toFixed(0) + '% of US rates';

  // Milestone rows
  const milestones = [
    { views: 10000,   label: '10K views/mo' },
    { views: 50000,   label: '50K views/mo' },
    { views: 100000,  label: '100K views/mo' },
    { views: 500000,  label: '500K views/mo' },
    { views: 1000000, label: '1M views/mo' },
  ];

  const tbody = document.getElementById('milestone-body');
  tbody.innerHTML = '';
  const rpmMid = d.rpmMid;
  const moRate = d.monetisedViews > 0 ? (d.monetisedViews / d.views) : 0.5;

  milestones.forEach(m => {
    const rev = (m.views * moRate / 1000) * rpmMid;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-secondary)">${m.label}</td>
      <td>${fmtUSD(rev)}/mo</td>
      <td style="color:var(--text-muted)">${fmtKES(rev * d.kesRate)}/mo</td>
    `;
    tbody.appendChild(tr);
  });

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
  if (el) el.style.display = 'none';
}