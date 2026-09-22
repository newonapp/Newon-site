(function () {
  var film = document.querySelector("[data-eco-film]");
  if (film) {
    requestAnimationFrame(function () {
      film.classList.add("is-ready");
    });
  }
})();
