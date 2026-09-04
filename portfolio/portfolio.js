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

  var pfFilters = document.querySelector("[data-portfolio-filters]");
  if (pfFilters) {
    var pfItems = document.querySelectorAll("[data-pf-type]");
    pfFilters.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-pf-filter]");
      if (!btn) return;
      var f = btn.getAttribute("data-pf-filter");
      pfFilters.querySelectorAll(".hub-filter").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      pfItems.forEach(function (el) {
        var t = el.getAttribute("data-pf-type");
        el.style.display = f === "all" || t === f ? "" : "none";
      });
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


  var contact = document.getElementById("contact");
  var explore = document.querySelector(".pf-explore");
  function revealCxSection(el) {
    el.classList.add("is-in");
  }
  function bindCxReveal(el) {
    if (!el) return;
    if (reduce) revealCxSection(el);
    else if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              revealCxSection(en.target);
              cio.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      cio.observe(el);
    } else revealCxSection(el);
  }
  bindCxReveal(contact);
  bindCxReveal(explore);

  if (contact && contact.classList.contains("pf-cx")) {
    function fallbackCopy(text, done) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (err) {}
      ta.remove();
    }

    contact.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy") || "";
        var label = btn.querySelector("[data-copy-label]");
        var orig = label ? label.textContent : "";
        var copied = btn.getAttribute("data-copied") || "Copied";
        function done() {
          btn.classList.add("is-copied");
          if (label) label.textContent = copied;
          window.setTimeout(function () {
            btn.classList.remove("is-copied");
            if (label) label.textContent = orig;
          }, 1500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            fallbackCopy(text, done);
          });
        } else fallbackCopy(text, done);
      });
    });
  }
})();
