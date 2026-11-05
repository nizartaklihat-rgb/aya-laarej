/* AYA LAAREJ — core.js : preloader, Lenis smooth scroll, nav, menu,
   page transitions, reveals, parallax, cursor, misc */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  if (hasGsap && !reduced) { doc.classList.add("anim"); } else { doc.classList.add("no-anim"); }

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis && !reduced) {
    if (hasGsap) {
      lenis = new window.Lenis({ autoRaf: false, duration: 1.15, smoothWheel: true });
      lenis.on("scroll", window.ScrollTrigger ? ScrollTrigger.update : function () {});
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      lenis = new window.Lenis({ duration: 1.15 });
    }
  }
  window.__lenis = lenis;

  var wipe = document.querySelector(".page-wipe");
  if (hasGsap && !reduced && wipe) { gsap.set(wipe, { scaleY: 0 }); }

  /* ---------- preloader + intro ---------- */
  var pre = document.querySelector(".preloader");
  function heroIn() {
    if (!hasGsap || reduced) return;
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    var heroImg = document.querySelector(".hero-media img, .p-hero-media img");
    if (heroImg) {
      tl.to(heroImg, { scale: 1, duration: 2, ease: "power2.out" }, 0);
    }
    var lines = document.querySelectorAll(".hero-title .hline-in, .p-title .hline-in, .page-title .hline-in");
    if (lines.length) { tl.to(lines, { y: 0, duration: 1.1, stagger: 0.09 }, 0.15); }
    var fade = document.querySelectorAll(".hero-eyebrow, .hero-cta, .hero-note, .hero-side, .p-idx, .p-tagline, .p-hero-meta, .page-hero .sec-label, .page-hero .page-lead");
    if (fade.length) { tl.fromTo(fade, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06 }, 0.35); }
  }
  function boot() {
    if (!hasGsap || reduced || !pre) { if (pre) pre.style.display = "none"; heroIn(); return; }
    var visited = false;
    try { visited = sessionStorage.getItem("al-visited") === "1"; } catch (e) {}
    var letters = pre.querySelectorAll(".pl-name span");
    var sub = pre.querySelector(".pl-sub");
    var count = pre.querySelector(".pl-count");
    var tl = gsap.timeline({
      onComplete: function () {
        pre.classList.add("done");
        pre.style.display = "none";
        try { sessionStorage.setItem("al-visited", "1"); } catch (e) {}
        heroIn();
      }
    });
    tl.to(letters, { y: 0, duration: 0.9, ease: "power4.out", stagger: 0.05 }, 0);
    if (sub) tl.to(sub, { autoAlpha: 1, duration: 0.5 }, 0.4);
    if (count && !visited) {
      var o = { v: 0 };
      tl.to(o, {
        v: 100, duration: 1.15, ease: "power2.inOut",
        onUpdate: function () { count.textContent = String(Math.round(o.v)).padStart(3, "0"); }
      }, 0.1);
    } else if (count) { count.textContent = "100"; }
    tl.to(pre, { yPercent: -100, duration: visited ? 0.55 : 0.9, ease: "expo.inOut" }, visited ? 0.25 : 1.45);
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); } else { boot(); }

  /* ---------- scroll reveals ---------- */
  if (hasGsap && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".rv").forEach(function (el) {
      gsap.to(el, {
        autoAlpha: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    gsap.utils.toArray(".rv-img img").forEach(function (img) {
      var fig = img.closest(".rv-img") || img.parentElement;
      gsap.to(img, {
        scale: 1, duration: 1.5, ease: "power3.out",
        scrollTrigger: { trigger: fig, start: "top 92%", once: true }
      });
    });
    /* parallax on tall heroes / wide feature blocks */
    gsap.utils.toArray(".parallax").forEach(function (w) {
      var img = w.querySelector("img");
      if (!img) return;
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: "none",
        scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* ---------- nav state, to-top, clock ---------- */
  var nav = document.querySelector(".nav");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("scrolled", y > 30);
    if (toTop) toTop.classList.toggle("show", y > window.innerHeight * 0.9);
  }
  if (lenis) lenis.on("scroll", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }
  var clock = document.getElementById("clock");
  function tick() {
    if (!clock) return;
    try {
      clock.textContent = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca"
      }).format(new Date());
    } catch (e) { clock.textContent = ""; }
  }
  tick(); setInterval(tick, 30000);

  /* ---------- burger / overlay menu ---------- */
  var burger = document.getElementById("burger");
  var overlay = document.getElementById("menuOverlay");
  var menuOpen = false;
  function setMenu(open) {
    if (!burger || !overlay) return;
    menuOpen = open;
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    overlay.classList.toggle("open", open);
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    if (hasGsap && !reduced) {
      if (open) {
        gsap.fromTo(overlay, { y: "-102%" }, { y: "0%", duration: 0.8, ease: "expo.inOut" });
        gsap.fromTo(".menu-link .menu-txt", { yPercent: 120 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.07, delay: 0.28, clearProps: "transform" });
        gsap.fromTo(".menu-foot", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.5 });
      } else {
        gsap.to(overlay, { y: "-102%", duration: 0.65, ease: "expo.inOut" });
      }
    } else {
      overlay.style.transform = open ? "translateY(0)" : "translateY(-102%)";
    }
  }
  if (burger) burger.addEventListener("click", function () { setMenu(!menuOpen); });

  /* ---------- link handling: anchors + page transitions ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-pt]");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") {
      if (href && href.charAt(0) === "#") {
        var t = document.querySelector(href);
        if (t) {
          e.preventDefault();
          if (menuOpen) setMenu(false);
          if (lenis) lenis.scrollTo(t, { offset: -70, duration: 1.3 });
          else t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        }
      }
      return;
    }
    var u;
    try { u = new URL(href, location.href); } catch (err) { return; }
    if (u.origin !== location.origin) return; /* external links open normally */
    e.preventDefault();
    if (menuOpen) setMenu(false);
    if (u.pathname === location.pathname) {
      var target = u.hash ? document.querySelector(u.hash) : null;
      if (target) {
        if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.3 });
        else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      } else if (lenis) { lenis.scrollTo(0); } else { window.scrollTo(0, 0); }
      history.replaceState(null, "", u.hash || u.pathname);
      return;
    }
    if (!hasGsap || reduced || !wipe) { location.href = href; return; }
    gsap.timeline({ onComplete: function () { location.href = href; } })
      .set(wipe, { transformOrigin: "top", scaleY: 0 })
      .to(wipe, { scaleY: 1, duration: 0.55, ease: "expo.in" });
  });

  /* ---------- marquee: pause offscreen ---------- */
  if ("IntersectionObserver" in window) {
    document.querySelectorAll(".marquee").forEach(function (m) {
      new IntersectionObserver(function (en) {
        en.forEach(function (x) { m.classList.toggle("paused", !x.isIntersecting); });
      }, { threshold: 0 }).observe(m);
    });
  }

  /* ---------- custom cursor ---------- */
  var cursor = document.querySelector(".cursor");
  if (cursor && window.matchMedia("(pointer:fine)").matches && !reduced) {
    var dot = cursor.querySelector(".cursor-dot");
    var ring = cursor.querySelector(".cursor-ring");
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!cursor.classList.contains("live")) cursor.classList.add("live");
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      var el = document.elementFromPoint(e.clientX, e.clientY);
      var dark = el && el.closest(".hero,.p-hero,.contact,.site-footer,.menu-overlay,.lightbox,.preloader");
      cursor.classList.toggle("on-dark", !!dark);
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest('[data-cursor="view"]')) { cursor.classList.add("is-view"); cursor.classList.remove("is-link"); }
      else if (e.target.closest("a,button,.filter,.chip")) { cursor.classList.add("is-link"); cursor.classList.remove("is-view"); }
      else { cursor.classList.remove("is-link", "is-view"); }
    });
  }
})();
