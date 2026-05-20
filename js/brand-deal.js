// ── MODERN EARNER — Brand Deal Rate Calculator ──
// "What should I charge for a sponsored post?"
// Based on industry CPE (Cost Per Engagement) benchmarks 2024/2025

// Platform base rates per 1000 followers (USD) — industry benchmarks
const PLATFORMS = {
  instagram_post: {
    label: 'Instagram Post',
    icon: '📸',
    baseRatePer1K: 10,
    engagementWeight: 2.0,
    note: 'Static posts. Rate drops significantly above 100K followers.',
  },
  instagram_reel: {
    label: 'Instagram Reel',
    icon: '🎬',
    baseRatePer1K: 14,
    engagementWeight: 2.2,
    note: 'Reels get more reach than static posts — charge 20–40% more.',
  },
  instagram_story: {
    label: 'Instagram Stories (set of 3)',
    icon: '⭕',
    baseRatePer1K: 5,
    engagementWeight: 1.5,
    note: 'Stories disappear in 24hrs — typically priced lower than posts.',
  },
  tiktok_video: {
    label: 'TikTok Video',
    icon: '♪',
    baseRatePer1K: 8,
    engagementWeight: 1.8,
    note: 'TikTok has high organic reach — brands pay for views, not just followers.',
  },
  youtube_integration: {
    label: 'YouTube Integration (mid-roll)',
    icon: '▶',
    baseRatePer1K: 20,
    engagementWeight: 2.5,
    note: 'YouTube integrations command the highest rates. 60-sec mid-roll is standard.',
  },
  youtube_dedicated: {
    label: 'YouTube Dedicated Video',
    icon: '📹',
    baseRatePer1K: 40,
    engagementWeight: 3.0,
    note: 'Entire video is about the brand. Charge 2–3× your integration rate.',
  },
  twitter_x: {
    label: 'X / Twitter Post',
    icon: '𝕏',
    baseRatePer1K: 3,
    engagementWeight: 1.2,
    note: 'Twitter/X rates have dropped significantly. Best bundled with other platforms.',
  },
  linkedin: {
    label: 'LinkedIn Post',
    icon: '💼',
    baseRatePer1K: 12,
    engagementWeight: 2.0,
    note: 'B2B audience commands premium rates despite lower follower counts.',
  },
};

// Niche multipliers — how much brands pay relative to lifestyle baseline
const NICHE_MULTIPLIERS = {
  finance:     { label: 'Finance & Investing',       mult: 2.2 },
  tech:        { label: 'Tech & Software (B2B/SaaS)', mult: 2.0 },
  business:    { label: 'Business & Entrepreneurship', mult: 1.8 },
  health:      { label: 'Health & Wellness',          mult: 1.6 },
  beauty:      { label: 'Beauty & Fashion',           mult: 1.5 },
  food:        { label: 'Food & Cooking',             mult: 1.3 },
  travel:      { label: 'Travel',                     mult: 1.4 },
  fitness:     { label: 'Fitness & Sport',            mult: 1.5 },
  parenting:   { label: 'Parenting & Family',         mult: 1.3 },
  gaming:      { label: 'Gaming',                     mult: 1.2 },
  lifestyle:   { label: 'Lifestyle & Vlogs',          mult: 1.0 },
  education:   { label: 'Education & How-To',         mult: 1.4 },
  crypto:      { label: 'Crypto & Web3',              mult: 1.9 },
};

// Audience location multiplier (brands pay more for purchasing-power audiences)
const LOCATION_MULTIPLIERS = {
  us:    { label: 'United States 🇺🇸', mult: 1.00 },
  uk:    { label: 'United Kingdom 🇬🇧', mult: 0.85 },
  ca:    { label: 'Canada 🇨🇦',         mult: 0.80 },
  au:    { label: 'Australia 🇦🇺',      mult: 0.78 },
  eu:    { label: 'Europe (mixed) 🇪🇺', mult: 0.70 },
  ke:    { label: 'Kenya 🇰🇪',          mult: 0.25 },
  ng:    { label: 'Nigeria 🇳🇬',        mult: 0.22 },
  za:    { label: 'South Africa 🇿🇦',   mult: 0.35 },
  in:    { label: 'India 🇮🇳',          mult: 0.20 },
  ph:    { label: 'Philippines 🇵🇭',    mult: 0.22 },
  mixed: { label: 'Mixed / Global 🌍',  mult: 0.50 },
};

// Engagement rate benchmarks by platform (good = above average)
const ENGAGEMENT_BENCHMARKS = {
  instagram_post:    { low: 1, avg: 3,  good: 6  },
  instagram_reel:    { low: 2, avg: 5,  good: 10 },
  instagram_story:   { low: 1, avg: 3,  good: 7  },
  tiktok_video:      { low: 3, avg: 8,  good: 15 },
  youtube_integration:{ low: 1, avg: 3, good: 6  },
  youtube_dedicated: { low: 1, avg: 3,  good: 6  },
  twitter_x:         { low: 0.5, avg: 1, good: 3 },
  linkedin:          { low: 1, avg: 3,  good: 7  },
};

// Populate dropdowns
window.addEventListener('DOMContentLoaded', () => {
  const platformSelect = document.getElementById('platform');
  Object.entries(PLATFORMS).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${val.icon}  ${val.label}`;
    platformSelect.appendChild(opt);
  });

  const nicheSelect = document.getElementById('niche');
  Object.entries(NICHE_MULTIPLIERS).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = val.label;
    if (key === 'lifestyle') opt.selected = true;
    nicheSelect.appendChild(opt);
  });

  const locationSelect = document.getElementById('audience-location');
  Object.entries(LOCATION_MULTIPLIERS).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = val.label;
    if (key === 'mixed') opt.selected = true;
    locationSelect.appendChild(opt);
  });

  // Show platform note on change
  platformSelect.addEventListener('change', updatePlatformNote);
});

function updatePlatformNote() {
  const key = document.getElementById('platform').value;
  const noteEl = document.getElementById('platform-note');
  if (key && PLATFORMS[key]) {
    noteEl.textContent = PLATFORMS[key].note;
    noteEl.style.display = 'block';
  }
}

function getEngagementScore(platformKey, engRate) {
  const bench = ENGAGEMENT_BENCHMARKS[platformKey];
  if (!bench) return 1.0;
  if (engRate >= bench.good) return 1.5;
  if (engRate >= bench.avg)  return 1.2;
  if (engRate >= bench.low)  return 1.0;
  return 0.8; // below average
}

function calculate() {
  const followers   = parseFloat(document.getElementById('followers').value);
  const engRate     = parseFloat(document.getElementById('engagement-rate').value);
  const platformKey = document.getElementById('platform').value;
  const nicheKey    = document.getElementById('niche').value;
  const locationKey = document.getElementById('audience-location').value;
  const usdRate     = parseFloat(document.getElementById('usd-rate').value) || 129.5;

  if (!followers || followers < 1000) { showError('Please enter your follower count (minimum 1,000).'); return; }
  if (!engRate   || engRate <= 0)     { showError('Please enter your engagement rate.'); return; }
  if (!platformKey)                   { showError('Please select a platform.'); return; }

  const platform = PLATFORMS[platformKey];
  const niche    = NICHE_MULTIPLIERS[nicheKey];
  const location = LOCATION_MULTIPLIERS[locationKey];

  const followersK = followers / 1000;

  // ── Base rate ──
  // Follower scaling: rate per 1K decreases at scale (mega influencers get less per follower)
  let scaleFactor = 1.0;
  if (followers > 1000000) scaleFactor = 0.5;
  else if (followers > 500000) scaleFactor = 0.65;
  else if (followers > 100000) scaleFactor = 0.80;
  else if (followers > 50000)  scaleFactor = 0.90;

  const baseRate = followersK * platform.baseRatePer1K * scaleFactor;

  // ── Engagement multiplier ──
  const engScore = getEngagementScore(platformKey, engRate);
  const engMultiplier = 1 + ((engScore - 1) * platform.engagementWeight * 0.5);

  // ── Final rate ──
  const rateUSD = baseRate * engMultiplier * niche.mult * location.mult;

  // ── Range ── (±25%)
  const rateLow  = rateUSD * 0.75;
  const rateHigh = rateUSD * 1.35;

  // ── Package rates ──
  const packageRates = {
    single:   rateUSD,
    bundle3:  rateUSD * 2.5,   // 3 posts at discount
    monthly:  rateUSD * 4,     // monthly retainer
    exclusive: rateUSD * 6,    // exclusivity in niche
  };

  // ── Engagement label ──
  const bench = ENGAGEMENT_BENCHMARKS[platformKey] || {};
  let engLabel = 'Average';
  if (engRate >= (bench.good || 6))     engLabel = '🔥 Excellent';
  else if (engRate >= (bench.avg || 3)) engLabel = '✓ Good';
  else if (engRate >= (bench.low || 1)) engLabel = 'Average';
  else engLabel = '⚠ Below average';

  renderResults({
    followers, engRate, engLabel,
    platform, niche, location,
    rateUSD, rateLow, rateHigh,
    packageRates, usdRate,
    scaleFactor, engScore,
  });
}

function renderResults(d) {
  const fmtUSD = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtKES = (n) => 'KES ' + (n * d.usdRate).toLocaleString('en-KE', { maximumFractionDigits: 0 });

  // Hero
  document.getElementById('stat-rate-low').textContent  = fmtUSD(d.rateLow);
  document.getElementById('stat-rate-mid').textContent  = fmtUSD(d.rateUSD);
  document.getElementById('stat-rate-high').textContent = fmtUSD(d.rateHigh);

  document.getElementById('stat-kes-low').textContent  = fmtKES(d.rateLow);
  document.getElementById('stat-kes-mid').textContent  = fmtKES(d.rateUSD);
  document.getElementById('stat-kes-high').textContent = fmtKES(d.rateHigh);

  // Packages
  document.getElementById('pkg-single').textContent    = fmtUSD(d.packageRates.single);
  document.getElementById('pkg-bundle').textContent    = fmtUSD(d.packageRates.bundle3);
  document.getElementById('pkg-monthly').textContent   = fmtUSD(d.packageRates.monthly);
  document.getElementById('pkg-exclusive').textContent = fmtUSD(d.packageRates.exclusive);

  document.getElementById('pkg-single-kes').textContent   = fmtKES(d.packageRates.single);
  document.getElementById('pkg-bundle-kes').textContent   = fmtKES(d.packageRates.bundle3);
  document.getElementById('pkg-monthly-kes').textContent  = fmtKES(d.packageRates.monthly);
  document.getElementById('pkg-exclusive-kes').textContent= fmtKES(d.packageRates.exclusive);

  // Details
  document.getElementById('bd-platform').textContent  = `${d.platform.icon} ${d.platform.label}`;
  document.getElementById('bd-niche').textContent     = d.niche.label;
  document.getElementById('bd-location').textContent  = d.location.label;
  document.getElementById('bd-followers').textContent = d.followers.toLocaleString();
  document.getElementById('bd-engagement').textContent= `${d.engRate}% — ${d.engLabel}`;
  document.getElementById('bd-niche-mult').textContent= `${d.niche.mult}× baseline`;
  document.getElementById('bd-loc-mult').textContent  = `${(d.location.mult * 100).toFixed(0)}% of US rates`;

  // Negotiation tips
  const tipsEl = document.getElementById('negotiation-tips');
  let tips = [];
  if (d.engRate >= (ENGAGEMENT_BENCHMARKS[Object.keys(PLATFORMS).find(k => PLATFORMS[k] === d.platform)]?.good || 6)) {
    tips.push('Your engagement rate is excellent — lead with this stat in pitches. High engagement = better ROI for brands.');
  }
  if (d.location.mult < 0.4) {
    tips.push('Your audience location lowers your rate. Counter this by emphasising purchasing intent and niche authority rather than raw follower count.');
  }
  if (d.followers < 10000) {
    tips.push('Micro-influencers (under 10K) often have better engagement than larger accounts. Position yourself as a niche specialist, not a mass-reach creator.');
  }
  if (d.niche.mult >= 1.8) {
    tips.push('Your niche attracts high-value advertisers. Finance and tech brands have large marketing budgets — don\'t undersell.');
  }
  tips.push('Always ask for a usage rights fee if the brand wants to repurpose your content in their own ads.');
  tips.push('Never accept gifting-only deals unless you genuinely want the product. Your rate should reflect your audience\'s trust.');

  tipsEl.innerHTML = tips.slice(0, 4).map(t => `<li>${t}</li>`).join('');

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