(function () {
  var film = document.querySelector("[data-st-film]");
  if (film) {
    requestAnimationFrame(function () {
      film.classList.add("is-ready");
    });
  }
})();
