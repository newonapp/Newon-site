(() => {
  const hero = document.querySelector("#home.site-shell #top.hero--film");
  if (hero) requestAnimationFrame(() => hero.classList.add("is-ready"));
})();
