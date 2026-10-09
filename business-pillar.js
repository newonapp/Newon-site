(() => {
  const root = document.querySelector(".bp-page");
  if (!root) return;

  const explore = root.querySelector("[data-bp-explore]");
  const jumps = [...root.querySelectorAll("[data-bp-jump]")];
  const tabs = explore ? [...explore.querySelectorAll("[data-bp-tab]")] : [];
  const panels = explore ? [...explore.querySelectorAll("[data-bp-panel]")] : [];

  const syncJumps = (index) => {
    jumps.forEach((btn, i) => {
      const on = i === index;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-current", on ? "true" : "false");
    });
  };

  const show = (index, { scroll = false, updateHash = true } = {}) => {
    if (!panels.length || index < 0 || index >= panels.length) return;

    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      const on = i === index;
      panel.classList.toggle("is-active", on);
      if (on) {
        panel.removeAttribute("hidden");
        panel.hidden = false;
        panel.setAttribute("aria-hidden", "false");
      } else {
        panel.setAttribute("hidden", "");
        panel.hidden = true;
        panel.setAttribute("aria-hidden", "true");
      }
    });
    syncJumps(index);

    if (updateHash) {
      try {
        history.replaceState(null, "", `#svc-${index}`);
      } catch (_) {
        /* ignore */
      }
    }

    if (scroll) {
      const target = document.getElementById("services") || panels[index];
      const y = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
  };

  if (explore) {
    explore.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-bp-tab]");
      if (!tab || !explore.contains(tab)) return;
      e.preventDefault();
      const i = Number(tab.getAttribute("data-bp-tab"));
      if (Number.isNaN(i)) return;
      show(i, { scroll: false });
    });

    tabs.forEach((tab) => {
      tab.addEventListener("keydown", (e) => {
        const i = Number(tab.getAttribute("data-bp-tab"));
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          const next = Math.min(tabs.length - 1, i + 1);
          tabs[next].focus();
          show(next);
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = Math.max(0, i - 1);
          tabs[prev].focus();
          show(prev);
        } else if (e.key === "Home") {
          e.preventDefault();
          tabs[0].focus();
          show(0);
        } else if (e.key === "End") {
          e.preventDefault();
          tabs[tabs.length - 1].focus();
          show(tabs.length - 1);
        }
      });
    });
  }

  jumps.forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-bp-jump"));
      if (Number.isNaN(i)) return;
      show(i, { scroll: true });
    });
  });

  const fromHash = () => {
    const m = location.hash.match(/^#svc-(\d+)$/);
    if (!m) return;
    const i = Number(m[1]);
    if (i >= 0 && i < panels.length) show(i, { scroll: true, updateHash: false });
  };
  fromHash();
  window.addEventListener("hashchange", fromHash);

  /* Subtle flow highlight (automation hero) */
  const flow = root.querySelector("[data-bp-flow]");
  if (flow && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const steps = [...flow.querySelectorAll(".bp-flow__step")];
    let i = 0;
    const tick = () => {
      steps.forEach((s, idx) => s.classList.toggle("is-on", idx === i));
      i = (i + 1) % steps.length;
    };
    tick();
    setInterval(tick, 1100);
  }

  /* FAQ accordion — closed by default; click question to toggle */
  root.querySelectorAll(".bp-faq__item").forEach((item) => {
    const btn = item.querySelector(".bp-faq__q");
    const answer = item.querySelector(".bp-faq__a");
    if (!btn || !answer) return;

    item.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    answer.hidden = true;

    btn.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      answer.hidden = !open;
    });
  });

  /* Reveal on scroll */
  const reveals = root.querySelectorAll("[data-bp-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }
})();
