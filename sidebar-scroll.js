/* sidebar-scroll.js
   Shared UX utilities — โหลดในทุกหน้าที่มี sidebar
   1. จำตำแหน่ง scroll ของ .app-sidebar ระหว่างหน้า
   2. ป้องกัน mouse wheel เปลี่ยนค่าใน <input type="number"> โดยไม่ตั้งใจ
   3. Register Service Worker — auto cache busting (ไม่ต้องกด Ctrl+Shift+R) */

/* Register Service Worker — network-first strategy */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      /* Force check update ทุกครั้งที่หน้าเปิด */
      reg.update();
      /* ถ้ามี update ใหม่ — บังคับ activate + reload ครั้งเดียว */
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'activated' && navigator.serviceWorker.controller) {
            /* SW ใหม่ activate แล้ว — reload เพื่อให้ controller คุมหน้า */
            window.location.reload();
          }
        });
      });
    }).catch(() => { /* SW ไม่ support — ignore */ });
  });
}

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

  /* แสดงรูปลูกค้าใน mini-avatar ของ client picker (ใช้ในทุกหน้า) */
  function updateClientMiniAvatar() {
    const av = document.getElementById('cp-mini-avatar');
    const sel = document.getElementById('client-select');
    if (!av) return;
    const cid = sel ? sel.value : null;
    if (!cid) { av.innerHTML = '👤'; return; }
    try {
      const uid = localStorage.getItem('aia_currentUser');
      const users = JSON.parse(localStorage.getItem('aia_users') || '[]');
      const u = users.find(x => x.id === uid);
      const c = (u && u.data && u.data.clients || []).find(x => x.id === cid);
      if (c && c.photo) {
        av.innerHTML = `<img src="${c.photo}" alt="">`;
      } else if (c) {
        av.textContent = (c.firstName || '?').charAt(0).toUpperCase();
      } else {
        av.innerHTML = '👤';
      }
    } catch (e) { av.innerHTML = '👤'; }
  }

  function init() {
    restore();
    const sb = document.querySelector('.app-sidebar');
    if (sb) {
      sb.addEventListener('click', (e) => {
        if (e.target.closest('.app-sb-item, .sb-profile-row')) save();
      });
    }
    window.addEventListener('beforeunload', save);
    window.addEventListener('pagehide', save);

    /* ป้องกัน wheel เปลี่ยนค่า number input ที่ focus อยู่
       (browser default — scroll mouse บน number input ที่ focus = ค่าขึ้น/ลง)
       แก้โดย blur input ทันทีเมื่อ wheel — ค่าไม่เปลี่ยน scroll ปกติ */
    document.addEventListener('wheel', (e) => {
      const el = document.activeElement;
      if (el && el.tagName === 'INPUT' && el.type === 'number') {
        el.blur();
      }
    }, { passive: true });

    /* Mini avatar — รูปลูกค้าใน client picker */
    const sel = document.getElementById('client-select');
    if (sel) {
      sel.addEventListener('change', updateClientMiniAvatar);
      /* Initial render — page อาจ render select option ทีหลัง ใช้ delay สั้นๆ */
      setTimeout(updateClientMiniAvatar, 100);
      setTimeout(updateClientMiniAvatar, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
