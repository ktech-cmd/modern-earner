// ── EARNER TOOLS — Theme Toggle ──
// Default: light. User preference saved in localStorage.

var STORAGE_KEY = 'et-theme';

function getSavedTheme() {
  try { return localStorage.getItem(STORAGE_KEY) || 'light'; }
  catch(e) { return 'light'; }
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.querySelectorAll('.theme-toggle').forEach(function(btn) {
    var icon  = btn.querySelector('.icon');
    var label = btn.querySelector('.label');
    if (icon)  icon.textContent  = theme === 'dark' ? '☀️' : '🌙';
    if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
  });
}

function toggleTheme() {
  var current = getSavedTheme();
  var next    = current === 'light' ? 'dark' : 'light';
  try { localStorage.setItem(STORAGE_KEY, next); } catch(e) {}
  applyTheme(next);
}

document.addEventListener('DOMContentLoaded', function() {
  applyTheme(getSavedTheme());
});
