"""Fix mobile burger menu toàn site — override CSS clean, đảm bảo hiện + hoạt động."""
import os, re

# CSS override chung: burger visible < 900px, menu overlay full-width khi open
FIX_CSS = '''<style id="mobile-menu-fix-v2">
  /* ===== MOBILE MENU FIX ===== */
  @media (max-width: 900px) {
    /* Hiện burger */
    .dgan-burger{display:flex !important;flex-direction:column;gap:5px;cursor:pointer;background:none;border:0;padding:10px;z-index:60;position:relative}
    .dgan-burger span{width:24px;height:2px;background:#4A3429;transition:.3s;display:block;border-radius:2px}
    .dgan-burger.open span:nth-child(1){transform:rotate(45deg) translate(6px,6px)}
    .dgan-burger.open span:nth-child(2){opacity:0}
    .dgan-burger.open span:nth-child(3){transform:rotate(-45deg) translate(6px,-6px)}

    /* Menu ẩn default, khi .open thì slide xuống */
    .dgan-menu{
      display:flex !important;
      position:fixed !important;
      top:74px !important;
      left:0 !important;
      right:0 !important;
      bottom:auto !important;
      background:#fff !important;
      flex-direction:column !important;
      flex-wrap:nowrap !important;
      gap:0 !important;
      padding:12px 20px 24px !important;
      margin:0 !important;
      border-bottom:1px solid #F6EBE2 !important;
      box-shadow:0 20px 40px rgba(74,52,41,.15) !important;
      transform:translateY(-120%) !important;
      transition:transform .3s cubic-bezier(.16,1,.3,1) !important;
      z-index:59 !important;
      max-height:calc(100vh - 74px) !important;
      overflow-y:auto !important;
      align-items:stretch !important;
      font-size:16px !important;
    }
    .dgan-menu.open{transform:translateY(0) !important}
    .dgan-menu a{
      padding:14px 4px !important;
      border-bottom:1px solid #F6EBE2 !important;
      white-space:normal !important;
      font-size:16px !important;
      display:flex !important;
      align-items:center !important;
    }
    .dgan-menu a::after{display:none !important}
    .dgan-menu a.login-cta{
      margin-top:12px !important;
      align-self:flex-start !important;
      border-bottom:0 !important;
      padding:12px 24px !important;
    }
    .dgan-menu .menu-qua{background:#FFF9F5;border-radius:8px;padding-left:12px !important}

    /* .menu (gioi-thieu) — tương tự */
    .menu{
      display:flex !important;
      position:fixed !important;
      top:74px !important;
      left:0 !important;
      right:0 !important;
      background:#fff !important;
      flex-direction:column !important;
      flex-wrap:nowrap !important;
      gap:0 !important;
      padding:12px 20px 24px !important;
      border-bottom:1px solid #F6EBE2 !important;
      box-shadow:0 20px 40px rgba(74,52,41,.15) !important;
      transform:translateY(-120%) !important;
      transition:transform .3s cubic-bezier(.16,1,.3,1) !important;
      z-index:59 !important;
      max-height:calc(100vh - 74px) !important;
      overflow-y:auto !important;
      font-size:16px !important;
    }
    .menu.open{transform:translateY(0) !important}
    .menu a{
      padding:14px 4px !important;
      border-bottom:1px solid #F6EBE2 !important;
      font-size:16px !important;
    }
    .menu a::after{display:none !important}
    .burger{display:flex !important;flex-direction:column;gap:5px;cursor:pointer;background:none;border:0;padding:10px;z-index:60;position:relative}
    .burger span{width:24px;height:2px;background:#4A3429;transition:.3s;display:block;border-radius:2px}
    .burger.open span:nth-child(1){transform:rotate(45deg) translate(6px,6px)}
    .burger.open span:nth-child(2){opacity:0}
    .burger.open span:nth-child(3){transform:rotate(-45deg) translate(6px,-6px)}

    /* Trang chủ .nav — tương tự */
    .nav{
      display:flex !important;
      position:fixed !important;
      top:74px !important;
      left:0 !important;
      right:0 !important;
      background:#fff !important;
      flex-direction:column !important;
      gap:0 !important;
      padding:12px 20px 24px !important;
      border-bottom:1px solid #F6EBE2 !important;
      box-shadow:0 20px 40px rgba(74,52,41,.15) !important;
      transform:translateY(-120%) !important;
      transition:transform .3s cubic-bezier(.16,1,.3,1) !important;
      z-index:59 !important;
      max-height:calc(100vh - 74px) !important;
      overflow-y:auto !important;
    }
    .nav.open{transform:translateY(0) !important}
    .nav a{padding:14px 4px !important;border-bottom:1px solid #F6EBE2 !important;font-size:16px !important;display:block !important;opacity:1 !important}
    .nav-toggle{display:flex !important;flex-direction:column;gap:5px;cursor:pointer;background:none;border:0;padding:10px;z-index:60}
    .nav-toggle span{width:24px;height:2px;background:#4A3429;transition:.3s;display:block;border-radius:2px}

    /* Body giữ nguyên khi menu mở — không lock scroll */
    body.menu-open{overflow:hidden}

    /* Backdrop khi menu open */
    .menu-backdrop{position:fixed;inset:74px 0 0 0;background:rgba(74,52,41,.4);z-index:58;opacity:0;pointer-events:none;transition:opacity .25s}
    .menu-backdrop.show{opacity:1;pointer-events:auto}
  }
</style>'''

# JS: auto-add backdrop + close on outside click + toggle burger .open class
FIX_JS = '''<script>
// Mobile menu enhancer — auto backdrop + close on outside/link click
(function(){
  function init() {
    const burgers = document.querySelectorAll('.dgan-burger, .burger, .nav-toggle');
    const menus = document.querySelectorAll('.dgan-menu, header nav.menu, .site-header .nav');
    let backdrop = document.createElement('div');
    backdrop.className = 'menu-backdrop';
    document.body.appendChild(backdrop);

    function closeAll() {
      menus.forEach(m => m.classList.remove('open'));
      burgers.forEach(b => b.classList.remove('open'));
      backdrop.classList.remove('show');
      document.body.classList.remove('menu-open');
    }

    burgers.forEach(btn => {
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        const menu = document.querySelector('.dgan-menu, header nav.menu, .site-header .nav');
        if (!menu) return;
        const isOpen = menu.classList.toggle('open');
        this.classList.toggle('open', isOpen);
        backdrop.classList.toggle('show', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
      });
    });

    backdrop.addEventListener('click', closeAll);

    // Close khi click menu link
    menus.forEach(menu => {
      menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => setTimeout(closeAll, 100));
      });
    });

    // Close ESC
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

    // Close khi resize > 900
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeAll(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>'''

PAGES = [
    '/var/www/elsaphuong-trang-chu/index.html',
    '/var/www/elsaphuong-cau-chuyen/index.html',
    '/var/www/elsaphuong-cong-dong/index.html',
    '/var/www/elsaphuong-gioi-thieu/index.html',
    '/var/www/elsaphuong-khoahoc/index.html',
    '/var/www/elsaphuong-lien-he/index.html',
    '/var/www/elsaphuong-static-root/index.html',
    '/var/www/elsaphuong-khoe-dep-tu-goc/index.html',
    '/var/www/elsaphuong-nhan-qua/index.html',
]

for p in PAGES:
    if not os.path.exists(p): print(f'[skip missing] {p}'); continue
    with open(p, encoding='utf-8') as f: t = f.read()
    # Remove old fix nếu có
    if 'id="mobile-menu-fix-v2"' in t:
        t = re.sub(r'<style id="mobile-menu-fix-v2">.*?</style>', '', t, flags=re.DOTALL)
    # Remove old init script (nhận diện bằng comment)
    if 'Mobile menu enhancer' in t:
        t = re.sub(r'<script>\s*// Mobile menu enhancer.*?</script>', '', t, flags=re.DOTALL)
    # Chèn CSS + JS trước </body>
    if '</body>' in t:
        t = t.replace('</body>', FIX_CSS + '\n' + FIX_JS + '\n</body>', 1)
        with open(p, 'w', encoding='utf-8') as f: f.write(t)
        print(f'[ok] {p}')
    else:
        print(f'[skip no body] {p}')
print('done')
