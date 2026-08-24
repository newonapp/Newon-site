(function () {
  "use strict";
  var input = document.querySelector("[data-tools-search]");
  var grid = document.querySelector("[data-tools-grid]");
  if (!input || !grid) return;
  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    grid.querySelectorAll(".hub-card").forEach(function (card) {
      var text = card.textContent.toLowerCase();
      card.style.display = !q || text.indexOf(q) !== -1 ? "" : "none";
    });
  });
})();
