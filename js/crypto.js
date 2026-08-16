// ── MODERN EARNER — USDT → KES Converter ──
// Live rates fetched from CoinGecko public API (no key required)
// M-Pesa and exchange platform fee data — updated 2025/2026

// Excise duty on Virtual Asset Service Provider (VASP) fees — Finance Act 2025, effective 1 July 2025.
// Applies to the service fees charged by exchanges/brokers (Binance, Yellow Card, Paxful, BitPesa, etc.),
// not to the P2P/market spread, which isn't a charged fee. Still in force under Finance Act 2026.
const EXCISE_DUTY_ON_VASP_FEES = 0.10;

// Withdrawal/exchange platform fees
const PLATFORMS = {
  mpesa_binance: {
    label: 'Binance P2P → M-Pesa',
    exchangeFee: 0.001,      // 0.1% trading fee
    withdrawalFeeUSDT: 1.0,  // flat USDT fee to withdraw
    kesTransferFee: 0,
    note: 'Most popular route. P2P rate may vary from spot price by 1–3%.',
    p2pSpread: 0.02,         // 2% typical P2P spread above spot
  },
  mpesa_yellow: {
    label: 'Yellow Card → M-Pesa',
    exchangeFee: 0.015,
    withdrawalFeeUSDT: 0,
    kesTransferFee: 0,
    note: 'African-focused exchange. Regulated, beginner-friendly.',
    p2pSpread: 0.015,
  },
  mpesa_paxful: {
    label: 'Paxful P2P → M-Pesa',
    exchangeFee: 0.01,
    withdrawalFeeUSDT: 0,
    kesTransferFee: 0,
    note: 'P2P marketplace. Rates vary by seller.',
    p2pSpread: 0.025,
  },
  bank_bitpesa: {
    label: 'BitPesa (AZA Finance) → Bank',
    exchangeFee: 0.02,
    withdrawalFeeUSDT: 0,
    kesTransferFee: 0,
    note: 'Business-focused. Good for larger transfers.',
    p2pSpread: 0.01,
  },
  direct: {
    label: 'Direct OTC / Peer Trade',
    exchangeFee: 0,
    withdrawalFeeUSDT: 0,
    kesTransferFee: 0,
    note: 'No platform fee but carries counterparty risk. Use trusted contacts only.',
    p2pSpread: 0,
  },
};

// Default fallback rate (updated manually — live fetch attempted first)
let currentUSDTRate = 129.5;
let rateSource = 'default';
let lastFetched = null;

// Attempt to fetch live USDT/KES rate from CoinGecko
async function fetchLiveRate() {
  const statusEl = document.getElementById('rate-status');
  statusEl.textContent = 'Fetching live rate...';
  statusEl.style.color = 'var(--text-muted)';

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=kes',
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const rate = data?.tether?.kes;
    if (rate && rate > 0) {
      currentUSDTRate = rate;
      rateSource = 'live';
      lastFetched = new Date();
      statusEl.innerHTML = `✓ Live rate: <strong>1 USDT = KES ${rate.toFixed(2)}</strong> · Updated just now`;
      statusEl.style.color = 'var(--accent)';
      document.getElementById('manual-rate').placeholder = rate.toFixed(2);
    }
  } catch (e) {
    statusEl.innerHTML = `⚠ Live fetch failed — using default rate (KES ${currentUSDTRate}). Enter rate manually below.`;
    statusEl.style.color = 'var(--warning)';
  }
}

// Populate platform dropdown
window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('platform');
  Object.entries(PLATFORMS).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = val.label;
    select.appendChild(opt);
  });

  select.addEventListener('change', updatePlatformNote);
  fetchLiveRate();
});

function updatePlatformNote() {
  const key = document.getElementById('platform').value;
  const noteEl = document.getElementById('platform-note');
  if (key && PLATFORMS[key]) {
    noteEl.textContent = PLATFORMS[key].note;
    noteEl.style.display = 'block';
  } else {
    noteEl.style.display = 'none';
  }
}

function calculate() {
  const amountInput  = parseFloat(document.getElementById('usdt-amount').value);
  const manualRate   = parseFloat(document.getElementById('manual-rate').value);
  const platformKey  = document.getElementById('platform').value;

  if (!amountInput || amountInput <= 0) { showError('Please enter a USDT amount.'); return; }
  if (!platformKey)                      { showError('Please select a platform.'); return; }

  const platform   = PLATFORMS[platformKey];
  const spotRate   = manualRate > 0 ? manualRate : currentUSDTRate;

  // Effective rate after P2P spread
  const effectiveRate = spotRate * (1 - platform.p2pSpread);

  // Step 1: Deduct platform exchange fee
  const exchangeFeeUSDT = amountInput * platform.exchangeFee;
  const afterExchangeFee = amountInput - exchangeFeeUSDT;

  // Step 2: Deduct withdrawal fee (in USDT)
  const afterWithdrawal = afterExchangeFee - platform.withdrawalFeeUSDT;

  // Step 3: Convert to KES at effective rate
  const grossKES = afterWithdrawal * effectiveRate;

  // Step 4: Deduct KES transfer fee (if any)
  const afterTransferFee = grossKES - platform.kesTransferFee;

  // Step 5: Deduct excise duty on VASP fees (exchange fee + withdrawal fee + KES transfer fee)
  const exciseDutyKES = ((exchangeFeeUSDT + platform.withdrawalFeeUSDT) * spotRate + platform.kesTransferFee) * EXCISE_DUTY_ON_VASP_FEES;
  const netKES = afterTransferFee - exciseDutyKES;

  // Summary stats
  const totalFeesUSDT = exchangeFeeUSDT + platform.withdrawalFeeUSDT;
  const totalFeesKES  = totalFeesUSDT * spotRate + platform.kesTransferFee + (amountInput * platform.p2pSpread * spotRate) + exciseDutyKES;
  const effectivePct  = (totalFeesKES / (amountInput * spotRate) * 100);

  renderResults({
    amountInput, platform, platformKey,
    spotRate, effectiveRate,
    exchangeFeeUSDT, afterExchangeFee,
    afterWithdrawal, grossKES, exciseDutyKES, netKES,
    totalFeesUSDT, totalFeesKES, effectivePct,
  });
}

function renderResults(d) {
  const fmtUSDT = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const fmtKES  = (n) => 'KES ' + n.toLocaleString('en-KE', { maximumFractionDigits: 0 });
  const fmtPct  = (n) => n.toFixed(2) + '%';

  document.getElementById('stat-net-kes').textContent   = fmtKES(d.netKES);
  document.getElementById('stat-spot').textContent      = `KES ${d.spotRate.toFixed(2)}`;
  document.getElementById('stat-effective').textContent = `KES ${d.effectiveRate.toFixed(2)}`;
  document.getElementById('stat-fees-usd').textContent  = `$${fmtUSDT(d.totalFeesUSDT)}`;
  document.getElementById('stat-fees-pct').textContent  = fmtPct(d.effectivePct);

  // Breakdown
  document.getElementById('bd-input').textContent        = `${d.amountInput.toFixed(2)} USDT`;
  document.getElementById('bd-exchange-fee').textContent = `−${fmtUSDT(d.exchangeFeeUSDT)} USDT (${(d.platform.exchangeFee*100).toFixed(1)}%)`;
  document.getElementById('bd-withdrawal').textContent   = `−${d.platform.withdrawalFeeUSDT.toFixed(2)} USDT`;
  document.getElementById('bd-after').textContent        = `${fmtUSDT(d.afterWithdrawal)} USDT`;
  document.getElementById('bd-spread').textContent       = `${(d.platform.p2pSpread * 100).toFixed(1)}% below spot`;
  document.getElementById('bd-rate').textContent         = `KES ${d.effectiveRate.toFixed(2)} per USDT`;
  document.getElementById('bd-gross-kes').textContent    = fmtKES(d.grossKES);
  document.getElementById('bd-excise').textContent       = `−${fmtKES(d.exciseDutyKES)} (10% excise duty on VASP fees)`;
  document.getElementById('bd-net-kes').textContent      = fmtKES(d.netKES);

  // Comparison table — show all platforms for this amount
  const tbody = document.getElementById('compare-body');
  tbody.innerHTML = '';
  const spotRate = d.spotRate;
  const amt      = d.amountInput;

  Object.entries(PLATFORMS).forEach(([key, p]) => {
    const effRate    = spotRate * (1 - p.p2pSpread);
    const exchangeFeeUSDT = amt * p.exchangeFee;
    const after       = amt - exchangeFeeUSDT - p.withdrawalFeeUSDT;
    const excise      = ((exchangeFeeUSDT + p.withdrawalFeeUSDT) * spotRate + p.kesTransferFee) * EXCISE_DUTY_ON_VASP_FEES;
    const kes         = Math.max(0, after) * effRate - p.kesTransferFee - excise;
    const isActive = key === d.platformKey;

    const tr = document.createElement('tr');
    tr.style.fontWeight = isActive ? '600' : '400';
    tr.innerHTML = `
      <td style="color:${isActive ? 'var(--accent)' : 'var(--text-secondary)'}">${p.label}${isActive ? ' ✓' : ''}</td>
      <td style="text-align:right; font-weight:500">${fmtKES(kes)}</td>
    `;
    tbody.appendChild(tr);
  });

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