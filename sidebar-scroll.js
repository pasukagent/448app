/* sidebar-scroll.js
   จำตำแหน่ง scroll ของ .app-sidebar ระหว่างหน้า เพื่อกันการ reset
   เมื่อเปลี่ยนหน้าผ่านเมนู */
(function () {
  const KEY = 'aia_sidebar_scroll';

  function restore() {
    const sb = document.querySelector('.app-sidebar');
    if (!sb) return;
    const y = sessionStorage.getItem(KEY);
    if (y !== null) sb.scrollTop = parseFloat(y) || 0;
  }

  function save() {
    const sb = document.querySelector('.app-sidebar');
    if (sb) sessionStorage.setItem(KEY, String(sb.scrollTop));
  }

  function init() {
    restore();
    const sb = document.querySelector('.app-sidebar');
    if (!sb) return;
    /* save ตอนกดเมนู (กัน scroll หาย ถ้า browser ไม่ trigger beforeunload) */
    sb.addEventListener('click', (e) => {
      if (e.target.closest('.app-sb-item, .sb-profile-row')) save();
    });
    /* save ก่อนปิดหน้า — covers refresh, navigation, tab close */
    window.addEventListener('beforeunload', save);
    window.addEventListener('pagehide', save);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
