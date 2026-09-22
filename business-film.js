(function () {
  var film = document.querySelector("[data-bz-film]");
  if (film) {
    requestAnimationFrame(function () {
      film.classList.add("is-ready");
    });
  }
})();
