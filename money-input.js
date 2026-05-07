/* ════════════════════════════════════════════
   MONEY INPUT FORMATTER — comma separators
   Usage:
     1. Add class "money-fmt" to <input> elements
     2. Read value with parseMoney(el) instead of Number(el.value)
     3. Auto-formats on input event with cursor preservation
═══════════════════════════════════════════ */

(function() {
  if (window.parseMoney) return; // already loaded

  window.parseMoney = function(strOrEl) {
    const v = (typeof strOrEl === 'string') ? strOrEl : (strOrEl && strOrEl.value) || '';
    return Number(String(v).replace(/[^\d.-]/g, '')) || 0;
  };

  function formatMoneyInput(el) {
    if (!el) return;
    const before = el.value || '';
    const cursorPos = el.selectionStart || 0;
    const commasBefore = (before.slice(0, cursorPos).match(/,/g) || []).length;
    let raw = before.replace(/[^\d.-]/g, '');
    const parts = raw.split('.');
    if (parts.length > 1) raw = parts[0] + '.' + parts.slice(1).join('').slice(0, 2);
    if (raw === '' || raw === '-') { el.value = raw; return; }
    const [intPart, decPart] = raw.split('.');
    const intFormatted = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = decPart != null ? intFormatted + '.' + decPart : intFormatted;
    el.value = formatted;
    const commasAfter = (formatted.slice(0, cursorPos).match(/,/g) || []).length;
    const newPos = cursorPos + (commasAfter - commasBefore);
    try { el.setSelectionRange(newPos, newPos); } catch(e) {}
  }
  window.formatMoneyInput = formatMoneyInput;

  function initMoneyInput(el) {
    if (!el || el._moneyInit) return;
    el._moneyInit = true;
    if (el.type === 'number') el.type = 'text';
    if (!el.hasAttribute('inputmode')) el.setAttribute('inputmode', 'decimal');
    el.classList.add('money-fmt');
    if (el.value !== '' && el.value != null) formatMoneyInput(el);
  }
  window.initMoneyInput = initMoneyInput;

  function refreshAllMoneyInputs() {
    document.querySelectorAll('input.money-fmt').forEach(initMoneyInput);
  }
  window.refreshAllMoneyInputs = refreshAllMoneyInputs;

  // Global delegation
  document.addEventListener('input', function(e) {
    if (e.target && e.target.classList && e.target.classList.contains('money-fmt')) {
      formatMoneyInput(e.target);
    }
  }, true);

  // Re-init when DOM updates (for dynamically rendered inputs)
  if (document.body) {
    new MutationObserver(refreshAllMoneyInputs).observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      refreshAllMoneyInputs();
      new MutationObserver(refreshAllMoneyInputs).observe(document.body, { childList: true, subtree: true });
    });
  }

  // Initial pass
  if (document.readyState !== 'loading') {
    refreshAllMoneyInputs();
  } else {
    document.addEventListener('DOMContentLoaded', refreshAllMoneyInputs);
  }

  // Add CSS once
  if (!document.getElementById('money-input-styles')) {
    const style = document.createElement('style');
    style.id = 'money-input-styles';
    style.textContent = '.money-fmt { text-align: right; font-variant-numeric: tabular-nums; }';
    document.head.appendChild(style);
  }
})();
