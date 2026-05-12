/* flow-nav.js — Sticky Bottom Bar นำทาง flow 11 ขั้น
   เลือกลูกค้า → สินทรัพย์ → เกษียณ → การศึกษาบุตร → ประกันชีวิต
   → ประกันสุขภาพ → เป้าหมายชีวิต → ภาษี → ลำดับความสำคัญ
   → พอร์ตแนะนำ → สรุปแผน

   วิธีใช้: <script src="flow-nav.js"></script>
   สคริปต์จะเช็ค URL ปัจจุบัน → inject Sticky Bottom Bar อัตโนมัติ
*/
(function() {
  const FLOW_PAGES = [
    { file: 'clients.html',          icon: '👥', name: 'เลือกลูกค้า' },
    { file: 'assets.html',           icon: '💎', name: 'สินทรัพย์' },
    { file: 'retirement.html',       icon: '🛋️', name: 'เกษียณ' },
    { file: 'retirement2.html',      icon: '📊', name: 'สรุปแผนเกษียณ' },
    { file: 'education.html',        icon: '🎓', name: 'การศึกษาบุตร' },
    { file: 'education2.html',       icon: '🏫', name: 'ค่าเล่าเรียน ป.ตรี' },
    { file: 'life-insurance.html',   icon: '☂️', name: 'ประกันชีวิต' },
    { file: 'health-insurance.html', icon: '⚕️', name: 'ประกันสุขภาพ' },
    { file: 'goals.html',            icon: '🎯', name: 'เป้าหมายชีวิต' },
    { file: 'tax.html',              icon: '✂️', name: 'ภาษี' },
    { file: 'tax2.html',             icon: '✂️', name: 'ลดหย่อนภาษี' },
    { file: 'priority.html',         icon: '⭐', name: 'ลำดับความสำคัญ' },
    { file: 'portfolio.html',        icon: '📈', name: 'พอร์ตแนะนำ' },
    { file: 'plan_summary.html',     icon: '📋', name: 'สรุปแผน' },
  ];

  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const idx = FLOW_PAGES.findIndex(p => p.file.toLowerCase() === path);
  if (idx === -1) return;

  const prev = idx > 0 ? FLOW_PAGES[idx - 1] : null;
  const next = idx < FLOW_PAGES.length - 1 ? FLOW_PAGES[idx + 1] : null;
  const current = FLOW_PAGES[idx];

  function hasClientSelected() {
    const cid = localStorage.getItem('aia_selectedClient');
    if (!cid) return false;
    try {
      const uid = localStorage.getItem('aia_currentUser');
      const users = JSON.parse(localStorage.getItem('aia_users') || '[]');
      const u = users.find(x => x.id === uid);
      const clients = (u && u.data && u.data.clients) || [];
      return !!clients.find(c => c.id === cid);
    } catch (e) { return false; }
  }

  const css = `
    .flow-bar {
      position: fixed; bottom: 0; left: 240px; right: 0;
      z-index: 90; background: white;
      border-top: 1.5px solid #EAEAEA;
      box-shadow: 0 -4px 16px rgba(0,0,0,.06);
      display: flex;
      justify-content: space-between; align-items: center;
      padding: 12px 24px; gap: 16px;
      font-family: var(--font, 'Sarabun', system-ui, sans-serif);
    }
    /* Add bottom padding to main content so bar doesn't cover it */
    .app-main { padding-bottom: 80px !important; box-sizing: border-box; }

    .flow-bar-left, .flow-bar-right { display: flex; }

    .flow-bar-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 11px 22px; border: none; border-radius: 100px;
      font-family: inherit; font-weight: 800; font-size: .94rem;
      cursor: pointer; line-height: 1; white-space: nowrap;
      transition: all .15s; box-shadow: 0 2px 8px rgba(0,0,0,.08);
    }
    .flow-bar-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,.14); }
    .flow-bar-btn:active { transform: translateY(0); }
    .flow-bar-btn:disabled {
      opacity: .45; cursor: not-allowed; transform: none !important;
      box-shadow: 0 2px 6px rgba(0,0,0,.06) !important;
    }
    .flow-bar-btn-back {
      background: white; color: #444;
      border: 1.5px solid #DEE2E6;
    }
    .flow-bar-btn-back:hover { background: #F8F9FA; border-color: #ADB5BD; }
    .flow-bar-btn-next {
      background: linear-gradient(135deg, var(--red-primary, #D0021B), var(--red-dark, #9B0013));
      color: white;
    }
    .flow-bar-btn-next:hover {
      background: linear-gradient(135deg, #E91E36, var(--red-primary, #D0021B));
    }
    .flow-bar-arrow { font-size: 1.15rem; line-height: 1; }
    .flow-bar-btn-placeholder { width: 1px; }

    /* Responsive: mobile collapses sidebar; bar takes full width */
    @media (max-width: 900px) {
      .flow-bar { left: 0; padding: 10px 14px; gap: 8px; }
      .flow-bar-btn { padding: 9px 16px; font-size: .86rem; }
      .app-main { padding-bottom: 78px !important; }
    }
    @media (max-width: 520px) {
      .flow-bar-btn { padding: 8px 12px; font-size: .82rem; }
    }
  `;
  const style = document.createElement('style');
  style.id = 'flow-nav-style';
  style.textContent = css;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'flow-bar';
  bar.id = 'flow-bar';
  function goTo(file) { location.href = file; }
  window.__flowNavGoTo = goTo;

  const isFirstPage = (idx === 0);
  const nextDisabled = isFirstPage && !hasClientSelected();

  bar.innerHTML = `
    <div class="flow-bar-left">
      ${prev
        ? `<button class="flow-bar-btn flow-bar-btn-back" onclick="__flowNavGoTo('${prev.file}')" title="ย้อนกลับ — ${prev.name}">
             <span class="flow-bar-arrow">←</span>
             <span class="flow-bar-back-label">${prev.icon} ${prev.name}</span>
           </button>`
        : `<span class="flow-bar-btn-placeholder"></span>`}
    </div>
    <div class="flow-bar-right">
      ${next
        ? `<button class="flow-bar-btn flow-bar-btn-next" id="flow-nav-next-btn"
                  onclick="__flowNavGoTo('${next.file}')"
                  ${nextDisabled ? 'disabled' : ''}
                  title="${nextDisabled ? 'เลือกลูกค้าก่อน' : 'ถัดไป — ' + next.name}">
             <span class="flow-bar-next-label">${next.icon} ${next.name}</span>
             <span class="flow-bar-arrow">→</span>
           </button>`
        : `<span class="flow-bar-btn-placeholder"></span>`}
    </div>
  `;

  function inject() {
    if (document.body) document.body.appendChild(bar);
    else document.addEventListener('DOMContentLoaded', inject, { once: true });
  }
  inject();

  window.refreshFlowNav = function() {
    const btn = document.getElementById('flow-nav-next-btn');
    if (!btn || !isFirstPage) return;
    const ok = hasClientSelected();
    btn.disabled = !ok;
    btn.title = ok ? ('ถัดไป — ' + (next ? next.name : '')) : 'เลือกลูกค้าก่อน';
  };
  window.addEventListener('storage', e => {
    if (e.key === 'aia_selectedClient' || e.key === 'aia_users') {
      window.refreshFlowNav();
    }
  });
})();
