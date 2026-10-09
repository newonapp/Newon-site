(function () {
  var film = document.querySelector("[data-bz-film]");
  if (!film) return;
  function reveal() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        setTimeout(function () {
          film.classList.add("is-ready");
        }, 240);
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reveal);
  } else {
    reveal();
  }
})();
