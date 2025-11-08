// assets/partials.js  (NO lleves <script>...</script> aquí)

(function () {
  async function loadPartials() {
    const slots = document.querySelectorAll('[data-include]');

    // Cargar todos los parciales
    await Promise.all(
      Array.from(slots).map(async (el) => {
        const url = el.getAttribute('data-include');
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          const html = await res.text();
          el.innerHTML = html;
        } catch (e) {
          console.error('No se pudo cargar', url, e);
        }
      })
    );

    // Lógica común tras insertar header/footer
    initCommonUI();

    // Hook opcional por página
    if (typeof window.afterPartialsLoaded === 'function') {
      try {
        window.afterPartialsLoaded();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  function initCommonUI() {
    // Burger
    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        const open = menu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // Link activo según <body data-page="...">
    const page = document.body.getAttribute('data-page');
    if (page) {
      const active = document.querySelector(`.menu a[data-page="${page}"]`);
      if (active) active.classList.add('is-active');
    }

    // FAB WhatsApp: subir cuando se ve el footer
    const fab = document.getElementById('fabWa');
    const footer = document.querySelector('footer.footer');
    if (fab && footer) {
      function setStickyBottomByHeight() {
        const h = fab.offsetHeight || 48;
        const rise = h * 3 + 32; // 3x altura + margen
        fab.style.setProperty('--fab-sticky-bottom', rise + 'px');
      }
      setStickyBottomByHeight();
      window.addEventListener('resize', setStickyBottomByHeight);

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) fab.classList.add('stick-up');
              else fab.classList.remove('stick-up');
            });
          },
          { root: null, threshold: 0.01 }
        );
        io.observe(footer);
      }
    }
  }

  // Asegurar que corra cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPartials);
  } else {
    loadPartials();
  }

  // Aviso útil si abres como file://
  if (location.protocol === 'file:') {
    console.warn(
      'Estás abriendo con file:// — fetch() puede bloquear parciales locales. Usa un servidor local (VSCode Live Server, "npx serve", etc.).'
    );
  }
})();
