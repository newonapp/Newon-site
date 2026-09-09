(() => {
  const root = document.querySelector(".ps-page");
  if (!root) return;

  root.querySelectorAll(".ps-faq__item").forEach((item) => {
    const btn = item.querySelector(".ps-faq__q");
    const answer = item.querySelector(".ps-faq__a");
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

  const reveals = root.querySelectorAll("[data-ps-reveal]");
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
