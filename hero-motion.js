/* NEWON moving first screens (scripts/apply-hero-motion.mjs).
 * Lifts each film backdrop up to the top of <main> so the breadcrumb strip above the hero
 * sits on the film too (no white band under the header). Playback itself is film-keep.js. */
(function () {
  function docTop(el) {
    var y = 0;
    for (var e = el; e; e = e.offsetParent) y += e.offsetTop || 0;
    return y;
  }

  function lift() {
    var hosts = document.querySelectorAll("[data-hm-film]");
    for (var i = 0; i < hosts.length; i++) {
      var host = hosts[i];
      var main = host.closest("main") || host.parentElement;
      if (!main) continue;
      var d = Math.max(0, Math.round(docTop(host) - docTop(main)));
      // Only lift over a breadcrumb-sized strip; never reach far up the page.
      if (d > 360) d = 0;
      // Hero that starts under a fixed/sticky product header (404: HUMAN): start the film below it
      // so the header keeps its own look.
      if (d === 0) {
        var hdr = document.querySelector(".ox-header, header.site-header");
        if (hdr) {
          var pos = getComputedStyle(hdr).position;
          if (pos === "fixed" || pos === "sticky") {
            var over = Math.round(hdr.getBoundingClientRect().bottom - docTop(host));
            if (over > 4 && over < 200) d = -over;
          }
        }
      }
      host.style.setProperty("--hm-lift", d + "px");
      main.classList.toggle("hm-lifted", d > 0);
    }
  }

  var raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      lift();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", lift);
  else lift();
  window.addEventListener("load", lift);
  window.addEventListener("resize", schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lift, function () {});
  // Late layout shifts above the hero (web fonts, chrome injection) change the strip height.
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(schedule);
    var watch = function () {
      var hosts = document.querySelectorAll("[data-hm-film]");
      for (var i = 0; i < hosts.length; i++) {
        ro.observe(hosts[i]);
        var main = hosts[i].closest("main");
        if (main) ro.observe(main);
        if (hosts[i].previousElementSibling) ro.observe(hosts[i].previousElementSibling);
      }
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
    else watch();
  }
})();
