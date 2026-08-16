(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    var nodes = document.querySelectorAll(".pf-reveal");
    if (nodes.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-visible");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );
      nodes.forEach(function (el) {
        io.observe(el);
      });
    } else {
      nodes.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  } else {
    document.querySelectorAll(".pf-reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var toggle = document.querySelector("[data-pf-nav-toggle]");
  var drawer = document.getElementById("pf-mobile-nav");
  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var open = !drawer.hasAttribute("hidden");
      if (open) {
        drawer.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        drawer.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        drawer.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll('a[href*="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href") || "";
      var hash = "";
      if (href.charAt(0) === "#") hash = href.slice(1);
      else {
        try {
          var u = new URL(href, window.location.origin);
          if (u.pathname === window.location.pathname) hash = u.hash.replace("#", "");
        } catch (err) {}
      }
      if (!hash) return;
      var target = document.getElementById(hash);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", "#" + hash);
    });
  });

  var vcard = document.querySelector("[data-save-vcard]");
  if (vcard) {
    vcard.addEventListener("click", function (e) {
      var ua = navigator.userAgent || "";
      var ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      if (ios) return;
      e.preventDefault();
      var href = vcard.getAttribute("href");
      var a = document.createElement("a");
      a.href = href;
      a.setAttribute("download", "nawon-kyung.vcf");
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }
})();
