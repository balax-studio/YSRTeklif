// ── YSR Utilities & Helpers ─────────────────────────────────────

// Debounce helper function for performance optimization
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Shakes a DOM element for error animations
function shakeElement(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('shake-error');
    void el.offsetWidth; // Trigger reflow
    el.classList.add('shake-error');
    setTimeout(() => el.classList.remove('shake-error'), 400);
  }
}

// Generates relative time formatting for 2026 UX
function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return '';
  const now = new Date();
  const diffInMs = date - now;
  const isFuture = diffInMs > 0;
  const absDiffMs = Math.abs(diffInMs);
  
  const diffInMins = Math.floor(absDiffMs / 60000);
  const diffInHours = Math.floor(absDiffMs / 3600000);
  const diffInDays = Math.floor(absDiffMs / 86400000);

  if (diffInMins < 1) return 'Az önce';
  if (isFuture) {
    if (diffInMins < 60) return `${diffInMins} dk sonra`;
    if (diffInHours < 24) return `${diffInHours} saat sonra`;
    if (diffInDays === 1) return 'Yarın';
    if (diffInDays < 7) return `${diffInDays} gün sonra`;
  } else {
    if (diffInMins < 60) return `${diffInMins} dk önce`;
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInDays === 1) return 'Dün';
    if (diffInDays < 7) return `${diffInDays} gün önce`;
  }
  return date.toLocaleDateString('tr-TR');
}

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeJS(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Expose functions globally
window.debounce = debounce;
window.shakeElement = shakeElement;
window.getRelativeTime = getRelativeTime;
window.escapeHTML = escapeHTML;
window.escapeJS = escapeJS;
