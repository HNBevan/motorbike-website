/* ==========================================
   NAVBAR SCROLL BEHAVIOUR
========================================== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });


/* ==========================================
   THREE.JS — HERO BIKE PHOTO (textured plane)
========================================== */
(function initThree() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas.offsetWidth) {
    requestAnimationFrame(initThree); // layout not ready yet — retry next frame
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const scene  = new THREE.Scene();
  const aspect = canvas.offsetWidth / canvas.offsetHeight;
  const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  // Pivot group — everything rotates around this
  const pivot = new THREE.Group();
  scene.add(pivot);

  // Load bike image texture
  const loader = new THREE.TextureLoader();
  loader.load(
    './images/bike.png',
    function(tex) {
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const imgAspect = tex.image.width / tex.image.height;
      const planeH    = 5.2;
      const planeW    = planeH * imgAspect;

      // Main image plane
      const planeMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeH), planeMat);
      pivot.add(plane);

      startAnimation();
    },
    undefined,
    function() {
      console.warn('bike.png not found — place your bike image in the images/ folder as bike.png');
    }
  );

  // Mouse parallax
  var mouse = { x: 0, y: 0 }, tgt = { x: 0, y: 0 };
  document.addEventListener('mousemove', function(e) {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', function() {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  var time = 0;
  function startAnimation() {
    (function animate() {
      requestAnimationFrame(animate);
      time += 0.012;

      // Smooth mouse parallax
      tgt.x += (mouse.x - tgt.x) * 0.04;
      tgt.y += (mouse.y - tgt.y) * 0.04;

      // Moderate oscillating Y tilt (±12°) — keeps it feeling alive without distorting
      pivot.rotation.y = Math.sin(time * 0.35) * 0.20 + tgt.x * 0.07;
      // Slight X tilt with mouse
      pivot.rotation.x = tgt.y * 0.05;
      // Float up/down
      pivot.position.y = Math.sin(time * 0.5) * 0.18 - 0.3;
      pivot.position.x = 0.1;

      renderer.render(scene, camera);
    })();
  }
})();


/* ==========================================
   GSAP SCROLL ANIMATIONS
========================================== */
gsap.registerPlugin(ScrollTrigger);

// Hero entrance — staggered left-to-right feel
gsap.set(['.hero-eyebrow', '.hero-headline', '.hero-sub', '.hero-cta'], { y: 32 });
gsap.timeline({ delay: 0.4 })
  .to('.hero-eyebrow',  { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0)
  .to('.hero-headline', { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out' }, 0.2)
  .to('.hero-sub',      { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0.5)
  .to('.hero-cta',      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.72)
  .to('.hero-scroll-hint', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 1.3);

// Generic reveal (fade + rise)
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.fromTo(el,
    { opacity: 0, y: 44 },
    {
      opacity: 1, y: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      }
    }
  );
});

// Left reveals
gsap.utils.toArray('.reveal-left').forEach((el) => {
  gsap.fromTo(el,
    { opacity: 0, x: -50 },
    {
      opacity: 1, x: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    }
  );
});

// Right reveals
gsap.utils.toArray('.reveal-right').forEach((el) => {
  gsap.fromTo(el,
    { opacity: 0, x: 50 },
    {
      opacity: 1, x: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    }
  );
});

// Model panels — zoom scroll + floating image parallax
gsap.utils.toArray('.model-panel').forEach(function(panel) {
  var bg       = panel.querySelector('.model-panel-bg');
  var floatImg = panel.querySelector('.model-float-img');
  var inner    = panel.querySelector('.model-panel-inner');

  gsap.fromTo(bg,
    { scale: 1.12 },
    {
      scale: 1.0,
      ease: 'none',
      scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true }
    }
  );

  gsap.fromTo(floatImg,
    { y: 80 },
    {
      y: -80,
      ease: 'none',
      scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
    }
  );

  gsap.fromTo(inner,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    }
  );
});

// Feature items stagger
gsap.fromTo('.feature-item',
  { opacity: 0, y: 40 },
  {
    opacity: 1, y: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.2,
    scrollTrigger: {
      trigger: '.features-inner',
      start: 'top 85%',
      toggleActions: 'play none none none',
    }
  }
);

// Craft panels — clip-path zoom reveal + bg ken-burns
gsap.utils.toArray('.craft-panel').forEach(function(panel) {
  var bg = panel.querySelector('.craft-panel-bg');

  var panels = gsap.utils.toArray('.craft-panel');
  var idx = panels.indexOf(panel);
  var fromX = idx % 2 === 0 ? -80 : 80;
  gsap.fromTo(panel,
    { opacity: 0, x: fromX },
    {
      opacity: 1, x: 0,
      duration: 1.3,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    }
  );

  // Background parallax zoom for depth
  if (bg) {
    gsap.fromTo(bg,
      { scale: 1.18 },
      {
        scale: 1.0,
        ease: 'none',
        scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true }
      }
    );
  }

  // Text slides up on enter
  var inner = panel.querySelector('.craft-panel-inner');
  if (inner) {
    gsap.fromTo(inner,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: panel, start: 'top 75%', toggleActions: 'play none none none' }
      }
    );
  }
});

// Craft text blocks stagger
gsap.fromTo('.craft-text-block',
  { opacity: 0, y: 30 },
  {
    opacity: 1, y: 0,
    duration: 0.85,
    ease: 'power2.out',
    stagger: 0.18,
    scrollTrigger: {
      trigger: '.craft-content',
      start: 'top 82%',
      toggleActions: 'play none none none',
    }
  }
);

// Stats stagger
gsap.fromTo('.intro-stat',
  { opacity: 0, y: 28 },
  {
    opacity: 1, y: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: '.intro-inner',
      start: 'top 88%',
      toggleActions: 'play none none none',
    }
  }
);

// Number count-up animation
gsap.utils.toArray('.stat-num').forEach((el) => {
  const raw = el.textContent;
  const num = parseInt(raw);
  const suffix = raw.replace(/[0-9]/g, '');
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.fromTo({ val: 0 }, { val: num,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: function() {
          el.innerHTML = Math.round(this.targets()[0].val) + '<span>' + suffix + '</span>';
        }
      });
    }
  });
});


/* ==========================================
   HAMBURGER MENU
========================================== */
(function() {
  var burger = document.querySelector('.nav-burger');
  var menu   = document.querySelector('.nav-mobile-menu');
  var links  = document.querySelectorAll('.nav-mobile-menu a');

  burger.addEventListener('click', function() {
    var open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.forEach(function(link) {
    link.addEventListener('click', function() {
      menu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

/* ==========================================
   FORM SUBMISSION
========================================== */
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Sent ✓';
  btn.style.color = 'var(--mist)';
  btn.style.borderColor = 'var(--steel-mid)';
  e.target.reset();
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.color = '';
    btn.style.borderColor = '';
  }, 4000);
}


/* ==========================================
   SMOOTH ANCHOR SCROLL
========================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
