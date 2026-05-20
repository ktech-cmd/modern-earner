// ── MODERN EARNER — Theme Toggle ──

var STORAGE_KEY = 'me-theme';

function getSavedTheme() {
  try { return localStorage.getItem(STORAGE_KEY) || 'dark'; }
  catch(e) { return 'dark'; }
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }

  document.querySelectorAll('.theme-toggle').forEach(function(btn) {
    var icon  = btn.querySelector('.icon');
    var label = btn.querySelector('.label');
    if (icon)  icon.textContent  = theme === 'light' ? '🌙' : '☀️';
    if (label) label.textContent = theme === 'light' ? 'Dark' : 'Light';
  });
}

function toggleTheme() {
  var current = getSavedTheme();
  var next    = current === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(STORAGE_KEY, next); } catch(e) {}
  applyTheme(next);
}

document.addEventListener('DOMContentLoaded', function() {
  applyTheme(getSavedTheme());
});