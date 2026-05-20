// ── MODERN EARNER — Inflation Impact Calculator ──
// Kenya CPI data sourced from Kenya National Bureau of Statistics (KNBS)
// Global data from World Bank / IMF

// Annual inflation rates by country (approximate averages per year)
const INFLATION_DATA = {
  ke: {
    label: 'Kenya 🇰🇪', currency: 'KES', symbol: 'KES ',
    rates: {
      2010: 3.96, 2011: 14.02, 2012: 9.38, 2013: 5.72, 2014: 6.88,
      2015: 6.58, 2016: 6.31, 2017: 8.00, 2018: 4.69, 2019: 5.22,
      2020: 5.37, 2021: 6.11, 2022: 7.66, 2023: 6.30, 2024: 4.50,
    }
  },
  ng: {
    label: 'Nigeria 🇳🇬', currency: 'NGN', symbol: '₦',
    rates: {
      2010: 13.72, 2011: 10.84, 2012: 12.22, 2013: 8.48, 2014: 8.06,
      2015: 9.01,  2016: 15.68, 2017: 16.52, 2018: 12.09, 2019: 11.40,
      2020: 13.25, 2021: 17.01, 2022: 19.64, 2023: 24.66, 2024: 28.92,
    }
  },
  us: {
    label: 'United States 🇺🇸', currency: 'USD', symbol: '$',
    rates: {
      2010: 1.64, 2011: 3.16, 2012: 2.07, 2013: 1.46, 2014: 1.62,
      2015: 0.12, 2016: 1.26, 2017: 2.13, 2018: 2.44, 2019: 1.81,
      2020: 1.23, 2021: 4.70, 2022: 8.00, 2023: 4.12, 2024: 2.90,
    }
  },
  uk: {
    label: 'United Kingdom 🇬🇧', currency: 'GBP', symbol: '£',
    rates: {
      2010: 3.30, 2011: 4.50, 2012: 2.80, 2013: 2.60, 2014: 1.50,
      2015: 0.00, 2016: 0.70, 2017: 2.70, 2018: 2.50, 2019: 1.80,
      2020: 0.85, 2021: 2.52, 2022: 9.07, 2023: 7.30, 2024: 2.50,
    }
  },
  gh: {
    label: 'Ghana 🇬🇭', currency: 'GHS', symbol: 'GHS ',
    rates: {
      2010: 10.71, 2011: 8.73, 2012: 9.16, 2013: 11.67, 2014: 15.49,
      2015: 17.15, 2016: 17.46, 2017: 12.37, 2018: 9.84,  2019: 7.14,
      2020: 9.89,  2021: 10.00, 2022: 31.26, 2023: 38.11, 2024: 22.00,
    }
  },
  za: {
    label: 'South Africa 🇿🇦', currency: 'ZAR', symbol: 'R',
    rates: {
      2010: 4.26, 2011: 5.00, 2012: 5.66, 2013: 5.76, 2014: 6.14,
      2015: 4.62, 2016: 6.34, 2017: 5.27, 2018: 4.61, 2019: 4.13,
      2020: 3.30, 2021: 4.61, 2022: 6.87, 2023: 5.90, 2024: 4.68,
    }
  },
};

const MIN_YEAR = 2010;
const MAX_YEAR = 2024;

// Populate dropdowns
window.addEventListener('DOMContentLoaded', () => {
  const countrySelect = document.getElementById('country');
  Object.entries(INFLATION_DATA).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = val.label;
    if (key === 'ke') opt.selected = true;
    countrySelect.appendChild(opt);
  });

  const fromSelect = document.getElementById('from-year');
  const toSelect   = document.getElementById('to-year');

  for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
    const o1 = document.createElement('option');
    o1.value = y; o1.textContent = y;
    if (y === 2020) o1.selected = true;
    fromSelect.appendChild(o1);

    const o2 = document.createElement('option');
    o2.value = y; o2.textContent = y;
    if (y === MAX_YEAR) o2.selected = true;
    toSelect.appendChild(o2);
  }
});

function calculate() {
  const amount     = parseFloat(document.getElementById('amount').value);
  const fromYear   = parseInt(document.getElementById('from-year').value);
  const toYear     = parseInt(document.getElementById('to-year').value);
  const countryKey = document.getElementById('country').value;

  if (!amount || amount <= 0) { showError('Please enter a valid amount.'); return; }
  if (fromYear >= toYear)     { showError('Start year must be before end year.'); return; }

  const country = INFLATION_DATA[countryKey];

  // Compound the inflation year by year
  let value = amount;
  const yearlyData = [];

  for (let y = fromYear; y < toYear; y++) {
    const rate = (country.rates[y] || 5) / 100;
    const prev = value;
    value = value * (1 + rate);
    yearlyData.push({ year: y, rate: country.rates[y] || 5, value });
  }

  const totalInflation = ((value - amount) / amount * 100);
  const years          = toYear - fromYear;
  const avgRate        = (Math.pow(value / amount, 1 / years) - 1) * 100;
  const powerLoss      = 100 - (amount / value * 100);

  renderResults({
    amount, fromYear, toYear, country,
    finalValue: value,
    totalInflation,
    avgRate,
    powerLoss,
    yearlyData,
  });
}

function renderResults(d) {
  const sym = d.country.symbol;
  const fmt = (n) => n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  document.getElementById('stat-then').textContent     = `${sym}${fmt(d.amount)}`;
  document.getElementById('stat-now').textContent      = `${sym}${fmt(d.finalValue)}`;
  document.getElementById('stat-loss').textContent     = `${d.powerLoss.toFixed(1)}%`;
  document.getElementById('stat-inflation').textContent= `${d.totalInflation.toFixed(1)}%`;
  document.getElementById('stat-avg').textContent      = `${d.avgRate.toFixed(2)}%/yr`;
  document.getElementById('stat-years').textContent    = `${d.toYear - d.fromYear} years`;

  document.getElementById('summary-text').innerHTML =
    `<strong>${sym}${fmt(d.amount)}</strong> in <strong>${d.fromYear}</strong> has the same purchasing power as ` +
    `<strong>${sym}${fmt(d.finalValue)}</strong> in <strong>${d.toYear}</strong>. ` +
    `You've lost <strong>${d.powerLoss.toFixed(1)}%</strong> of purchasing power over ${d.toYear - d.fromYear} years.`;

  // Year by year table
  const tbody = document.getElementById('yearly-body');
  tbody.innerHTML = '';
  d.yearlyData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-secondary)">${row.year}</td>
      <td style="color:var(--warning)">${row.rate.toFixed(2)}%</td>
      <td style="font-weight:500">${sym}${fmt(row.value)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Power bar
  const barPct = Math.min(d.powerLoss, 100);
  setTimeout(() => {
    document.getElementById('power-bar-fill').style.width = barPct + '%';
  }, 100);

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