/* AYA LAAREJ — interactions.js : filters, horizontal strip controls, lightbox */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && !reduced;

  /* ---------- category filters (work grid + gallery masonry) ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var wrap = document.querySelector(group.getAttribute("data-filter-group"));
    if (!wrap) return;
    var items = Array.prototype.slice.call(wrap.querySelectorAll("[data-cat],[data-type]"));
    group.querySelectorAll(".filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".filter").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var f = btn.getAttribute("data-filter");
        var show = [], hide = [];
        items.forEach(function (it) {
          var k = it.getAttribute("data-cat") || it.getAttribute("data-type") || "";
          (f === "all" || k === f ? show : hide).push(it);
        });
        function apply() {
          hide.forEach(function (it) { it.classList.add("hide"); });
          show.forEach(function (it) { it.classList.remove("hide"); });
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        }
        if (hasGsap) {
          gsap.to(items, {
            autoAlpha: 0, y: 14, scale: 0.985, duration: 0.26, ease: "power2.in", stagger: 0.02, overwrite: true,
            onComplete: function () {
              apply();
              gsap.fromTo(show, { autoAlpha: 0, y: 24, scale: 0.985 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out", stagger: 0.05, overwrite: true });
            }
          });
        } else { apply(); }
      });
    });
  });

  /* ---------- horizontal journal strip controls ---------- */
  document.querySelectorAll(".hctrl").forEach(function (c) {
    var holder = c.closest(".hscroll-wrap") || c.parentElement;
    var sc = holder ? holder.querySelector(".hscroll") : null;
    if (!sc) return;
    c.querySelectorAll(".hbtn").forEach(function (b) {
      b.addEventListener("click", function () {
        var item = sc.querySelector(".hitem");
        var w = item ? item.getBoundingClientRect().width + 20 : 320;
        sc.scrollBy({ left: (b.getAttribute("data-dir") === "next" ? 1 : -1) * w * 1.6, behavior: reduced ? "auto" : "smooth" });
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var items = Array.prototype.slice.call(document.querySelectorAll(".lb-item"));
    /* project-page figures also open in the lightbox */
    /* technical drawings + annotated plans open full-screen so the cotes stay legible */
    document.querySelectorAll(".tech-sheet img, .ab-plan img").forEach(function (im) {
      var host = im.parentElement;
      if (!host || host.closest(".lb-item")) return;
      host.classList.add("lb-item");
      host.setAttribute("role", "button");
      host.setAttribute("tabindex", "0");
      host.setAttribute("data-cursor", "view");
      host.setAttribute("aria-label", "Agrandir le plan");
      var fc = host.querySelector(".cap");
      host.setAttribute("data-cap", fc ? fc.textContent.trim() : "Plan technique");
      host.setAttribute("data-full", im.getAttribute("src"));
      host.setAttribute("data-plan", "1");
      items.push(host);
    });
    document.querySelectorAll(".p-sec .bimg").forEach(function (b) {
      if (b.closest(".lb-item")) return;
      b.classList.add("lb-item");
      b.setAttribute("role", "button");
      b.setAttribute("tabindex", "0");
      b.setAttribute("data-cursor", "view");
      b.setAttribute("aria-label", "Enlarge image");
      items.push(b);
    });
    var img = lb.querySelector("#lbImg");
    var cap = lb.querySelector("#lbCap");
    var cnt = lb.querySelector("#lbCount");
    var cur = 0, isOpen = false;
    function capOf(it) {
      var c = it.getAttribute("data-cap");
      if (c) return c;
      var fig = it.closest("figure");
      var fc = fig ? fig.querySelector(".cap, .sw-name, figcaption") : null;
      return fc ? fc.textContent.trim() : "";
    }
    var stage = lb.querySelector(".lb-stage");
    var planBar = lb.querySelector("#lbPlanBar");
    var zoom = 1;
    function applyZoom() {
      img.style.width = (zoom * 100) + "%";
      img.style.maxWidth = "none";
      img.style.maxHeight = "none";
    }
    function show(i) {
      cur = (i + items.length) % items.length;
      var it = items[cur];
      var im = it.querySelector("img");
      var isPlan = it.getAttribute("data-plan") === "1";
      img.src = it.getAttribute("data-full") || (im ? im.src : "");
      img.alt = capOf(it);
      cap.textContent = capOf(it);
      cnt.textContent = (cur + 1) + " / " + items.length;
      lb.classList.toggle("plan-mode", isPlan);
      stage.classList.toggle("plan-mode", isPlan);
      zoom = 1;
      img.style.width = "";
      img.style.maxWidth = "";
      img.style.maxHeight = "";
      if (isPlan && stage) { stage.scrollLeft = 0; stage.scrollTop = 0; }
    }
    if (planBar) {
      planBar.addEventListener("click", function (e) {
        var b = e.target.closest("[data-lb-zoom]");
        if (!b) return;
        e.preventDefault(); e.stopPropagation();
        var k = b.getAttribute("data-lb-zoom");
        if (k === "in") zoom = Math.min(4, zoom * 1.5);
        else if (k === "out") zoom = Math.max(1, zoom / 1.5);
        else zoom = 1;
        applyZoom();
      });
    }
    function openLb(i) {
      isOpen = true;
      lb.classList.add("open");
      if (hasGsap) {
        gsap.fromTo(lb, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
        gsap.fromTo(".lb-stage img", { scale: 0.96, y: 12 }, { scale: 1, y: 0, duration: 0.55, ease: "power3.out" });
      } else { lb.style.opacity = "1"; }
      if (window.__lenis) window.__lenis.stop();
      document.body.style.overflow = "hidden";
      show(i);
    }
    function closeLb() {
      isOpen = false;
      if (hasGsap) {
        gsap.to(lb, { autoAlpha: 0, duration: 0.3, onComplete: function () { lb.classList.remove("open"); lb.style.opacity = ""; } });
      } else { lb.classList.remove("open"); lb.style.opacity = ""; }
      if (window.__lenis) window.__lenis.start();
      document.body.style.overflow = "";
    }
    items.forEach(function (it, i) {
      it.addEventListener("click", function (e) { e.preventDefault(); openLb(i); });
      it.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(i); }
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(cur - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") show(cur - 1);
      else if (e.key === "ArrowRight") show(cur + 1);
    });
  }
})();


/* ---------- nav: hide on scroll down, reveal on scroll up ---------- */
(function () {
  var nav = document.querySelector(".nav");
  if (!nav) return;
  var last = 0;
  function onY(y) {
    if (y > 160 && y > last + 2) nav.classList.add("nav-hide");
    else if (y < last - 2 || y <= 160) nav.classList.remove("nav-hide");
    last = y;
  }
  if (window.__lenis) window.__lenis.on("scroll", function (e) { onY(e.scroll || 0); });
  window.addEventListener("scroll", function () { onY(window.scrollY || 0); }, { passive: true });
})();
